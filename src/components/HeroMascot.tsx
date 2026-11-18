import Image from "next/image";

type HeroMascotProps = {
  alt: string;
  sizes: string;
};

export function HeroMascot({ alt, sizes }: HeroMascotProps) {
  return (
    <div className="hero-mascot-frame">
      <Image
        src="/fotos/barber-head-illustration.png"
        alt={alt}
        fill
        preload
        sizes={sizes}
        className="hero-mascot-image"
      />
    </div>
  );
}
