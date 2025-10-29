import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { sendWhatsAppMessage, getWhatsAppTemplate } from "./whatsapp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Custom procedure for admin-only access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso apenas para administradores' });
  }
  return next({ ctx });
});

// Custom procedure for gestor-only access
const gestorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'gestor') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso apenas para gestores' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);
        
        if (!user || !user.password) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
        }

        const validPassword = await bcrypt.compare(input.password, user.password);
        if (!validPassword) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
        }

        if (!user.active) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Utilizador inativo' });
        }

        // Create session cookie
        const token = jwt.sign(
          { userId: user.id, openId: user.openId, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: '7d' }
        );
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // === USERS ===
  users: router({
    list: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    create: adminProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(['admin', 'loja', 'gestor']),
        whatsapp: z.string().optional(),
        lojaId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        await db.createUser({
          openId: `local_${input.username}_${Date.now()}`,
          username: input.username,
          password: hashedPassword,
          name: input.name || null,
          email: input.email || null,
          role: input.role,
          whatsapp: input.whatsapp || null,
          lojaId: input.lojaId || null,
          active: true,
        });

        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        username: z.string().optional(),
        password: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),
        role: z.enum(['admin', 'loja', 'gestor']).optional(),
        whatsapp: z.string().optional(),
        lojaId: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, password, ...rest } = input;
        
        const updateData: any = { ...rest };
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }

        await db.updateUser(id, updateData);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.id);
        return { success: true };
      }),
  }),

  // === LOJAS ===
  lojas: router({
    list: protectedProcedure.query(async () => {
      return db.getAllLojas();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLojaById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        nome: z.string(),
        codigo: z.string(),
        contacto: z.string().optional(),
        morada: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createLoja({
          nome: input.nome,
          codigo: input.codigo,
          contacto: input.contacto || null,
          morada: input.morada || null,
          active: true,
        });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        codigo: z.string().optional(),
        contacto: z.string().optional(),
        morada: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLoja(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLoja(input.id);
        return { success: true };
      }),
  }),

  // === PEDIDOS ===
  pedidos: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === 'admin' || ctx.user.role === 'gestor') {
        return db.getAllPedidos();
      } else if (ctx.user.role === 'loja' && ctx.user.lojaId) {
        return db.getPedidosByLoja(ctx.user.lojaId);
      }
      return [];
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const pedido = await db.getPedidoById(input.id);
        
        if (!pedido) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        }

        // Check permissions
        if (ctx.user.role === 'loja' && pedido.lojaId !== ctx.user.lojaId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para ver este pedido' });
        }

        return pedido;
      }),

    create: protectedProcedure
      .input(z.object({
        tipo: z.enum(['servico', 'cobertura_ferias', 'outros']),
        dataInicio: z.string(),
        dataFim: z.string().optional(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'loja' || !ctx.user.lojaId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas lojas podem criar pedidos' });
        }

        const result = await db.createPedido({
          lojaId: ctx.user.lojaId,
          tipo: input.tipo,
          dataInicio: new Date(input.dataInicio),
          dataFim: input.dataFim ? new Date(input.dataFim) : null,
          descricao: input.descricao || null,
          estado: 'pendente_admin',
          criadoPor: ctx.user.id,
        });

        const pedidoId = Number((result as any).insertId);

        // Create aprovacao record
        await db.createAprovacao({
          pedidoId,
          estadoAdmin: 'pendente',
          estadoGestor: 'pendente',
        });

        // Send WhatsApp notification to admin
        const loja = await db.getLojaById(ctx.user.lojaId);
        const admins = (await db.getAllUsers()).filter(u => u.role === 'admin');
        
        for (const admin of admins) {
          if (admin.whatsapp) {
            const message = getWhatsAppTemplate('novo_pedido', {
              lojaNome: loja?.nome || 'Desconhecida',
              tipo: input.tipo,
              dataInicio: new Date(input.dataInicio).toLocaleDateString('pt-PT'),
              descricao: input.descricao,
              portalUrl: process.env.VITE_APP_URL || 'https://portal-apoio-lojas.manus.space',
            });

            const sent = await sendWhatsAppMessage({
              to: admin.whatsapp,
              message,
            });

            await db.createNotificacao({
              userId: admin.id,
              pedidoId,
              tipo: 'novo_pedido',
              whatsapp: admin.whatsapp,
              mensagem: message,
              enviada: sent,
              enviadaEm: sent ? new Date() : null,
            });
          }
        }

        return { success: true, pedidoId };
      }),

    aprovarAdmin: adminProcedure
      .input(z.object({
        pedidoId: z.number(),
        aprovado: z.boolean(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const pedido = await db.getPedidoById(input.pedidoId);
        if (!pedido) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        }

        const novoEstado = input.aprovado ? 'aprovado_admin' : 'rejeitado';
        await db.updatePedido(input.pedidoId, { estado: novoEstado });

        const aprovacao = await db.getAprovacaoByPedidoId(input.pedidoId);
        if (aprovacao) {
          await db.updateAprovacao(aprovacao.id, {
            adminId: ctx.user.id,
            estadoAdmin: input.aprovado ? 'aprovado' : 'rejeitado',
            observacoesAdmin: input.observacoes || null,
            dataAprovacaoAdmin: new Date(),
          });
        }

        const loja = await db.getLojaById(pedido.lojaId);

        if (input.aprovado) {
          // Send to gestor
          const gestores = (await db.getAllUsers()).filter(u => u.role === 'gestor');
          
          for (const gestor of gestores) {
            if (gestor.whatsapp) {
              const message = getWhatsAppTemplate('pedido_aprovado', {
                lojaNome: loja?.nome || 'Desconhecida',
                tipo: pedido.tipo,
                dataInicio: pedido.dataInicio.toLocaleDateString('pt-PT'),
                observacoes: input.observacoes,
                portalUrl: process.env.VITE_APP_URL || 'https://portal-apoio-lojas.manus.space',
              });

              const sent = await sendWhatsAppMessage({
                to: gestor.whatsapp,
                message,
              });

              await db.createNotificacao({
                userId: gestor.id,
                pedidoId: input.pedidoId,
                tipo: 'pedido_aprovado',
                whatsapp: gestor.whatsapp,
                mensagem: message,
                enviada: sent,
                enviadaEm: sent ? new Date() : null,
              });
            }
          }
        } else {
          // Send rejection to loja
          const lojaUser = await db.getUserById(pedido.criadoPor);
          if (lojaUser?.whatsapp) {
            const message = getWhatsAppTemplate('pedido_rejeitado', {
              lojaNome: loja?.nome || 'Desconhecida',
              tipo: pedido.tipo,
              dataInicio: pedido.dataInicio.toLocaleDateString('pt-PT'),
              observacoes: input.observacoes,
              portalUrl: process.env.VITE_APP_URL || 'https://portal-apoio-lojas.manus.space',
            });

            const sent = await sendWhatsAppMessage({
              to: lojaUser.whatsapp,
              message,
            });

            await db.createNotificacao({
              userId: lojaUser.id,
              pedidoId: input.pedidoId,
              tipo: 'pedido_rejeitado',
              whatsapp: lojaUser.whatsapp,
              mensagem: message,
              enviada: sent,
              enviadaEm: sent ? new Date() : null,
            });
          }
        }

        return { success: true };
      }),

    confirmarGestor: gestorProcedure
      .input(z.object({
        pedidoId: z.number(),
        confirmado: z.boolean(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const pedido = await db.getPedidoById(input.pedidoId);
        if (!pedido) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        }

        if (pedido.estado !== 'aprovado_admin') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pedido não está aprovado pelo admin' });
        }

        const novoEstado = input.confirmado ? 'confirmado' : 'cancelado';
        await db.updatePedido(input.pedidoId, { estado: novoEstado });

        const aprovacao = await db.getAprovacaoByPedidoId(input.pedidoId);
        if (aprovacao) {
          await db.updateAprovacao(aprovacao.id, {
            gestorId: ctx.user.id,
            estadoGestor: input.confirmado ? 'confirmado' : 'cancelado',
            observacoesGestor: input.observacoes || null,
            dataAprovacaoGestor: new Date(),
          });
        }

        // Send notification to loja
        const lojaUser = await db.getUserById(pedido.criadoPor);
        const loja = await db.getLojaById(pedido.lojaId);
        
        if (lojaUser?.whatsapp) {
          const message = getWhatsAppTemplate(
            input.confirmado ? 'pedido_confirmado' : 'pedido_cancelado',
            {
              lojaNome: loja?.nome || 'Desconhecida',
              tipo: pedido.tipo,
              dataInicio: pedido.dataInicio.toLocaleDateString('pt-PT'),
              observacoes: input.observacoes,
              portalUrl: process.env.VITE_APP_URL || 'https://portal-apoio-lojas.manus.space',
            }
          );

          const sent = await sendWhatsAppMessage({
            to: lojaUser.whatsapp,
            message,
          });

          await db.createNotificacao({
            userId: lojaUser.id,
            pedidoId: input.pedidoId,
            tipo: input.confirmado ? 'pedido_confirmado' : 'pedido_cancelado',
            whatsapp: lojaUser.whatsapp,
            mensagem: message,
            enviada: sent,
            enviadaEm: sent ? new Date() : null,
          });
        }

        return { success: true };
      }),
  }),

  // === INDISPONIBILIDADES ===
  indisponibilidades: router({
    list: gestorProcedure.query(async ({ ctx }) => {
      return db.getIndisponibilidadesByGestor(ctx.user.id);
    }),

    create: gestorProcedure
      .input(z.object({
        dataInicio: z.string(),
        dataFim: z.string(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createIndisponibilidade({
          gestorId: ctx.user.id,
          dataInicio: new Date(input.dataInicio),
          dataFim: new Date(input.dataFim),
          motivo: input.motivo || null,
        });
        return { success: true };
      }),

    delete: gestorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteIndisponibilidade(input.id);
        return { success: true };
      }),
  }),

  // === CALENDARIO ===
  calendario: router({
    disponibilidade: protectedProcedure
      .input(z.object({
        mes: z.number(),
        ano: z.number(),
      }))
      .query(async ({ input }) => {
        // Get all confirmed pedidos for the month
        const pedidosConfirmados = (await db.getAllPedidos()).filter(
          p => p.estado === 'confirmado' &&
          p.dataInicio.getMonth() === input.mes &&
          p.dataInicio.getFullYear() === input.ano
        );

        // Get gestor indisponibilidades
        const gestores = (await db.getAllUsers()).filter(u => u.role === 'gestor');
        const indisponibilidades = [];
        
        for (const gestor of gestores) {
          const indisp = await db.getIndisponibilidadesByGestor(gestor.id);
          indisponibilidades.push(...indisp);
        }

        return {
          pedidosConfirmados,
          indisponibilidades,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
