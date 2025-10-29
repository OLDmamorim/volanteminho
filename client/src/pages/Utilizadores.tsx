import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, User } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Utilizadores() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState("");
  const [lojaId, setLojaId] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const { data: lojas } = trpc.lojas.list.useQuery();

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Utilizador criado com sucesso!");
      setDialogOpen(false);
      setUsername("");
      setPassword("");
      setName("");
      setEmail("");
      setRole("");
      setWhatsapp("");
      setLojaId("");
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar utilizador");
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">A carregar...</div>;
  }

  if (!user || user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const handleCreate = () => {
    if (!username || !password || !role) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      username,
      password,
      name: name || undefined,
      email: email || undefined,
      role: role as any,
      whatsapp: whatsapp || undefined,
      lojaId: lojaId ? parseInt(lojaId) : undefined,
    });
  };

  const getRoleBadge = (userRole: string) => {
    const badges = {
      admin: "bg-purple-100 text-purple-800",
      gestor: "bg-blue-100 text-blue-800",
      loja: "bg-green-100 text-green-800",
    };
    return badges[userRole as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (userRole: string) => {
    const labels = {
      admin: "Administrador",
      gestor: "Gestor",
      loja: "Loja",
    };
    return labels[userRole as keyof typeof labels] || userRole;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Utilizadores</h1>
            <p className="text-muted-foreground mt-2">Gerir utilizadores do sistema</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Utilizador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Utilizador</DialogTitle>
                <DialogDescription>Adicionar um novo utilizador ao sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="barcelos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Utilizador *</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="loja">Loja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+351912345678"
                  />
                </div>
                {role === "loja" && (
                  <div className="space-y-2">
                    <Label htmlFor="lojaId">Loja</Label>
                    <Select value={lojaId} onValueChange={setLojaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {lojas?.map((loja) => (
                          <SelectItem key={loja.id} value={loja.id.toString()}>
                            {loja.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "A criar..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Utilizadores</CardTitle>
            <CardDescription>Todos os utilizadores do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">A carregar...</p>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{u.name || u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email || u.username}</p>
                        {u.whatsapp && (
                          <p className="text-xs text-muted-foreground">WhatsApp: {u.whatsapp}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleBadge(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {u.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem utilizadores</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
