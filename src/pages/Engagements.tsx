import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
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
    businessName?: string;
    goals?: string;
    description?: string;
    user?: string;
  };
  targetFreelancer?: {
    name?: string;
    expertise?: string;
    user?: string;
  };
  targetProvider?: {
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

const Engagements = () => {
  const { toast } = useToast();
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

  const isBusiness = userType === "business";
  const isTalent = userType === "freelancer" || userType === "service_provider";

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
      setMessages((prev) => ({ ...prev, [contractId]: response.messages || [] }));
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

  const handlePayment = async (contract: Contract) => {
    try {
      await ApiService.createPayment({ contractId: contract._id, amount: contract.agreedPrice });
      toast({ title: "Payment processed", description: "Payment has been recorded." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to process payment", variant: "destructive" });
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
            {isTalent && engagement.status === "pending" && (
              <>
                <Button onClick={() => handleAccept(engagement._id)}>Accept</Button>
                <Button variant="outline" onClick={() => handleDecline(engagement._id)}>
                  Decline
                </Button>
                <CounterOfferButton engagement={engagement} onSubmit={handleCounter} />
              </>
            )}

            {isBusiness && engagement.status === "countered" && (
              <Button onClick={() => handleAccept(engagement._id)}>Accept Counter</Button>
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
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-semibold text-foreground">{contract.title}</h3>
                            <Badge variant={contract.status === "completed" ? "secondary" : "default"}>
                              {contract.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{contract.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Budget: {contract.currency} {contract.agreedPrice}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {isBusiness && contract.status === "active" && (
                            <Button onClick={() => handlePayment(contract)}>
                              <DollarSign className="mr-2 h-4 w-4" /> Make Payment
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
                              <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
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
