import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { APP_NAME } from "@/constants";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@pressingpro.com", password: "demo1234" },
  });

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);
    try {
      const session = await authService.login(values);
      setSession(session);
      toast.success(`Bienvenue ${session.user.firstName}`);
      navigate(from, { replace: true });
    } catch {
      toast.error("Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full flex-col justify-center bg-background px-6 py-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <Logo size={40} />
            <div className="leading-tight">
              <p className="text-base font-semibold tracking-tight">{APP_NAME}</p>
              <p className="text-xs text-muted-foreground">Gestion de pressing</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Accédez à votre espace de travail.
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>

          <div className="mt-6 space-y-1 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Comptes de démo (mot de passe : demo1234)</p>
            <p><span className="font-mono">super@pressingpro.com</span> — Super Admin (multi-tenant)</p>
            <p><span className="font-mono">admin@pressingpro.com</span> — Admin Pressing Dakar</p>
            <p><span className="font-mono">admin.thies@pressingpro.com</span> — Admin Pressing Thiès</p>
            <p><span className="font-mono">employe@pressingpro.com</span> — Employé Dakar</p>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 overflow-hidden bg-sidebar lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.546_0.215_262_/_0.4),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-sidebar-foreground">
          <h2 className="text-3xl font-bold leading-tight">
            Le pressing,<br />enfin sans papier.
          </h2>
          <p className="mt-3 max-w-md text-sm text-sidebar-muted">
            Suivez vos commandes, gérez vos clients et encaissez vos paiements
            depuis une interface moderne et rapide pensée pour le comptoir.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { v: "+38%", l: "Productivité" },
              { v: "0", l: "Ticket perdu" },
              { v: "<2s", l: "Encaissement" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-sidebar-border bg-white/5 p-4">
                <p className="text-xl font-semibold">{s.v}</p>
                <p className="mt-1 text-xs text-sidebar-muted">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
