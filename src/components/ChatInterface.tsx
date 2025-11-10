import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot } from "lucide-react";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm IMPEARL AI. How can I help your business today?" }
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { role: "user", content: message }]);
      setMessage("");
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "I'm analyzing your request. This is a demo interface - the full AI functionality will be available soon!" }
        ]);
      }, 1000);
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
        />
        <Button onClick={handleSend} variant="default">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
