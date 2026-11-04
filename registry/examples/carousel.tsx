import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const TEMPLATES = [
  { name: "Ellis County site 14", text: "212.6 ac, 0.8 mi from a 345 kV substation, Zone X." },
  { name: "Navarro County site 3", text: "305.0 ac, 2.4 mi from 138 kV, municipal water." },
  { name: "Kaufman County site 8", text: "198.2 ac, 1.1 mi from 138 kV, rail spur on the east edge." },
  { name: "Johnson County site 5", text: "241.7 ac, 3.0 mi from 345 kV, I-2 Industrial." },
  { name: "Hill County site 2", text: "512.0 ac, 4.6 mi from 138 kV, mostly cropland." },
];

function Slide({ name, text }: { name: string; text: string }) {
  return (
    <div className="ds-cut-frame grid h-36 content-start gap-1 p-4 [--ds-shape-fill:var(--ds-color-bg-default)] [--ds-shape-stroke:var(--ds-color-border-default)]">
      <p className="text-body leading-tight text-fg">{name}</p>
      <p className="text-body leading-body text-fg-muted">{text}</p>
    </div>
  );
}

export function Preview() {
  return (
    <div className="mx-auto w-full max-w-sm px-12">
      <Carousel>
        <CarouselContent>
          {TEMPLATES.map((t) => (
            <CarouselItem key={t.name}>
              <Slide {...t} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="mx-auto w-full max-w-2xl px-12">
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {TEMPLATES.map((t) => (
            <CarouselItem key={t.name} className="sm:basis-1/2 lg:basis-1/3">
              <Slide {...t} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="mx-auto w-full max-w-xs py-12">
      <Carousel orientation="vertical">
        <CarouselContent className="h-40">
          {TEMPLATES.map((t) => (
            <CarouselItem key={t.name}>
              <Slide {...t} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
