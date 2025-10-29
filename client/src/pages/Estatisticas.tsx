import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Calendar, Store } from "lucide-react";
import { useLocation } from "wouter";

export default function Estatisticas() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: pedidos, isLoading } = trpc.pedidos.list.useQuery();
  const { data: lojas } = trpc.lojas.list.useQuery();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
  }

  if (!user || (user.role !== "admin" && user.role !== "gestor")) {
    setLocation("/dashboard");
    return null;
  }

  const pedidosConfirmados = pedidos?.filter(p => p.estado === "confirmado") || [];
  const totalPedidos = pedidos?.length || 0;
  const taxaAprovacao = totalPedidos > 0 
    ? ((pedidosConfirmados.length / totalPedidos) * 100).toFixed(1)
    : "0";

  // Pedidos por tipo
  const pedidosPorTipo = pedidos?.reduce((acc, p) => {
    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Pedidos por loja
  const pedidosPorLoja = pedidos?.reduce((acc, p) => {
    acc[p.lojaId] = (acc[p.lojaId] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  const getLojaName = (lojaId: number) => {
    return lojas?.find(l => l.id === lojaId)?.nome || `Loja ${lojaId}`;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      servico: "Serviço",
      cobertura_ferias: "Cobertura Férias",
      outros: "Outros",
    };
    return labels[tipo] || tipo;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
          <p className="text-muted-foreground mt-2">
            Análise de pedidos e desempenho
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPedidos}</div>
              <p className="text-xs text-muted-foreground">
                Todos os pedidos registados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosConfirmados.length}</div>
              <p className="text-xs text-muted-foreground">
                Apoios realizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxaAprovacao}%</div>
              <p className="text-xs text-muted-foreground">
                Pedidos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
              <Store className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lojas?.filter(l => l.active).length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Lojas no sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pedidos por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Tipo</CardTitle>
            <CardDescription>Distribuição dos tipos de apoio solicitados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">A carregar...</p>
            ) : Object.keys(pedidosPorTipo).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(pedidosPorTipo).map(([tipo, count]) => {
                  const percentage = totalPedidos > 0 ? ((count / totalPedidos) * 100).toFixed(1) : "0";
                  return (
                    <div key={tipo} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getTipoLabel(tipo)}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Pedidos por Loja */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Loja</CardTitle>
            <CardDescription>Lojas que mais solicitam apoio</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">A carregar...</p>
            ) : Object.keys(pedidosPorLoja).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(pedidosPorLoja)
                  .sort(([, a], [, b]) => b - a)
                  .map(([lojaId, count]) => {
                    const percentage = totalPedidos > 0 ? ((count / totalPedidos) * 100).toFixed(1) : "0";
                    return (
                      <div key={lojaId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{getLojaName(parseInt(lojaId))}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>

        {/* Pedidos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
            <CardDescription>Últimos 10 pedidos processados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">A carregar...</p>
            ) : pedidos && pedidos.length > 0 ? (
              <div className="space-y-3">
                {pedidos.slice(0, 10).map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{getTipoLabel(pedido.tipo)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLojaName(pedido.lojaId)} - {new Date(pedido.dataInicio).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      pedido.estado === "confirmado" ? "bg-green-100 text-green-800" :
                      pedido.estado === "aprovado_admin" ? "bg-blue-100 text-blue-800" :
                      pedido.estado === "pendente_admin" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {pedido.estado.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Sem pedidos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
