import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { Bell, Check, RefreshCcw } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await ApiService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to mark notification", variant: "destructive" });
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bell className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Notifications</h1>
              </div>
              <p className="text-muted-foreground">
                Stay up to date on engagement requests, counters, payments, and more.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={unreadCount > 0 ? "default" : "secondary"}>{unreadCount} unread</Badge>
              <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <RefreshCcw className="h-10 w-10 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Fetching latest notifications...</p>
            </Card>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">You're all caught up</h3>
              <p className="text-muted-foreground">We'll let you know as soon as something happens.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`p-6 flex flex-col gap-3 ${notification.read ? "opacity-75" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={notification.read ? "secondary" : "default"}>{notification.type}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{notification.title}</h3>
                    <p className="text-muted-foreground">{notification.message}</p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      className="self-start"
                      onClick={() => handleMarkRead(notification._id)}
                      disabled={markingId === notification._id}
                    >
                      <Check className="mr-2 h-4 w-4" /> Mark as read
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Notifications;
