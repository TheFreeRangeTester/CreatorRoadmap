import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CalendarIcon, 
  Copy, 
  Loader2, 
  Plus, 
  Share2, 
  Trash, 
  ToggleLeft, 
  ToggleRight
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PublicLinkResponse } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function PublicLinksManager() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useQuery<PublicLinkResponse[]>({
    queryKey: ["/api/public-links"],
  });

  const createMutation = useMutation({
    mutationFn: async (expiresAt?: Date) => {
      // Si tenemos una fecha, la convertimos a un string ISO para enviarla
      const payload = expiresAt 
        ? { expiresAt: expiresAt.toISOString() }
        : {};
        
      const res = await apiRequest("POST", "/api/public-links", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-links"] });
      setCreateDialogOpen(false);
      setDate(undefined);
      toast({
        title: "Success",
        description: "Public link created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create public link",
        variant: "destructive",
      });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/public-links/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-links"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update public link",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/public-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/public-links"] });
      toast({
        title: "Success",
        description: "Public link deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete public link",
        variant: "destructive",
      });
    }
  });

  const handleCreateLink = () => {
    createMutation.mutate(date);
  };

  const handleToggleLink = (id: number, isActive: boolean) => {
    toggleMutation.mutate({ id, isActive: !isActive });
  };

  const handleDeleteLink = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Public link copied to clipboard",
    });
  };

  const handleShare = (url: string) => {
    if (navigator.share) {
      navigator.share({
        title: "Content Creator Leaderboard",
        text: "Check out this content creator leaderboard!",
        url,
      }).catch(() => {
        handleCopyLink(url);
      });
    } else {
      handleCopyLink(url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Public Links</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Public Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Public Link</DialogTitle>
              <DialogDescription>
                Create a shareable link to your leaderboard that anyone can access without logging in.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Expiration Date (Optional)
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  If set, the link will automatically expire on this date.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleCreateLink}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Link"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {links?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              You haven't created any public links yet. Create one to share your leaderboard with others.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {links?.map((link) => (
            <Card key={link.id} className={cn(!link.isActive && "opacity-70")}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Public Leaderboard Link</CardTitle>
                    <CardDescription className="mt-1">
                      Created: {format(new Date(link.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground mr-1">
                      {link.isActive ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={link.isActive}
                      onCheckedChange={() => handleToggleLink(link.id, link.isActive)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 bg-muted p-2 rounded-md overflow-hidden">
                  <p className="text-sm truncate flex-1">{link.url}</p>
                  <Button variant="ghost" size="icon" onClick={() => handleCopyLink(link.url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleShare(link.url)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                {link.expiresAt && (
                  <p className="text-xs text-amber-600 mt-2">
                    Expires on {format(new Date(link.expiresAt), "PPP")}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this public link. Anyone using this link will no longer be able to access your leaderboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteLink(link.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}