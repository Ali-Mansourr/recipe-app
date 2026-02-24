"use client";

import { useState } from "react";
import { Share2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SharedUser {
  id: string;
  canEdit: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function ShareDialog({
  recipeId,
  sharedWith,
}: {
  recipeId: string;
  sharedWith: SharedUser[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [canEdit, setCanEdit] = useState("view");
  const [loading, setLoading] = useState(false);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, canEdit: canEdit === "edit" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Recipe shared with ${email}`);
        setEmail("");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to share");
      }
    } catch {
      toast.error("Failed to share recipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveShare(userId: string) {
    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success("Access removed");
        router.refresh();
      }
    } catch {
      toast.error("Failed to remove access");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Recipe</DialogTitle>
          <DialogDescription>
            Share this recipe with other users by their email address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="share-email">Email address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={canEdit} onValueChange={setCanEdit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Share
          </Button>
        </form>

        {sharedWith.length > 0 && (
          <div className="space-y-3 mt-4">
            <Label>Shared with</Label>
            {sharedWith.map((share) => (
              <div key={share.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={share.user.image || ""} />
                    <AvatarFallback>{share.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{share.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {share.user.email} &middot; {share.canEdit ? "Can edit" : "View only"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveShare(share.user.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
