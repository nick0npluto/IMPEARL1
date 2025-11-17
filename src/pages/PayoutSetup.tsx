import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { Loader2, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";

const PayoutSetup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const user = ApiService.getUser();
  const isPayee = user?.userType === "freelancer" || user?.userType === "service_provider";

  const [status, setStatus] = useState<{ payoutsEnabled: boolean; stripeStatus: string }>({
    payoutsEnabled: false,
    stripeStatus: "pending",
  });
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const query = new URLSearchParams(location.search);
  const successMessage = query.get("success")
    ? "Thanks! Stripe received your information. Refresh to see if payouts are enabled."
    : query.get("refresh")
    ? "We canceled the previous onboarding link. Start again below."
    : "";

  const fetchStatus = async () => {
    if (!isPayee) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await ApiService.getPayoutStatus();
      setStatus({
        payoutsEnabled: !!response.payoutsEnabled,
        stripeStatus: response.stripeStatus || "pending",
      });
    } catch (error: any) {
      toast({
        title: "Unable to load payout status",
        description: error.message || "Please retry shortly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const startOnboarding = async () => {
    try {
      setStarting(true);
      const response = await ApiService.startPayoutOnboarding();
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
      throw new Error("Missing onboarding link");
    } catch (error: any) {
      toast({
        title: "Unable to start onboarding",
        description: error.message || "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setStarting(false);
    }
  };

  if (!isPayee) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <p className="text-muted-foreground">
              Only freelancer or service provider accounts need to complete Stripe payouts.
            </p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Stripe payout setup</h1>
            <p className="text-muted-foreground">
              Complete this one-time onboarding so IMPEARL can pay you directly when contracts close.
            </p>
          </div>

          {successMessage && (
            <Card className="p-4 border-emerald-200 bg-emerald-50 text-emerald-900 flex gap-3 items-start">
              <CheckCircle2 className="h-5 w-5 mt-1" />
              <p className="text-sm">{successMessage}</p>
            </Card>
          )}

          <Card className="p-6 space-y-4">
            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking your payout status...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Badge variant={status.payoutsEnabled ? "secondary" : "outline"}>
                    {status.payoutsEnabled ? "Payouts enabled" : "Setup required"}
                  </Badge>
                  <span className="text-sm text-muted-foreground capitalize">
                    Stripe status: {status.stripeStatus || "pending"}
                  </span>
                </div>
                {status.payoutsEnabled ? (
                  <p className="text-sm text-muted-foreground">
                    You're all set! You can appear in the marketplace, accept contracts, and receive payouts.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Stripe needs your business and banking information. It usually takes just a few minutes.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {!status.payoutsEnabled && (
                    <Button onClick={startOnboarding} disabled={starting}>
                      {starting ? "Redirecting..." : "Start payout onboarding"}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={fetchStatus} disabled={loading}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh status
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Return to dashboard
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PayoutSetup;
