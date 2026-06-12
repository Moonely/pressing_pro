import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Square, WashingMachine, Wind, Shirt, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { machinesService } from "../services/machines.service";
import type { Machine, MachineType } from "@/types";

const TYPE_ICON: Record<MachineType, typeof WashingMachine> = {
  washer: WashingMachine,
  dryer: Wind,
  iron: Shirt,
};

const TYPE_LABEL: Record<MachineType, string> = {
  washer: "Lavage",
  dryer: "Séchage",
  iron: "Repassage",
};

const PROGRAMS = ["Coton 40°", "Synthétique 30°", "Délicat 20°", "Express 15min", "Eco 60°"];

function useTick(ms = 1000) {
  const [, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function MachineCard({ machine, onStart, onStop }: { machine: Machine; onStart: () => void; onStop: () => void }) {
  useTick(1000);
  const Icon = TYPE_ICON[machine.type];
  const cycle = machine.currentCycle;

  let progress = 0;
  let remainingLabel = "";
  if (cycle) {
    const start = new Date(cycle.startedAt).getTime();
    const end = new Date(cycle.endsAt).getTime();
    const now = Date.now();
    const total = end - start;
    progress = Math.min(100, Math.max(0, ((now - start) / total) * 100));
    const remainingMs = Math.max(0, end - now);
    const min = Math.floor(remainingMs / 60_000);
    const sec = Math.floor((remainingMs % 60_000) / 1000);
    remainingLabel = `${min}m ${String(sec).padStart(2, "0")}s`;
  }

  const statusBadge = {
    idle: <Badge className="bg-muted text-muted-foreground hover:bg-muted">Disponible</Badge>,
    running: <Badge className="bg-info/15 text-info hover:bg-info/15">En cours</Badge>,
    maintenance: <Badge className="bg-warning/15 text-warning hover:bg-warning/15">Maintenance</Badge>,
  }[machine.status];

  return (
    <Card className="border-border shadow-elevation-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{machine.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{TYPE_LABEL[machine.type]} · {machine.capacityKg > 0 ? `${machine.capacityKg} kg` : "—"}</p>
          </div>
        </div>
        {statusBadge}
      </CardHeader>
      <CardContent className="space-y-4">
        {cycle ? (
          <>
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">{cycle.program}{cycle.orderRef ? ` · ${cycle.orderRef}` : ""}</span>
                <span className="font-medium">{remainingLabel}</span>
              </div>
              <Progress value={progress} />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={onStop}>
              <Square className="mr-2 h-3.5 w-3.5" /> Arrêter
            </Button>
          </>
        ) : machine.status === "maintenance" ? (
          <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
            <Wrench className="mb-1 inline h-3.5 w-3.5" /> Hors service
          </div>
        ) : (
          <Button size="sm" className="w-full" onClick={onStart}>
            <Play className="mr-2 h-3.5 w-3.5" /> Démarrer un cycle
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground">{machine.totalCycles} cycles au total</p>
      </CardContent>
    </Card>
  );
}

export function MachinesPage() {
  const qc = useQueryClient();
  const { data: machines, isLoading } = useQuery({
    queryKey: ["machines"],
    queryFn: () => machinesService.list(),
    refetchInterval: 5000,
  });

  const [dialog, setDialog] = useState<{ open: boolean; machine?: Machine }>({ open: false });
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [duration, setDuration] = useState("30");
  const [orderRef, setOrderRef] = useState("");

  const startMut = useMutation({
    mutationFn: () => machinesService.start(dialog.machine!.id, undefined, program, Number(duration)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["machines"] }); toast.success("Cycle démarré"); setDialog({ open: false }); },
  });
  const stopMut = useMutation({
    mutationFn: (id: string) => machinesService.stop(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["machines"] }); toast.success("Cycle arrêté"); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Machines</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suivi en temps réel des équipements.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-48 animate-pulse border-border bg-muted/30" />
        ))}
        {machines?.map((m) => (
          <MachineCard
            key={m.id}
            machine={m}
            onStart={() => { setDialog({ open: true, machine: m }); setProgram(PROGRAMS[0]); setDuration("30"); setOrderRef(""); }}
            onStop={() => stopMut.mutate(m.id)}
          />
        ))}
      </div>

      <Dialog open={dialog.open} onOpenChange={(o) => setDialog({ open: o, machine: o ? dialog.machine : undefined })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Démarrer un cycle — {dialog.machine?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Programme</Label>
              <Select value={program} onValueChange={setProgram}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durée (minutes)</Label>
              <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Référence commande (optionnel)</Label>
              <Input placeholder="CMD-1042" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={() => startMut.mutate()} disabled={startMut.isPending}>Démarrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
