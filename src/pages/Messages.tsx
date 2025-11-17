import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { Loader2, MessageSquare, Send } from "lucide-react";

interface ContractSummary {
  _id: string;
  title: string;
  status: "active" | "completed";
  description?: string;
  agreedPrice: number;
  currency: string;
  engagementRequest?: {
    targetType: "freelancer" | "service_provider";
    targetFreelancer?: { name?: string; user?: string };
    targetProvider?: { companyName?: string; user?: string };
    fromBusiness?: { businessName?: string; user?: string };
  };
}

interface MessageItem {
  _id: string;
  sender: string;
  receiver: string;
  body: string;
  createdAt: string;
}

const Messages = () => {
  const { toast } = useToast();
  const user = ApiService.getUser();
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [activeContractId, setActiveContractId] = useState<string>("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const loadContracts = async () => {
      try {
        setLoadingContracts(true);
        const response = await ApiService.getContracts();
        setContracts(response.contracts || []);
        if (response.contracts?.length) {
          setActiveContractId(response.contracts[0]._id);
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Unable to load contracts", variant: "destructive" });
      } finally {
        setLoadingContracts(false);
      }
    };

    loadContracts();
  }, [toast]);

  useEffect(() => {
    if (!activeContractId) return;
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await ApiService.getMessages(activeContractId);
        setMessages(response.messages || []);
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Unable to load messages", variant: "destructive" });
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeContractId, toast]);

  const activeContract = contracts.find((contract) => contract._id === activeContractId);

  const partnerName = (() => {
    if (!activeContract?.engagementRequest) return "Partner";
    const req = activeContract.engagementRequest;
    if (user?.userType === "business") {
      return req.targetType === "freelancer"
        ? req.targetFreelancer?.name || "Freelancer"
        : req.targetProvider?.companyName || "Service Provider";
    }
    return req.fromBusiness?.businessName || "Business";
  })();

  const resolveReceiver = () => {
    if (!activeContract?.engagementRequest) return null;
    const req = activeContract.engagementRequest;
    if (user?.userType === "business") {
      return req.targetType === "freelancer" ? req.targetFreelancer?.user : req.targetProvider?.user;
    }
    return req.fromBusiness?.user;
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeContractId) return;
    const receiverId = resolveReceiver();
    if (!receiverId) {
      toast({ title: "Missing recipient", description: "Unable to determine who should receive this message.", variant: "destructive" });
      return;
    }
    try {
      await ApiService.sendMessage({
        contractId: activeContractId,
        body: newMessage,
        receiverId,
      });
      setNewMessage("");
      const response = await ApiService.getMessages(activeContractId);
      setMessages(response.messages || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to send message", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Contracts</h2>
            </div>
            {loadingContracts ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading contracts...
              </div>
            ) : contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contracts yet.</p>
            ) : (
              <div className="space-y-2">
                {contracts.map((contract) => (
                  <button
                    key={contract._id}
                    className={`w-full text-left rounded border p-3 transition ${contract._id === activeContractId ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    onClick={() => setActiveContractId(contract._id)}
                  >
                    <p className="font-semibold text-sm">{contract.title}</p>
                    <p className="text-xs text-muted-foreground">{contract.status}</p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 lg:col-span-2 flex flex-col h-[600px]">
            {activeContract ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold text-foreground">{partnerName}</h3>
                    <Badge>{activeContract.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activeContract.description || ""}</p>
                </div>
                <div className="flex-1 rounded border border-border p-4 overflow-y-auto space-y-3">
                  {loadingMessages ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No messages yet.</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message._id} className="text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{message.sender === user?.id ? "You" : partnerName}:</span> {message.body}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
                  <Button onClick={handleSend} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a contract to start messaging.</div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Messages;
