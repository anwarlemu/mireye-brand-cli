import { DirectionProvider } from "@/components/ui/direction";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Preview() {
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="grid gap-3">
        <p className="text-body text-fg">الموقع ١٤</p>
        <Tabs defaultValue="parcel">
          <TabsList>
            <TabsTrigger value="parcel">القطعة</TabsTrigger>
            <TabsTrigger value="power">الكهرباء</TabsTrigger>
            <TabsTrigger value="water">المياه</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </DirectionProvider>
  );
}
