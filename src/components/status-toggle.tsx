"use client";

import { useState } from "react";
import { Heart, BookmarkPlus, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const statuses = [
  { value: "FAVORITE", label: "Favorite", icon: Heart, activeClass: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700" },
  { value: "TO_TRY", label: "To Try", icon: BookmarkPlus, activeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700" },
  { value: "MADE_BEFORE", label: "Made Before", icon: CheckCircle2, activeClass: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700" },
];

export function StatusToggle({ recipeId, currentStatus }: { recipeId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle(status: string) {
    setLoading(true);
    const newStatus = currentStatus === status ? "NONE" : status;
    try {
      const res = await fetch(`/api/recipes/${recipeId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {statuses.map((s) => (
        <Button
          key={s.value}
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => handleToggle(s.value)}
          className={cn("gap-2", currentStatus === s.value && s.activeClass)}
        >
          <s.icon className="h-4 w-4" />
          {s.label}
        </Button>
      ))}
    </div>
  );
}
