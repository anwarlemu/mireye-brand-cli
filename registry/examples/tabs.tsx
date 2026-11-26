"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Preview() {
  return (
    <Tabs defaultValue="parcel" className="w-full">
      <TabsList>
        <TabsTrigger value="parcel">Parcel</TabsTrigger>
        <TabsTrigger value="power">Power</TabsTrigger>
        <TabsTrigger value="water">Water</TabsTrigger>
        <TabsTrigger value="terrain">Terrain</TabsTrigger>
      </TabsList>
      <TabsContent value="parcel" className="text-body text-fg-secondary">212.6 ac, zoned I-2 Industrial, one owner of record.</TabsContent>
      <TabsContent value="power" className="text-body text-fg-secondary">138 kV substation 0.8 mi east of the parcel.</TabsContent>
      <TabsContent value="water" className="text-body text-fg-secondary">Municipal main along the north edge.</TabsContent>
      <TabsContent value="terrain" className="text-body text-fg-secondary">412 ft average elevation, 2.8% slope.</TabsContent>
    </Tabs>
  );
}

export function Segmented() {
  return (
    <Tabs defaultValue="map" className="w-full max-w-86">
      <TabsList variant="segmented">
        <TabsTrigger value="map">Map</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="compare">Compare</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function Full() {
  return (
    <Tabs defaultValue="api" className="w-full max-w-86">
      <TabsList variant="segmented" full>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
