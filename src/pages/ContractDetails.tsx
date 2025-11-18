import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import {
  ArrowLeft,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
  HandCoins,
  Loader2,
  MessageSquare,
} from "lucide-react";

interface ContractEntity {
  _id: string;
  title: string;
  description: string;
  status: "active" | "completed";
  paymentStatus: "unpaid" | "held" | "released" | "disputed" | "refunded";
  amountUsd?: number;
  agreedPrice?: number;
  currency?: string;
  targetType?: "freelancer" | "service_provider";
  targetFreelancer?: { name?: string };
  targetProvider?: { companyName?: string };
  business?: { businessName?: string };
  freelancerRequestedRelease?: boolean;
  paidAt?: string;
  releasedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const paymentBadgeMap: Record<string, string> = {
  unpaid: "bg-slate-100 text-slate-900",
  held: "bg-amber-100 text-amber-900",
  released: "bg-emerald-100 text-emerald-900",
  disputed: "bg-rose-100 text-rose-900",
  refunded: "bg-slate-200 text-slate-900",
};

const eventLabels: Record<string, string> = {
  checkout_started: "Checkout started",
  payment_held: "Payment captured",
  release_requested: "Release requested",
  payment_released: "Payment released",
  dispute_opened: "Dispute opened",
};

const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const ContractDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const user = ApiService.getUser();
  const isBusiness = user?.userType === "business";
  const isPayee = user?.userType === "freelancer" || user?.userType === "service_provider";

  const [contract, setContract] = useState<ContractEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const platformFeePercent = Number(import.meta.env.VITE_PLATFORM_FEE_PERCENT ?? 10);
  const baseAmount = useMemo(() => Number(contract?.amountUsd ?? contract?.agreedPrice ?? 0), [contract]);
  const feeAmount = useMemo(
    () => Number(((baseAmount * platformFeePercent) / 100).toFixed(2)),
    [baseAmount, platformFeePercent]
  );
  const totalAmount = useMemo(() => Number((baseAmount + feeAmount).toFixed(2)), [baseAmount, feeAmount]);

  const payeeName =
    contract?.targetType === "service_provider"
      ? contract?.targetProvider?.companyName || "Service provider"
      : contract?.targetFreelancer?.name || "Freelancer";
  const paymentStatus = contract?.paymentStatus || "unpaid";

  const describeHistory = (entry: any) => {
    const label = eventLabels[entry.eventType] || entry.eventType;
    if (entry.eventType === "checkout_started" && entry.details?.totalCents) {
      return `${label}: $${(entry.details.totalCents / 100).toFixed(2)} charge created.`;
    }
    if (entry.eventType === "payment_released" && entry.details?.amountCents) {
      return `${label}: $${(entry.details.amountCents / 100).toFixed(2)} sent to payee.`;
    }
    return label;
  };

  const loadHistory = async (contractId: string) => {
    try {
      setHistoryLoading(true);
      const response = await ApiService.getContractHistory(contractId);
      setHistory(response.history || []);
    } catch (error: any) {
      toast({
        title: "Unable to load activity",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchContract = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await ApiService.getContract(id);
      setContract(response.contract);
      if (response.contract?._id) {
        loadHistory(response.contract._id);
      }
    } catch (error: any) {
      toast({
        title: "Unable to load contract",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  useEffect(() => {
    const paymentParam = new URLSearchParams(location.search).get("payment");
    if (paymentParam === "success") {
      toast({ title: "Payment captured", description: "Funds are now held in escrow." });
      refreshContract();
    } else if (paymentParam === "cancel") {
      toast({ title: "Checkout canceled", description: "You can try paying again when ready." });
    }
  }, [location.search, toast]);

  const refreshContract = async () => {
    if (!id) return;
    try {
      setRefreshing(true);
      const response = await ApiService.getContract(id);
      setContract(response.contract);
      if (response.contract?._id) {
        loadHistory(response.contract._id);
      }
    } catch (error: any) {
      toast({
        title: "Unable to refresh contract",
        description: error.message || "Try again shortly.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const startCheckout = async () => {
    if (!contract?._id) return;
    try {
      setAction("checkout");
      const response = await ApiService.createCheckoutSession(contract._id);

      if (response?.url) {
        window.location.href = response.url;
        return;
      }

      if (response?.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${response.sessionId}`;
        return;
      }

      throw new Error("Unable to start Stripe Checkout");
    } catch (error: any) {
      toast({
        title: "Unable to start checkout",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAction(null);
    }
  };

  const releasePayment = async () => {
    if (!contract?._id) return;
    try {
      setAction("release");
      const response = await ApiService.releaseContract(contract._id);
      setContract(response.contract);
      toast({ title: "Payment released", description: "Funds are on their way to the payee." });
    } catch (error: any) {
      toast({
        title: "Unable to release payment",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAction(null);
    }
  };

  const requestRelease = async () => {
    if (!contract?._id) return;
    try {
      setAction("request");
      const response = await ApiService.requestContractRelease(contract._id);
      setContract(response.contract);
      toast({ title: "Request sent", description: "The business has been notified." });
    } catch (error: any) {
      toast({
        title: "Unable to request release",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAction(null);
    }
  };

  const openDispute = async () => {
    if (!contract?._id) return;
    try {
      setAction("dispute");
      const response = await ApiService.disputeContract(contract._id);
      setContract(response.contract);
      toast({ title: "Dispute opened", description: "Our team will review the engagement." });
    } catch (error: any) {
      toast({
        title: "Unable to open dispute",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAction(null);
    }
  };

  const paymentActionsAvailable = isBusiness && contract?.status === "active";
  const canRequestRelease = isPayee && paymentStatus === "held" && !contract?.freelancerRequestedRelease;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl space-y-6">
          <Button variant="ghost" className="pl-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {loading ? (
            <Card className="p-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-4">Loading contract...</p>
            </Card>
          ) : !contract ? (
            <Card className="p-10 text-center">
              <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-4" />
              <p className="text-muted-foreground">This contract could not be found.</p>
            </Card>
          ) : (
            <>
              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{contract.title}</h1>
                  <Badge variant={contract.status === "completed" ? "secondary" : "default"}>{contract.status}</Badge>
                  <Badge className={paymentBadgeMap[paymentStatus] || "bg-slate-100 text-slate-900"}>
                    {paymentStatus}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{contract.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <p>
                    <span className="font-semibold">Business:</span> {contract.business?.businessName || "Business"}
                  </p>
                  <p>
                    <span className="font-semibold">Partner:</span> {payeeName}
                  </p>
                </div>
              </Card>

              {paymentStatus === "disputed" && (
                <Card className="border-rose-200 bg-rose-50 text-rose-900 p-4 flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 mt-1" />
                  <div>
                    <p className="font-semibold">This contract is currently disputed.</p>
                    <p className="text-sm">
                      Our team will reach out with next steps. No funds will move until the dispute is resolved.
                    </p>
                  </div>
                </Card>
              )}

              {contract.freelancerRequestedRelease && paymentStatus === "held" && isBusiness && (
                <Card className="border-amber-200 bg-amber-50 text-amber-900 p-4 flex gap-3 items-start">
                  <HandCoins className="h-5 w-5 mt-1" />
                  <div>
                    <p className="font-semibold">Release requested</p>
                    <p className="text-sm">
                      {payeeName} requested payment release. Review deliverables and release funds when work is complete.
                    </p>
                  </div>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Escrow breakdown</p>
                      <p className="text-sm text-muted-foreground">
                        IMPEARL holds the total charge until you release payment or open a dispute.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base contract price</span>
                      <span className="font-semibold">{formatCurrency(baseAmount, contract.currency || "USD")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform fee ({platformFeePercent}%)</span>
                      <span>{formatCurrency(feeAmount, contract.currency || "USD")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total collected</span>
                      <span>{formatCurrency(totalAmount, contract.currency || "USD")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {paymentActionsAvailable && paymentStatus === "unpaid" && (
                      <Button onClick={startCheckout} disabled={action === "checkout"}>
                        {action === "checkout" ? "Redirecting..." : "Pay with Stripe"}
                      </Button>
                    )}
                    {paymentActionsAvailable && paymentStatus === "held" && (
                      <>
                        <Button onClick={releasePayment} disabled={action === "release"}>
                          {action === "release" ? "Releasing..." : "Release Payment"}
                        </Button>
                        <Button variant="outline" onClick={openDispute} disabled={action === "dispute"}>
                          {action === "dispute" ? "Opening..." : "Open Dispute"}
                        </Button>
                      </>
                    )}
                    {canRequestRelease && (
                      <Button onClick={requestRelease} disabled={action === "request"} variant="secondary">
                        {action === "request" ? "Requesting..." : "Request Payment Release"}
                      </Button>
                    )}
                    <Button variant="ghost" onClick={refreshContract} disabled={refreshing}>
                      <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Important dates</p>
                      <p className="text-sm text-muted-foreground">Track when funds move through escrow.</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Contract created</span>
                      <span className="font-semibold">{formatDate(contract.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment held</span>
                      <span>{paymentStatus !== "unpaid" ? formatDate(contract.paidAt) : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment released</span>
                      <span>{paymentStatus === "released" ? formatDate(contract.releasedAt) : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last updated</span>
                      <span>{formatDate(contract.updatedAt)}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Stay aligned</h2>
                    <p className="text-sm text-muted-foreground">
                      Keep all contract communication inside IMPEARL for better support.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/engagements">
                      <MessageSquare className="mr-2 h-4 w-4" /> Open shared messages
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Need help? Contact support and reference this contract for faster assistance.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">Activity timeline</h3>
                    <p className="text-sm text-muted-foreground">Track payments, release requests, and disputes.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => contract?._id && loadHistory(contract._id)}
                    disabled={historyLoading}
                  >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${historyLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
                {historyLoading ? (
                  <p className="text-muted-foreground text-sm">Loading history...</p>
                ) : history.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div key={entry._id} className="border border-border rounded-md p-3 text-sm">
                        <p className="font-semibold text-foreground">{describeHistory(entry)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContractDetails;
