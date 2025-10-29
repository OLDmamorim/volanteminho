import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Clock, XCircle, FileText, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: pedidos, isLoading } = trpc.pedidos.list.useQuery();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const pedidosPendentes = pedidos?.filter(p => p.estado === "pendente_admin").length || 0;
  const pedidosAprovados = pedidos?.filter(p => p.estado === "aprovado_admin").length || 0;
  const pedidosConfirmados = pedidos?.filter(p => p.estado === "confirmado").length || 0;
  const pedidosRejeitados = pedidos?.filter(p => p.estado === "rejeitado" || p.estado === "cancelado").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo, {user.name || user.username}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosPendentes}</div>
              <p className="text-xs text-muted-foreground">
                A aguardar aprovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosAprovados}</div>
              <p className="text-xs text-muted-foreground">
                A aguardar confirmação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosConfirmados}</div>
              <p className="text-xs text-muted-foreground">
                Apoios agendados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados/Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedidosRejeitados}</div>
              <p className="text-xs text-muted-foreground">
                Não realizados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.role === "loja" && (
              <Button onClick={() => setLocation("/pedidos")} className="h-20">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Novo Pedido</span>
                </div>
              </Button>
            )}
            <Button variant="outline" onClick={() => setLocation("/pedidos")} className="h-20">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Ver Pedidos</span>
              </div>
            </Button>
            <Button variant="outline" onClick={() => setLocation("/calendario")} className="h-20">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Calendário</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimos pedidos de apoio</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">A carregar...</p>
            ) : pedidos && pedidos.length > 0 ? (
              <div className="space-y-4">
                {pedidos.slice(0, 5).map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{pedido.tipo}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pedido.dataInicio).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pedido.estado === "confirmado" ? "bg-green-100 text-green-800" :
                        pedido.estado === "aprovado_admin" ? "bg-blue-100 text-blue-800" :
                        pedido.estado === "pendente_admin" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {pedido.estado.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sem pedidos recentes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
