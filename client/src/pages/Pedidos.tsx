import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Plus, XCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Pedidos() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipo, setTipo] = useState<string>("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null);
  const [actionDialog, setActionDialog] = useState<"aprovar" | "rejeitar" | "confirmar" | "cancelar" | null>(null);

  const utils = trpc.useUtils();
  const { data: pedidos, isLoading } = trpc.pedidos.list.useQuery();

  const createMutation = trpc.pedidos.create.useMutation({
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      setDialogOpen(false);
      setTipo("");
      setDataInicio("");
      setDataFim("");
      setDescricao("");
      utils.pedidos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar pedido");
    },
  });

  const aprovarMutation = trpc.pedidos.aprovarAdmin.useMutation({
    onSuccess: () => {
      toast.success("Pedido processado!");
      setActionDialog(null);
      setSelectedPedido(null);
      setObservacoes("");
      utils.pedidos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar pedido");
    },
  });

  const confirmarMutation = trpc.pedidos.confirmarGestor.useMutation({
    onSuccess: () => {
      toast.success("Pedido processado!");
      setActionDialog(null);
      setSelectedPedido(null);
      setObservacoes("");
      utils.pedidos.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar pedido");
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleCreatePedido = () => {
    if (!tipo || !dataInicio) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      tipo: tipo as any,
      dataInicio,
      dataFim: dataFim || undefined,
      descricao: descricao || undefined,
    });
  };

  const handleAction = () => {
    if (!selectedPedido || !actionDialog) return;

    if (actionDialog === "aprovar" || actionDialog === "rejeitar") {
      aprovarMutation.mutate({
        pedidoId: selectedPedido,
        aprovado: actionDialog === "aprovar",
        observacoes: observacoes || undefined,
      });
    } else {
      confirmarMutation.mutate({
        pedidoId: selectedPedido,
        confirmado: actionDialog === "confirmar",
        observacoes: observacoes || undefined,
      });
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "aprovado_admin":
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case "pendente_admin":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendente_admin: "Pendente Aprovação",
      aprovado_admin: "Aprovado - Aguarda Confirmação",
      confirmado: "Confirmado",
      cancelado: "Cancelado",
      rejeitado: "Rejeitado",
    };
    return labels[estado] || estado;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos de Apoio</h1>
            <p className="text-muted-foreground mt-2">
              Gerir pedidos de apoio às lojas
            </p>
          </div>
          {user.role === "loja" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Novo Pedido de Apoio</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes do pedido de apoio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Apoio *</Label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="cobertura_ferias">Cobertura Férias</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data Início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  {tipo === "cobertura_ferias" && (
                    <div className="space-y-2">
                      <Label htmlFor="dataFim">Data Fim</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva o apoio necessário..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePedido} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "A criar..." : "Criar Pedido"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>
              {user.role === "loja" ? "Os seus pedidos de apoio" : "Todos os pedidos de apoio"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">A carregar...</p>
            ) : pedidos && pedidos.length > 0 ? (
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(pedido.estado)}
                        <div>
                          <p className="font-semibold">{pedido.tipo.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(pedido.dataInicio).toLocaleDateString("pt-PT")}
                            {pedido.dataFim && ` - ${new Date(pedido.dataFim).toLocaleDateString("pt-PT")}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        pedido.estado === "confirmado" ? "bg-green-100 text-green-800" :
                        pedido.estado === "aprovado_admin" ? "bg-blue-100 text-blue-800" :
                        pedido.estado === "pendente_admin" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {getStatusLabel(pedido.estado)}
                      </span>
                    </div>
                    {pedido.descricao && (
                      <p className="text-sm text-muted-foreground">{pedido.descricao}</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      {user.role === "admin" && pedido.estado === "pendente_admin" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPedido(pedido.id);
                              setActionDialog("aprovar");
                            }}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPedido(pedido.id);
                              setActionDialog("rejeitar");
                            }}
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {user.role === "gestor" && pedido.estado === "aprovado_admin" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPedido(pedido.id);
                              setActionDialog("confirmar");
                            }}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedPedido(pedido.id);
                              setActionDialog("cancelar");
                            }}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem pedidos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === "aprovar" && "Aprovar Pedido"}
              {actionDialog === "rejeitar" && "Rejeitar Pedido"}
              {actionDialog === "confirmar" && "Confirmar Pedido"}
              {actionDialog === "cancelar" && "Cancelar Pedido"}
            </DialogTitle>
            <DialogDescription>
              Adicione observações (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Observações..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={aprovarMutation.isPending || confirmarMutation.isPending}
              variant={actionDialog === "rejeitar" || actionDialog === "cancelar" ? "destructive" : "default"}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
