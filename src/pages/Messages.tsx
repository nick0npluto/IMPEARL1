import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Contract {
  _id: string;
  businessId: {
    _id: string;
    email: string;
    businessProfile?: { companyName: string };
  };
  freelancerId: {
    _id: string;
    email: string;
    freelancerProfile?: { firstName: string; lastName: string };
  };
  projectTitle: string;
  projectDescription: string;
  budget: number;
  deadline: string;
  status: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
}

interface Message {
  _id: string;
  contractId: string;
  senderId: {
    _id: string;
    email: string;
  };
  recipientId: {
    _id: string;
    email: string;
  };
  message: string;
  read: boolean;
  timestamp: string;
}

interface Conversation {
  contract: Contract;
  lastMessage: Message | null;
  unreadCount: number;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchConversations();
  }, [navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedContract) {
      interval = setInterval(() => {
        fetchMessages(selectedContract._id);
      }, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedContract]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversations(response.data.conversations);
      setLoading(false);
    } catch (error) {
      console.error("Fetch conversations error:", error);
      setLoading(false);
    }
  };

  const fetchMessages = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/messages/contract/${contractId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Fetch messages error:", error);
    }
  };

  const handleSelectContract = (contract: Contract) => {
    setSelectedContract(contract);
    fetchMessages(contract._id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContract) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/messages",
        {
          contractId: selectedContract._id,
          message: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage("");
      fetchMessages(selectedContract._id);
      fetchConversations();
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedContract) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/contracts/${selectedContract._id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      const updatedContract = { ...selectedContract, status: newStatus };
      setSelectedContract(updatedContract);
      
      // Refresh conversations
      fetchConversations();
      
      alert(`Contract status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update status");
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedContract) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/contracts/${selectedContract._id}/review`,
        {
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment("");
      fetchConversations();
      
      // Refresh selected contract
      const response = await axios.get(
        `http://localhost:5000/api/contracts/${selectedContract._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedContract(response.data.contract);
      
      alert("Review submitted successfully!");
    } catch (error: any) {
      console.error("Submit review error:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const getOtherParty = (contract: Contract) => {
    const isBusiness = contract.businessId._id === currentUser.userId;
    if (isBusiness) {
      return contract.freelancerId.freelancerProfile
        ? `${contract.freelancerId.freelancerProfile.firstName} ${contract.freelancerId.freelancerProfile.lastName}`
        : contract.freelancerId.email;
    } else {
      return contract.businessId.businessProfile?.companyName || contract.businessId.email;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading conversations...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Messages & Contracts</h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* Conversations List */}
        <div style={styles.sidebar}>
          <h2 style={styles.sidebarTitle}>Conversations</h2>
          {conversations.length === 0 ? (
            <p style={styles.emptyText}>No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.contract._id}
                style={{
                  ...styles.conversationItem,
                  ...(selectedContract?._id === conv.contract._id
                    ? styles.selectedConversation
                    : {}),
                }}
                onClick={() => handleSelectContract(conv.contract)}
              >
                <div style={styles.conversationHeader}>
                  <strong>{getOtherParty(conv.contract)}</strong>
                  {conv.unreadCount > 0 && (
                    <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                  )}
                </div>
                <div style={styles.conversationProject}>{conv.contract.projectTitle}</div>
                <div style={styles.conversationStatus}>
                  Status: <span style={styles.statusBadge}>{conv.contract.status}</span>
                </div>
                {conv.lastMessage && (
                  <div style={styles.lastMessage}>
                    {conv.lastMessage.message.substring(0, 50)}...
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {selectedContract ? (
            <>
              {/* Contract Details */}
              <div style={styles.contractDetails}>
                <h2>{selectedContract.projectTitle}</h2>
                <p>{selectedContract.projectDescription}</p>
                <div style={styles.contractMeta}>
                  <span>Budget: ${selectedContract.budget}</span>
                  <span>Deadline: {formatDate(selectedContract.deadline)}</span>
                  <span>
                    Status: <strong>{selectedContract.status}</strong>
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={styles.actions}>
                  {selectedContract.status === "pending" &&
                    selectedContract.freelancerId._id === currentUser.userId && (
                      <button
                        onClick={() => handleUpdateStatus("active")}
                        style={styles.acceptButton}
                      >
                        Accept Contract
                      </button>
                    )}

                  {selectedContract.status === "active" && (
                    <button
                      onClick={() => handleUpdateStatus("completed")}
                      style={styles.completeButton}
                    >
                      Mark as Completed
                    </button>
                  )}

                  {selectedContract.status === "completed" &&
                    selectedContract.businessId._id === currentUser.userId &&
                    !selectedContract.review && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        style={styles.reviewButton}
                      >
                        Leave Review
                      </button>
                    )}

                  {selectedContract.review && (
                    <div style={styles.reviewDisplay}>
                      <strong>Review:</strong> {selectedContract.review.rating}⭐
                      <p>{selectedContract.review.comment}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div style={styles.messagesContainer}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      ...styles.message,
                      ...(msg.senderId._id === currentUser.userId
                        ? styles.sentMessage
                        : styles.receivedMessage),
                    }}
                  >
                    <div style={styles.messageText}>{msg.message}</div>
                    <div style={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                  </div>
                ))}
              </div>

              {/* Send Message */}
              <form onSubmit={handleSendMessage} style={styles.messageForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={styles.messageInput}
                />
                <button type="submit" style={styles.sendButton}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={styles.emptyChat}>Select a conversation to start messaging</div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Leave a Review</h2>
            <div style={styles.formGroup}>
              <label>Rating:</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                style={styles.input}
              >
                <option value={5}>5 Stars - Excellent</option>
                <option value={4}>4 Stars - Good</option>
                <option value={3}>3 Stars - Average</option>
                <option value={2}>2 Stars - Below Average</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Comment:</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                style={styles.textarea}
                rows={4}
              />
            </div>
            <div style={styles.modalActions}>
              <button onClick={handleSubmitReview} style={styles.submitButton}>
                Submit Review
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    color: "#333",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
  },
  content: {
    display: "flex",
    gap: "20px",
    height: "calc(100vh - 150px)",
  },
  sidebar: {
    width: "350px",
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    overflowY: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  sidebarTitle: {
    fontSize: "20px",
    marginBottom: "20px",
  },
  conversationItem: {
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    border: "1px solid #e0e0e0",
    transition: "all 0.2s",
  },
  selectedConversation: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  conversationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  unreadBadge: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
  },
  conversationProject: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px",
  },
  conversationStatus: {
    fontSize: "12px",
    color: "#888",
  },
  statusBadge: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  lastMessage: {
    fontSize: "12px",
    color: "#999",
    marginTop: "5px",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    padding: "20px",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  contractDetails: {
    borderBottom: "2px solid #e0e0e0",
    paddingBottom: "20px",
    marginBottom: "20px",
  },
  contractMeta: {
    display: "flex",
    gap: "20px",
    marginTop: "10px",
    fontSize: "14px",
  },
  actions: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  acceptButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  completeButton: {
    padding: "10px 20px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  reviewButton: {
    padding: "10px 20px",
    backgroundColor: "#ff9800",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  reviewDisplay: {
    backgroundColor: "#fff3cd",
    padding: "10px",
    borderRadius: "5px",
    marginTop: "10px",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    maxWidth: "70%",
    padding: "10px 15px",
    borderRadius: "10px",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2196f3",
    color: "white",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    color: "#333",
  },
  messageText: {
    marginBottom: "5px",
  },
  messageTime: {
    fontSize: "11px",
    opacity: 0.7,
  },
  emptyChat: {
    textAlign: "center",
    color: "#999",
    padding: "50px",
    fontSize: "18px",
  },
  messageForm: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    borderTop: "2px solid #e0e0e0",
    paddingTop: "20px",
  },
  messageInput: {
    flex: 1,
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
  },
  sendButton: {
    padding: "12px 30px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    marginTop: "5px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    marginTop: "5px",
    resize: "vertical",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Messages;
