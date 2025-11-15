import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Contract {
  _id: string;
  projectTitle: string;
  freelancerId: {
    _id: string;
    email: string;
    freelancerProfile?: { firstName: string; lastName: string };
  };
}

interface Payment {
  _id: string;
  contractId: {
    _id: string;
    projectTitle: string;
  };
  payerId: {
    _id: string;
    email: string;
    businessProfile?: { companyName: string };
  };
  payeeId: {
    _id: string;
    email: string;
    freelancerProfile?: { firstName: string; lastName: string };
  };
  amount: number;
  invoiceNumber: string;
  status: string;
  paymentMethod: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

interface PaymentStats {
  totalPaid: number;
  totalReceived: number;
  pendingPayments: number;
  pendingReceivables: number;
  completedPayments: number;
  completedReceivables: number;
}

const PayCenter: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);

  // Form state
  const [selectedContract, setSelectedContract] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchPayments();
    fetchStats();
    fetchContracts();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPayments(data.payments);
      setLoading(false);
    } catch (error) {
      console.error("Fetch payments error:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/payments/stats/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      // Only show active or completed contracts where user is business
      const businessContracts = data.contracts.filter(
        (c: any) =>
          c.businessId._id === currentUser.userId &&
          (c.status === "active" || c.status === "completed")
      );
      setContracts(businessContracts);
    } catch (error) {
      console.error("Fetch contracts error:", error);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContract || !amount || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contractId: selectedContract,
          amount: parseFloat(amount),
          paymentMethod,
          dueDate,
          notes,
        }),
      });

      if (response.ok) {
        // Reset form
        setSelectedContract("");
        setAmount("");
        setPaymentMethod("credit_card");
        setDueDate("");
        setNotes("");
        setShowCreateModal(false);

        // Refresh data
        fetchPayments();
        fetchStats();
        alert("Payment created successfully!");
      } else {
        alert("Failed to create payment");
      }
    } catch (error) {
      console.error("Create payment error:", error);
      alert("Failed to create payment");
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchPayments();
        fetchStats();
        alert(`Payment status updated to ${newStatus}`);
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update status");
    }
  };

  const handleDownloadInvoice = (payment: Payment) => {
    const invoiceContent = `
INVOICE
Invoice Number: ${payment.invoiceNumber}
Date: ${new Date(payment.createdAt).toLocaleDateString()}

From: ${payment.payerId.businessProfile?.companyName || payment.payerId.email}
To: ${
      payment.payeeId.freelancerProfile
        ? `${payment.payeeId.freelancerProfile.firstName} ${payment.payeeId.freelancerProfile.lastName}`
        : payment.payeeId.email
    }

Project: ${payment.contractId.projectTitle}
Amount: $${payment.amount.toFixed(2)}
Payment Method: ${payment.paymentMethod.replace("_", " ").toUpperCase()}
Due Date: ${new Date(payment.dueDate).toLocaleDateString()}
Status: ${payment.status.toUpperCase()}
${payment.paidDate ? `Paid Date: ${new Date(payment.paidDate).toLocaleDateString()}` : ""}
${payment.notes ? `Notes: ${payment.notes}` : ""}
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${payment.invoiceNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4caf50";
      case "pending":
        return "#ff9800";
      case "cancelled":
        return "#f44336";
      default:
        return "#666";
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading payments...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pay Center</h1>
        <div style={styles.headerActions}>
          <button onClick={() => setShowCreateModal(true)} style={styles.createButton}>
            + Create Payment
          </button>
          <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.totalPaid.toFixed(2)}</div>
            <div style={styles.statLabel}>Total Paid</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.totalReceived.toFixed(2)}</div>
            <div style={styles.statLabel}>Total Received</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.pendingPayments.toFixed(2)}</div>
            <div style={styles.statLabel}>Pending Payments</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.pendingReceivables.toFixed(2)}</div>
            <div style={styles.statLabel}>Pending Receivables</div>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div style={styles.paymentsSection}>
        <h2 style={styles.sectionTitle}>All Payments</h2>
        {payments.length === 0 ? (
          <p style={styles.emptyText}>No payments yet</p>
        ) : (
          <div style={styles.paymentsList}>
            {payments.map((payment) => (
              <div key={payment._id} style={styles.paymentCard}>
                <div style={styles.paymentHeader}>
                  <div>
                    <div style={styles.invoiceNumber}>{payment.invoiceNumber}</div>
                    <div style={styles.projectTitle}>{payment.contractId.projectTitle}</div>
                  </div>
                  <div style={styles.amount}>${payment.amount.toFixed(2)}</div>
                </div>

                <div style={styles.paymentDetails}>
                  <div style={styles.detailRow}>
                    <span>From:</span>
                    <span>
                      {payment.payerId.businessProfile?.companyName || payment.payerId.email}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>To:</span>
                    <span>
                      {payment.payeeId.freelancerProfile
                        ? `${payment.payeeId.freelancerProfile.firstName} ${payment.payeeId.freelancerProfile.lastName}`
                        : payment.payeeId.email}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Payment Method:</span>
                    <span>{payment.paymentMethod.replace("_", " ").toUpperCase()}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Due Date:</span>
                    <span>{formatDate(payment.dueDate)}</span>
                  </div>
                  {payment.paidDate && (
                    <div style={styles.detailRow}>
                      <span>Paid Date:</span>
                      <span>{formatDate(payment.paidDate)}</span>
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <span>Status:</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(payment.status),
                      }}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </div>
                  {payment.notes && (
                    <div style={styles.notes}>
                      <strong>Notes:</strong> {payment.notes}
                    </div>
                  )}
                </div>

                <div style={styles.paymentActions}>
                  <button
                    onClick={() => handleDownloadInvoice(payment)}
                    style={styles.downloadButton}
                  >
                    📥 Download Invoice
                  </button>

                  {payment.status === "pending" &&
                    payment.payerId._id === currentUser.userId && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(payment._id, "completed")}
                          style={styles.markPaidButton}
                        >
                          ✓ Mark as Paid
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(payment._id, "cancelled")}
                          style={styles.cancelButton}
                        >
                          ✗ Cancel
                        </button>
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Create Payment Invoice</h2>
            <form onSubmit={handleCreatePayment}>
              <div style={styles.formGroup}>
                <label>Contract:</label>
                <select
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">Select a contract</option>
                  {contracts.map((contract) => (
                    <option key={contract._id} value={contract._id}>
                      {contract.projectTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Amount ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Due Date:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label>Notes (optional):</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={styles.textarea}
                  placeholder="Add any additional notes..."
                  rows={3}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitButton}>
                  Create Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelModalButton}
                >
                  Cancel
                </button>
              </div>
            </form>
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
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  createButton: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#2196f3",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    textTransform: "uppercase",
  },
  paymentsSection: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    padding: "20px",
  },
  paymentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  paymentCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fafafa",
  },
  paymentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #e0e0e0",
  },
  invoiceNumber: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2196f3",
  },
  projectTitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "5px",
  },
  amount: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#4caf50",
  },
  paymentDetails: {
    marginBottom: "15px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  },
  notes: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "5px",
    fontSize: "14px",
  },
  paymentActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e0e0e0",
  },
  downloadButton: {
    padding: "8px 16px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
  },
  markPaidButton: {
    padding: "8px 16px",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
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
    maxHeight: "90vh",
    overflowY: "auto",
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
  cancelModalButton: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default PayCenter;