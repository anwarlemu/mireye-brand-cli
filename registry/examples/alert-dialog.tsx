"use client";

import { ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react/ssr";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

function RemoveSite() {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove Site 14?</AlertDialogTitle>
        <AlertDialogDescription>Its 6 parcels, notes and fit scores are removed with it. Exports you already shared keep their copy. This cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Remove site</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function Preview() {
  return (
    <div className="flex justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <TrashIcon />
            Remove site
          </Button>
        </AlertDialogTrigger>
        <RemoveSite />
      </AlertDialog>
    </div>
  );
}

export function Small() {
  return (
    <div className="flex justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <ArrowsClockwiseIcon />
            Rescore sites
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ArrowsClockwiseIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Rescore 24 sites?</AlertDialogTitle>
            <AlertDialogDescription>Fit scores change to the new requirements. The old scores stay in the history.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Rescore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function Open() {
  return (
    <div className="min-h-100">
      <AlertDialog defaultOpen>
        <RemoveSite />
      </AlertDialog>
    </div>
  );
}
