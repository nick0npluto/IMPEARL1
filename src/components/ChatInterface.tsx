import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";

interface ChatInterfaceProps {
  context?: Record<string, any>;
}

const ChatInterface = ({ context = {} }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm IMPEARL AI. How can I help your business today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const userMessage = { role: "user", content: message };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await ApiService.sendSupportMessage(nextMessages, context);
      const reply = response.reply || "I'm here to help!";
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (error: any) {
      toast({
        title: "Support unavailable",
        description: error.message || "Unable to reach the IMPEARL assistant right now.",
        variant: "destructive",
      });
      setMessages([...nextMessages, { role: "assistant", content: "I'm having trouble responding right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-border">
        <Bot className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold text-card-foreground">AI Assistant</h3>
      </div>

      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === "user"
                  ? "bg-gradient-card text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder="Ask IMPEARL anything about your business..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleSend} variant="default" disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
