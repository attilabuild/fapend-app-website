import Image from "next/image";

const LOGO_SRC = "/assets/logonew.jpg";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="overflow-hidden rounded-lg shrink-0"
    >
      <Image
        src={LOGO_SRC}
        alt="Growial"
        width={size}
        height={size}
        className="h-full w-full object-cover scale-125"
        priority
        unoptimized={false}
      />
    </div>
  );
}
