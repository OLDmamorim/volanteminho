import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Store } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Lojas() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [contacto, setContacto] = useState("");
  const [morada, setMorada] = useState("");

  const utils = trpc.useUtils();
  const { data: lojas, isLoading } = trpc.lojas.list.useQuery();

  const createMutation = trpc.lojas.create.useMutation({
    onSuccess: () => {
      toast.success("Loja criada com sucesso!");
      setDialogOpen(false);
      setNome("");
      setCodigo("");
      setContacto("");
      setMorada("");
      utils.lojas.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar loja");
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
    if (!nome || !codigo) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      nome,
      codigo,
      contacto: contacto || undefined,
      morada: morada || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lojas</h1>
            <p className="text-muted-foreground mt-2">Gerir lojas do sistema</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Loja
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Loja</DialogTitle>
                <DialogDescription>Adicionar uma nova loja ao sistema</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Loja Barcelos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ex: BCL001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto">Contacto</Label>
                  <Input
                    id="contacto"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    placeholder="Ex: 253 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="morada">Morada</Label>
                  <Textarea
                    id="morada"
                    value={morada}
                    onChange={(e) => setMorada(e.target.value)}
                    placeholder="Morada completa..."
                    rows={3}
                  />
                </div>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="text-muted-foreground col-span-full text-center py-8">A carregar...</p>
          ) : lojas && lojas.length > 0 ? (
            lojas.map((loja) => (
              <Card key={loja.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{loja.nome}</CardTitle>
                        <CardDescription>{loja.codigo}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loja.contacto && (
                    <p className="text-sm">
                      <span className="font-medium">Contacto:</span> {loja.contacto}
                    </p>
                  )}
                  {loja.morada && (
                    <p className="text-sm">
                      <span className="font-medium">Morada:</span> {loja.morada}
                    </p>
                  )}
                  <div className="pt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      loja.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {loja.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-8">Sem lojas registadas</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
