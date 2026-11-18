export type Brand = {
  name: string;
  tagline: string;
  whatsapp: string;
  address: string;
};

export type Barber = {
  id: string;
  name: string;
  role: string;
};

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  featured?: boolean;
};

export type TimeRange = {
  open: string;
  close: string;
};

export type DaySchedule = {
  dayIndex: number;
  label: string;
  ranges: TimeRange[];
};

export type GalleryCategory = "Cortes" | "Diseños" | "Barba";

export type GalleryPhoto = {
  src: string;
  alt: string;
  category: GalleryCategory;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type Booking = {
  id: string;
  code: string;
  clientId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  createdAt: string;
  status: "active" | "cancelled";
};

export type BlockedSlot = {
  id: string;
  barberId: string;
  date: string;
  time: string;
};
