import type { GalleryCategory, GalleryPhoto } from "@/lib/types";

export const galleryCategories: Array<"Todos" | GalleryCategory> = [
  "Todos",
  "Cortes",
  "Diseños",
  "Barba",
];

export const galleryPhotos: GalleryPhoto[] = [
  { src: "/fotos/cortes-01.jpg", alt: "Corte clásico", category: "Cortes" },
  { src: "/fotos/disenos-01.jpg", alt: "Diseño con líneas", category: "Diseños" },
  { src: "/fotos/barba-01.jpg", alt: "Perfilado de barba", category: "Barba" },
  { src: "/fotos/cortes-02.jpg", alt: "Corte degradado", category: "Cortes" },
  { src: "/fotos/disenos-02.jpg", alt: "Diseño geométrico", category: "Diseños" },
  { src: "/fotos/cortes-03.jpg", alt: "Corte texturizado", category: "Cortes" },
  { src: "/fotos/barba-02.jpg", alt: "Barba definida", category: "Barba" },
  { src: "/fotos/disenos-03.jpg", alt: "Detalle de diseño", category: "Diseños" },
  { src: "/fotos/cortes-04.jpg", alt: "Corte moderno", category: "Cortes" },
  { src: "/fotos/disenos-04.jpg", alt: "Líneas en el cabello", category: "Diseños" },
  { src: "/fotos/cortes-05.jpg", alt: "Corte a navaja", category: "Cortes" },
  { src: "/fotos/disenos-05.jpg", alt: "Diseño personalizado", category: "Diseños" },
  { src: "/fotos/cortes-06.jpg", alt: "Corte urbano", category: "Cortes" },
  { src: "/fotos/disenos-06.jpg", alt: "Dibujo en el cabello", category: "Diseños" },
  { src: "/fotos/cortes-07.jpg", alt: "Acabado de corte", category: "Cortes" },
];

export const heroPhotos: GalleryPhoto[] = [
  { src: "/fotos/cortes-01.jpg", alt: "Corte clásico", category: "Cortes" },
  { src: "/fotos/disenos-02.jpg", alt: "Diseño geométrico", category: "Diseños" },
  { src: "/fotos/barba-01.jpg", alt: "Perfilado de barba", category: "Barba" },
];
