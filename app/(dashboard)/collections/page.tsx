import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getCollections } from "@/lib/db/queries";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { plans } from "@/lib/config/brand";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const { userId, profile } = await requireUser();
  const collections = await getCollections(userId);
  const limit = plans[profile.plan].limits.maxCollections;

  return (
    <div className="container max-w-5xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Collections</h1>
          {limit !== Infinity && <p className="text-caption text-muted-foreground">{collections.length} / {limit} used on the Free plan</p>}
        </div>
        <CreateCollectionDialog />
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Group related memories together — like a trip, a class, or a project — so you can browse them as a set."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.id}`}>
              <Card className="flex h-full flex-col p-5 transition-colors hover:border-primary/40">
                <FolderOpen className="h-5 w-5 text-primary" />
                <p className="mt-3 truncate text-sm font-medium">{c.name}</p>
                {c.description && <p className="mt-1 line-clamp-2 text-caption text-muted-foreground">{c.description}</p>}
                <p className="mt-auto pt-3 text-caption text-muted-foreground">{c.itemCount} item{c.itemCount === 1 ? "" : "s"}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
