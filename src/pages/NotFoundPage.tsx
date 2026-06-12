import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Page introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La page demandée n'existe pas ou a été déplacée.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Retour au dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
