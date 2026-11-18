import type { GalleryCategory, GalleryPhoto } from "@/lib/types";
import { publicPath } from "@/config/paths";

export const galleryCategories: Array<"Todos" | GalleryCategory> = [
  "Todos",
  "Cortes",
  "Diseños",
  "Barba",
];

export const galleryPhotos: GalleryPhoto[] = [
  { src: publicPath("/fotos/cortes-01.jpg"), alt: "Corte clásico", category: "Cortes" },
  { src: publicPath("/fotos/disenos-01.jpg"), alt: "Diseño con líneas", category: "Diseños" },
  { src: publicPath("/fotos/barba-01.jpg"), alt: "Perfilado de barba", category: "Barba" },
  { src: publicPath("/fotos/cortes-02.jpg"), alt: "Corte degradado", category: "Cortes" },
  { src: publicPath("/fotos/disenos-02.jpg"), alt: "Diseño geométrico", category: "Diseños" },
  { src: publicPath("/fotos/cortes-03.jpg"), alt: "Corte texturizado", category: "Cortes" },
  { src: publicPath("/fotos/barba-02.jpg"), alt: "Barba definida", category: "Barba" },
  { src: publicPath("/fotos/disenos-03.jpg"), alt: "Detalle de diseño", category: "Diseños" },
  { src: publicPath("/fotos/cortes-04.jpg"), alt: "Corte moderno", category: "Cortes" },
  { src: publicPath("/fotos/disenos-04.jpg"), alt: "Líneas en el cabello", category: "Diseños" },
  { src: publicPath("/fotos/cortes-05.jpg"), alt: "Corte a navaja", category: "Cortes" },
  { src: publicPath("/fotos/disenos-05.jpg"), alt: "Diseño personalizado", category: "Diseños" },
  { src: publicPath("/fotos/cortes-06.jpg"), alt: "Corte urbano", category: "Cortes" },
  { src: publicPath("/fotos/disenos-06.jpg"), alt: "Dibujo en el cabello", category: "Diseños" },
  { src: publicPath("/fotos/cortes-07.jpg"), alt: "Acabado de corte", category: "Cortes" },
];

export const heroPhotos: GalleryPhoto[] = [
  { src: publicPath("/fotos/cortes-01.jpg"), alt: "Corte clásico", category: "Cortes" },
  { src: publicPath("/fotos/disenos-02.jpg"), alt: "Diseño geométrico", category: "Diseños" },
  { src: publicPath("/fotos/barba-01.jpg"), alt: "Perfilado de barba", category: "Barba" },
];
