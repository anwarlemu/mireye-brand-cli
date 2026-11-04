"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Preview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New site</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New site</DialogTitle>
          <DialogDescription>Name the site and set the acreage the project needs.</DialogDescription>
        </DialogHeader>
        <DialogBody className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="site">Site name</Label>
            <Input id="site" placeholder="North Ault solar" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="acres">Acres needed</Label>
            <Input id="acres" inputMode="numeric" placeholder="200" />
          </div>
          <Button className="mt-2 w-full">Create site</Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
