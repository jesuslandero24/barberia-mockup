import type { Service } from "@/lib/types";

export const services: Service[] = [
  { id: "corte", name: "Corte", durationMin: 30, price: 20000 },
  { id: "barba", name: "Barba", durationMin: 30, price: 12000 },
  {
    id: "corte-barba",
    name: "Corte + barba",
    durationMin: 60,
    price: 30000,
    featured: true,
  },
  { id: "cejas", name: "Cejas", durationMin: 15, price: 8000 },
  { id: "diseno", name: "Corte con diseño", durationMin: 60, price: 35000 },
];
