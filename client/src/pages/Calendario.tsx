import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Calendario() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: disponibilidade } = trpc.calendario.disponibilidade.useQuery({
    mes: currentDate.getMonth(),
    ano: currentDate.getFullYear(),
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDayStatus = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    const hasConfirmed = disponibilidade?.pedidosConfirmados?.some(p => {
      const pDate = new Date(p.dataInicio);
      return pDate.toDateString() === date.toDateString();
    });

    const hasIndisponibilidade = disponibilidade?.indisponibilidades?.some(i => {
      const start = new Date(i.dataInicio);
      const end = new Date(i.dataFim);
      return date >= start && date <= end;
    });

    if (hasConfirmed) return "ocupado";
    if (hasIndisponibilidade) return "indisponivel";
    return "livre";
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground mt-2">
            Disponibilidade e apoios agendados
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <CardDescription>Vista mensal de disponibilidade</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="flex gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Livre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Indisponível</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div key={day} className="text-center font-semibold text-sm py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isToday = 
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      status === "ocupado"
                        ? "bg-red-100 border-red-300 text-red-900"
                        : status === "indisponivel"
                        ? "bg-gray-100 border-gray-300 text-gray-600"
                        : "bg-green-50 border-green-200 text-green-900 hover:bg-green-100"
                    } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Apoios</CardTitle>
            <CardDescription>Apoios confirmados para este mês</CardDescription>
          </CardHeader>
          <CardContent>
            {disponibilidade?.pedidosConfirmados && disponibilidade.pedidosConfirmados.length > 0 ? (
              <div className="space-y-3">
                {disponibilidade.pedidosConfirmados.map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{pedido.tipo.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pedido.dataInicio).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      Confirmado
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Sem apoios agendados para este mês</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
