import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical } from "lucide-react";

export default function TestLoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/test-mode/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast({ title: "Test mode activated", description: "You are now in test mode" });
        setLocation("/");
      } else {
        toast({ title: "Error", description: data.message || "Invalid password", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not connect to server", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle>Test Environment</CardTitle>
          <CardDescription>Enter the test mode password to access the testing environment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Test mode password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Activating..." : "Enter Test Mode"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
