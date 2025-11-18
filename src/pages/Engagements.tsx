import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  Users,
  CheckCircle,
  RefreshCcw,
  MessageSquare,
  Send,
  ArrowRight,
} from "lucide-react";

interface Engagement {
  _id: string;
  title: string;
  description: string;
  targetType: "freelancer" | "service_provider";
  status: "pending" | "accepted" | "declined" | "countered" | "expired";
  initialPrice: number;
  currency: string;
  proposedTerms?: string;
  latestOffer?: {
    fromRole: string;
    price?: number;
    terms?: string;
  };
  fromBusiness?: {
    _id?: string;
    businessName?: string;
    goals?: string;
    description?: string;
    user?: string;
  };
  targetFreelancer?: {
    _id?: string;
    name?: string;
    expertise?: string;
    user?: string;
  };
  targetProvider?: {
    _id?: string;
    companyName?: string;
    description?: string;
    user?: string;
  };
  contract?: Contract;
}

interface Contract {
  _id: string;
  title: string;
  description: string;
  status: "active" | "completed";
  agreedPrice: number;
  currency: string;
  paymentStatus?: "unpaid" | "held" | "released" | "disputed" | "refunded";
  amountUsd?: number;
  freelancerRequestedRelease?: boolean;
  targetType?: "freelancer" | "service_provider";
  targetFreelancer?: { _id?: string; name?: string };
  targetProvider?: { _id?: string; companyName?: string };
  engagementRequest?: Engagement;
}

interface Message {
  _id: string;
  contract: string;
  sender: string;
  receiver: string;
  body: string;
  createdAt: string;
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  countered: "bg-blue-100 text-blue-900",
  accepted: "bg-emerald-100 text-emerald-900",
  declined: "bg-rose-100 text-rose-900",
  expired: "bg-slate-100 text-slate-900",
};

const paymentBadge: Record<string, string> = {
  unpaid: "bg-slate-100 text-slate-900",
  held: "bg-amber-100 text-amber-900",
  released: "bg-emerald-100 text-emerald-900",
  disputed: "bg-rose-100 text-rose-900",
  refunded: "bg-slate-200 text-slate-900",
};

const Engagements = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = ApiService.getUser();
  const userType = user?.userType;
  const currentUserId = user?.id;

  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [newMessage, setNewMessage] = useState("");
  const [activeContractId, setActiveContractId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [reviewForms, setReviewForms] = useState<Record<string, { rating: string; comment: string }>>({});
  const [reviewSubmitting, setReviewSubmitting] = useState<string | null>(null);
  const [reviewedTargets, setReviewedTargets] = useState<Record<string, boolean>>({});

  const isBusiness = userType === "business";
  const isTalent = userType === "freelancer" || userType === "service_provider";

  const getReviewTarget = (engagement: Engagement) => {
    if (isBusiness) {
      if (engagement.targetType === "freelancer") {
        return {
          targetType: "freelancer" as const,
          targetUserId: engagement.targetFreelancer?.user,
          targetProfileId: engagement.targetFreelancer?._id,
          displayName: engagement.targetFreelancer?.name || "Freelancer",
        };
      }
      return {
        targetType: "service_provider" as const,
        targetUserId: engagement.targetProvider?.user,
        targetProfileId: engagement.targetProvider?._id,
        displayName: engagement.targetProvider?.companyName || "Service Provider",
      };
    }

    return {
      targetType: "business" as const,
      targetUserId: engagement.fromBusiness?.user,
      targetProfileId: engagement.fromBusiness?._id,
      displayName: engagement.fromBusiness?.businessName || "Business",
    };
  };

  const awaitingUserResponse = (engagement: Engagement) => {
    if (!userType) return false;
    if (!engagement.latestOffer?.fromRole) {
      return userType !== "business";
    }
    return engagement.latestOffer.fromRole !== userType;
  };

  const canAcceptOrDecline = (engagement: Engagement) => {
    if (!awaitingUserResponse(engagement)) return false;
    return engagement.status === "pending" || engagement.status === "countered";
  };

  const canCounter = (engagement: Engagement) => awaitingUserResponse(engagement);

const targetKey = (engagement: Engagement) => {
  const target = getReviewTarget(engagement);
  if (target?.targetUserId) {
    return `${target.targetType}:${target.targetUserId}`;
  }
  return "";
};

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [engagementRes, contractRes] = await Promise.all([
          ApiService.getEngagements(),
          ApiService.getContracts(),
        ]);
        setEngagements(engagementRes.engagements || []);
        setContracts(contractRes.contracts || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Unable to load engagements",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [toast]);

  const refreshData = async () => {
    try {
      const [engagementRes, contractRes] = await Promise.all([
        ApiService.getEngagements(),
        ApiService.getContracts(),
      ]);
      setEngagements(engagementRes.engagements || []);
      setContracts(contractRes.contracts || []);
      toast({ title: "Refreshed", description: "Latest engagements and contracts loaded." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to refresh data",
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await ApiService.acceptEngagement(id);
      toast({ title: "Engagement accepted" });
      refreshData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to accept engagement", variant: "destructive" });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await ApiService.declineEngagement(id);
      toast({ title: "Engagement declined" });
      refreshData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to decline engagement", variant: "destructive" });
    }
  };

  const handleCounter = async (id: string, onClose: () => void, price: string, terms: string) => {
    if (!price) {
      toast({ title: "Amount required", description: "Enter your counter price", variant: "destructive" });
      return;
    }

    try {
      await ApiService.counterEngagement(id, { price: Number(price), terms });
      toast({ title: "Counter offer sent" });
      onClose();
      refreshData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to send counter", variant: "destructive" });
    }
  };

  const loadMessages = async (contractId: string) => {
    setMessageLoading(true);
    try {
      const response = await ApiService.getMessages(contractId);
      if (!response?.notModified) {
        setMessages((prev) => ({ ...prev, [contractId]: response.messages || [] }));
      }
      setActiveContractId(contractId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to load messages", variant: "destructive" });
    } finally {
      setMessageLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeContractId || !currentUserId) return;
    const contract = contracts.find((c) => c._id === activeContractId);
    if (!contract) return;

    const engagement = engagements.find((e) => e.contract?._id === activeContractId);
    if (!engagement) return;

    const receiverId = (() => {
      if (userType === "business") {
        return engagement.targetType === "freelancer"
          ? engagement.targetFreelancer?.user
          : engagement.targetProvider?.user;
      }
      return engagement.fromBusiness?.user;
    })();

    if (!receiverId) {
      toast({ title: "Missing recipient", description: "Unable to identify who should receive this message.", variant: "destructive" });
      return;
    }

    try {
      await ApiService.sendMessage({
        contractId: activeContractId,
        body: newMessage,
        receiverId,
      });
      setNewMessage("");
      loadMessages(activeContractId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to send message", variant: "destructive" });
    }
  };

  const handleCompleteContract = async (contractId: string) => {
    try {
      await ApiService.completeContract(contractId);
      toast({ title: "Contract completed" });
      refreshData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to complete contract", variant: "destructive" });
    }
  };

  const handleReviewChange = (contractId: string, field: "rating" | "comment", value: string) => {
    setReviewForms((prev) => ({
      ...prev,
      [contractId]: {
        rating: field === "rating" ? value : prev[contractId]?.rating || "5",
        comment: field === "comment" ? value : prev[contractId]?.comment || "",
      },
    }));
  };

  const handleSubmitReview = async (engagement: Engagement, contract: Contract) => {
    const target = getReviewTarget(engagement);
    const key = target?.targetUserId ? targetKey(engagement) : "";
    const rating = reviewForms[contract._id]?.rating || "5";
    const comment = reviewForms[contract._id]?.comment || "";

    if (!target?.targetUserId) {
      toast({ title: "Missing profile", description: "Unable to identify who to review.", variant: "destructive" });
      return;
    }

    try {
      setReviewSubmitting(contract._id);
      await ApiService.submitReview(target.targetType, target.targetUserId, Number(rating), comment, target.targetProfileId);
      toast({ title: "Review submitted" });
      if (key) {
        setReviewedTargets((prev) => ({ ...prev, [key]: true }));
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to submit review", variant: "destructive" });
    } finally {
      setReviewSubmitting(null);
    }
  };

  const contractsByEngagement = useMemo(() => {
    return engagements.reduce<Record<string, Contract | undefined>>((acc, engagement) => {
      if (engagement.contract) {
        acc[engagement._id] = engagement.contract;
      }
      return acc;
    }, {});
  }, [engagements]);

  const renderEngagementCard = (engagement: Engagement) => {
    return (
      <Card key={engagement._id} className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-semibold text-foreground">{engagement.title}</h3>
              <Badge className={statusBadge[engagement.status] || "bg-slate-100 text-slate-900"}>
                {engagement.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-4">{engagement.description}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Budget: {engagement.currency} {engagement.initialPrice}
            </p>
            <p className="text-sm text-muted-foreground">
              To: {engagement.targetType === "freelancer"
                ? engagement.targetFreelancer?.name || "Freelancer"
                : engagement.targetProvider?.companyName || "Service Provider"}
            </p>
            {engagement.latestOffer && (
              <p className="text-sm text-muted-foreground">
                Latest offer from {engagement.latestOffer.fromRole}: {engagement.currency} {engagement.latestOffer.price}
              </p>
            )}
            {engagement.proposedTerms && (
              <p className="text-sm text-muted-foreground">Terms: {engagement.proposedTerms}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {canAcceptOrDecline(engagement) && (
              <>
                <Button onClick={() => handleAccept(engagement._id)}>
                  {engagement.status === "countered" ? "Accept Counter" : "Accept"}
                </Button>
                <Button variant="outline" onClick={() => handleDecline(engagement._id)}>
                  {engagement.status === "countered" ? "Decline Counter" : "Decline"}
                </Button>
              </>
            )}

            {canCounter(engagement) && (
              <CounterOfferButton engagement={engagement} onSubmit={handleCounter} />
            )}

            {engagement.contract && (
              <Button
                variant="secondary"
                onClick={() => loadMessages(engagement.contract!._id)}
              >
                View Contract
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Engagements & Contracts</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Manage every proposal, negotiation, and signed contract in one place.
              </p>
            </div>
            <Button variant="secondary" onClick={refreshData} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          {loading ? (
            <Card className="p-10 text-center">
              <div className="flex flex-col items-center gap-4">
                <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading engagements...</p>
              </div>
            </Card>
          ) : (
            <Tabs defaultValue="engagements" className="space-y-6">
              <TabsList>
                <TabsTrigger value="engagements">Engagements</TabsTrigger>
                <TabsTrigger value="contracts">Contracts & Messaging</TabsTrigger>
              </TabsList>

              <TabsContent value="engagements" className="space-y-4">
                {engagements.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">No engagements yet</h3>
                    <p className="text-muted-foreground">
                      {isBusiness
                        ? "Send your first engagement request from the marketplace or the engagement form."
                        : "Once a business reaches out, their request will appear here."}
                    </p>
                  </Card>
                ) : (
                  engagements.map(renderEngagementCard)
                )}
              </TabsContent>

              <TabsContent value="contracts">
                {contracts.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">No contracts yet</h3>
                    <p className="text-muted-foreground">
                      Contracts appear here once an engagement is accepted.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {contracts.map((contract) => (
                      <Card key={contract._id} className="p-6 flex flex-col gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-2xl font-semibold text-foreground mr-2">{contract.title}</h3>
                            <Badge variant={contract.status === "completed" ? "secondary" : "default"}>
                              {contract.status}
                            </Badge>
                            {contract.paymentStatus && (
                              <Badge className={paymentBadge[contract.paymentStatus] || "bg-slate-100 text-slate-900"}>
                                {contract.paymentStatus}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-4">{contract.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Budget: {contract.currency} {contract.agreedPrice}
                          </p>
                          {contract.freelancerRequestedRelease && contract.paymentStatus === "held" && isBusiness && (
                            <p className="text-sm text-amber-600 font-semibold mt-2">
                              Payment release requested by your partner.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button variant="secondary" asChild>
                            <Link to={`/contracts/${contract._id}`}>Open Contract</Link>
                          </Button>
                          {isBusiness && contract.status === "active" && (
                            <Button variant="outline" onClick={() => handleCompleteContract(contract._id)}>
                              Mark Completed
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => loadMessages(contract._id)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Messages
                          </Button>
                        </div>

                        {activeContractId === contract._id && (
                          <div className="border-t border-border pt-4 space-y-4">
                            <div className="max-h-60 overflow-y-auto space-y-3">
                              {messageLoading ? (
                                <p className="text-sm text-muted-foreground">Loading messages...</p>
                              ) : (
                                (messages[contract._id] || []).map((message) => (
                                  <div key={message._id} className="text-sm">
                                    <p className="text-muted-foreground">
                                      <span className="font-semibold text-foreground">{message.sender === user?.id ? "You" : "Partner"}:</span>
                                      {" "}
                                      {message.body}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(message.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                rows={2}
                              />
                              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {contracts.some((c) => c.status === "completed") && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {contracts.map((contract) => {
                if (contract.status !== "completed") return null;
                const engagement = engagements.find((eng) => eng.contract?._id === contract._id);
                if (!engagement) return null;
                const target = getReviewTarget(engagement);
                const key = target?.targetUserId ? targetKey(engagement) : "";
                if (!target?.targetUserId || (key && reviewedTargets[key])) return null;
                return (
                  <Card key={`review-${contract._id}`} className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold">Review {target.displayName}</h3>
                      <p className="text-sm text-muted-foreground">Share feedback to help improve future matches.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Rating</Label>
                        <Select
                          value={reviewForms[contract._id]?.rating || "5"}
                          onValueChange={(value) => handleReviewChange(contract._id, "rating", value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 4, 3, 2, 1].map((score) => (
                              <SelectItem key={score} value={score.toString()}>
                                {score} Star{score === 1 ? "" : "s"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Comment</Label>
                        <Textarea
                          className="mt-2"
                          rows={3}
                          placeholder="Describe the experience..."
                          value={reviewForms[contract._id]?.comment || ""}
                          onChange={(e) => handleReviewChange(contract._id, "comment", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleSubmitReview(engagement, contract)}
                        disabled={reviewSubmitting === contract._id}
                      >
                        {reviewSubmitting === contract._id ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

interface CounterOfferButtonProps {
  engagement: Engagement;
  onSubmit: (id: string, close: () => void, price: string, terms: string) => void;
}

const CounterOfferButton = ({ engagement, onSubmit }: CounterOfferButtonProps) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(engagement.latestOffer?.price?.toString() || "");
  const [terms, setTerms] = useState(engagement.latestOffer?.terms || "");

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Counter Offer
      </Button>
      {open && (
        <Card className="p-4 border border-border mt-2 space-y-3">
          <div>
            <Label htmlFor="counterPrice">Price</Label>
            <Input
              id="counterPrice"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1500"
            />
          </div>
          <div>
            <Label htmlFor="counterTerms">Terms</Label>
            <Textarea
              id="counterTerms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Describe payment terms, deliverables, and timelines"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => onSubmit(engagement._id, () => setOpen(false), price, terms)}>
              <ArrowRight className="mr-2 h-4 w-4" /> Send
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default Engagements;
