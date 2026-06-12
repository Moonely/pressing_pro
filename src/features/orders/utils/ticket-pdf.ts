import { jsPDF } from "jspdf";
import type { Order } from "@/types";
import { APP_NAME, CURRENCY } from "@/constants";
import { ORDER_STATUS_LABEL } from "@/constants";

export function generateOrderTicket(order: Order): jsPDF {
  // Format ticket 80mm thermique style sur A6 simulé
  const doc = new jsPDF({ unit: "mm", format: [80, 200] });
  const margin = 5;
  let y = 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(APP_NAME, 40, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Ticket de dépôt", 40, y, { align: "center" });
  y += 6;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, 75, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(order.reference, margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(ORDER_STATUS_LABEL[order.status], 75, y, { align: "right" });
  y += 4;

  doc.setFontSize(8);
  const dep = new Date(order.depositDate).toLocaleString("fr-FR");
  doc.text(`Déposé : ${dep}`, margin, y); y += 4;
  if (order.client) {
    doc.text(`Client : ${order.client.firstName} ${order.client.lastName}`, margin, y); y += 4;
    doc.text(`Tél : ${order.client.phone}`, margin, y); y += 4;
  }

  y += 1;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, 75, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Article", margin, y);
  doc.text("Qté", 50, y, { align: "right" });
  doc.text("Total", 75, y, { align: "right" });
  y += 3;
  doc.setFont("helvetica", "normal");

  order.items.forEach((it) => {
    const label = it.label.length > 24 ? it.label.slice(0, 23) + "…" : it.label;
    doc.text(label, margin, y);
    doc.text(String(it.quantity), 50, y, { align: "right" });
    doc.text(`${(it.quantity * it.unitPrice).toLocaleString("fr-FR")}`, 75, y, { align: "right" });
    y += 4;
  });

  y += 1;
  doc.line(margin, y, 75, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Total", margin, y);
  doc.text(`${order.total.toLocaleString("fr-FR")} ${CURRENCY}`, 75, y, { align: "right" });
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text("Payé", margin, y);
  doc.text(`${order.paid.toLocaleString("fr-FR")} ${CURRENCY}`, 75, y, { align: "right" });
  y += 4;
  const remaining = order.total - order.paid;
  doc.setFont("helvetica", "bold");
  doc.text("Reste", margin, y);
  doc.text(`${remaining.toLocaleString("fr-FR")} ${CURRENCY}`, 75, y, { align: "right" });
  y += 6;

  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, 75, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Conservez ce ticket pour récupérer", 40, y, { align: "center" });
  y += 3;
  doc.text("vos vêtements. Merci !", 40, y, { align: "center" });

  return doc;
}

export function downloadOrderTicket(order: Order): void {
  const doc = generateOrderTicket(order);
  doc.save(`ticket-${order.reference}.pdf`);
}

/** Ouvre le ticket dans un nouvel onglet et déclenche l'impression navigateur. */
export function printOrderTicket(order: Order): void {
  const doc = generateOrderTicket(order);
  doc.autoPrint();
  const url = doc.output("bloburl");
  const win = window.open(url, "_blank");
  if (!win) {
    // Fallback : téléchargement si le popup est bloqué.
    doc.save(`ticket-${order.reference}.pdf`);
  }
}
