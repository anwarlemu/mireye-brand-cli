"use client";

import { Button } from "@/components/ui/button";
import { ToastAction, Toaster, useToast } from "@/components/ui/toast";

export function Preview() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Site 14 archived",
            description: "It no longer appears in search or on the map.",
            action: <ToastAction altText="Undo the archive">Undo</ToastAction>,
          })
        }
      >
        Archive site
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            variant: "destructive",
            title: "Export failed",
            description: "The county server answered 500 three times.",
            action: <ToastAction altText="Retry the export">Retry</ToastAction>,
          })
        }
      >
        Destructive
      </Button>
      <Button variant="outline" onClick={() => toast({ title: "Requirements saved" })}>
        Title only
      </Button>
    </div>
  );
}
