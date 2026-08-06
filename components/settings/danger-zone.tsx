"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAccountAction } from "@/lib/auth/actions";

export function DangerZone() {
  return (
    <div className="rounded-lg border border-error/30 bg-error/5 p-5">
      <p className="text-sm font-medium text-error">Delete account</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Permanently deletes your account and every item, file, collection, and receipt you've saved. This cannot be undone.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="mt-3">Delete my account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately and permanently deletes your profile, every saved item and file, collections, receipts, and search history. There is no way to recover this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form action={deleteAccountAction}>
              <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-error px-4 text-sm font-medium text-error-foreground hover:opacity-90">
                Yes, delete everything
              </button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
