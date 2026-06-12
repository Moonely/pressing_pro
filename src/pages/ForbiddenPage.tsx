import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre rôle ne permet pas d'accéder à cette ressource.
        </p>
      </div>
      <Button asChild><Link to="/">Retour au tableau de bord</Link></Button>
    </div>
  );
}
