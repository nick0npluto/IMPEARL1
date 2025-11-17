import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertCircle } from "lucide-react";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PayoutStatusBannerProps {
  initialStatus?: {
    payoutsEnabled?: boolean;
    stripeStatus?: string;
  };
  className?: string;
}

const PayoutStatusBanner = ({ initialStatus, className }: PayoutStatusBannerProps) => {
  const { toast } = useToast();
  const user = ApiService.getUser();
  const isPayee = user?.userType === "freelancer" || user?.userType === "service_provider";
  const [status, setStatus] = useState<{ payoutsEnabled: boolean; stripeStatus: string }>(() => ({
    payoutsEnabled: initialStatus?.payoutsEnabled ?? false,
    stripeStatus: initialStatus?.stripeStatus || "pending",
  }));
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async () => {
    if (!isPayee) return;
    try {
      setLoading(true);
      const response = await ApiService.getPayoutStatus();
      setStatus({
        payoutsEnabled: !!response.payoutsEnabled,
        stripeStatus: response.stripeStatus || "pending",
      });
    } catch (error: any) {
      toast({
        title: "Unable to update payout status",
        description: error.message || "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isPayee, toast]);

  useEffect(() => {
    if (isPayee && !status.payoutsEnabled) {
      refresh();
    }
  }, [isPayee, refresh, status.payoutsEnabled]);

  const startOnboarding = async () => {
    try {
      setStarting(true);
      const response = await ApiService.startPayoutOnboarding();
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
      toast({
        title: "Unable to start payout onboarding",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Unable to start payout onboarding",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setStarting(false);
    }
  };

  if (!isPayee || status.payoutsEnabled) {
    return null;
  }

  const stripeStatusDescription =
    status.stripeStatus === "enabled"
      ? "Details submitted. Stripe will enable payouts once review finishes."
      : "Submit your business and banking details to unlock payouts.";

  return (
    <Card className={cn("border-amber-200 bg-amber-50 text-amber-900", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-1 text-amber-600" />
          <div>
            <p className="font-semibold">Complete Stripe payout setup to go live</p>
            <p className="text-sm">
              {stripeStatusDescription} You need an active Stripe Connect account to appear in the marketplace,
              accept contracts, and receive funds.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={startOnboarding} disabled={starting}>
            {starting ? "Redirecting..." : "Complete Setup"}
          </Button>
          <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PayoutStatusBanner;
