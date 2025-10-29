import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login efetuado com sucesso!");
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Logo com fundo cinza */}
          <div className="flex justify-center mb-8 -mt-4">
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
              <img 
                src="/expressglass-logo.png" 
                alt="ExpressGlass" 
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bem-vindo</h1>
            <p className="text-gray-600 text-lg">Faça login na sua conta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-900 font-semibold text-base">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Insira o seu username"
                disabled={loginMutation.isPending}
                className="h-14 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base px-4 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-semibold text-base">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loginMutation.isPending}
                className="h-14 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 text-base px-4 transition-all"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A entrar...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Apoio Minho - Sistema de Gestão de Apoio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
