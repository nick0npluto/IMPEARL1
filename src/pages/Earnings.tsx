import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  amount: number;
  invoiceNumber: string;
  status: string;
  paymentMethod: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

interface PaymentStats {
  totalReceived: number;
  pendingReceivables: number;
  completedReceivables: number;
}

const Earnings: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchPayments();
    fetchStats();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter to only show payments where user is the payee (freelancer receiving money)
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const receivedPayments = response.data.payments.filter(
        (p: Payment) => p.payeeId._id === currentUser.userId
      );
      setPayments(receivedPayments);
      setLoading(false);
    } catch (error) {
      console.error("Fetch payments error:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/payments/stats/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats({
        totalReceived: response.data.stats.totalReceived,
        pendingReceivables: response.data.stats.pendingReceivables,
        completedReceivables: response.data.stats.completedReceivables,
      });
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleDownloadInvoice = (payment: Payment) => {
    const invoiceContent = `
INVOICE - PAYMENT RECEIVED
Invoice Number: ${payment.invoiceNumber}
Date: ${new Date(payment.createdAt).toLocaleDateString()}

From: ${payment.payerId.businessProfile?.companyName || payment.payerId.email}
Project: ${payment.contractId.projectTitle}

Amount: $${payment.amount.toFixed(2)}
Payment Method: ${payment.paymentMethod.replace("_", " ").toUpperCase()}
Due Date: ${new Date(payment.dueDate).toLocaleDateString()}
Status: ${payment.status.toUpperCase()}
${payment.paidDate ? `Paid Date: ${new Date(payment.paidDate).toLocaleDateString()}` : ""}
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${payment.invoiceNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Prepare chart data (earnings over time)
  const getEarningsOverTime = () => {
    const earningsByMonth: { [key: string]: number } = {};
    
    payments
      .filter((p) => p.status === "completed" && p.paidDate)
      .forEach((payment) => {
        const date = new Date(payment.paidDate!);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + payment.amount;
      });

    return Object.entries(earningsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === "all") return true;
    return payment.status === filter;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading earnings...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Earnings</h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.totalReceived.toFixed(2)}</div>
            <div style={styles.statLabel}>Total Earned</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>${stats.pendingReceivables.toFixed(2)}</div>
            <div style={styles.statLabel}>Pending Payments</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.completedReceivables}</div>
            <div style={styles.statLabel}>Completed Payments</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{payments.length}</div>
            <div style={styles.statLabel}>Total Invoices</div>
          </div>
        </div>
      )}

      {/* Earnings Chart */}
      {getEarningsOverTime().length > 0 && (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Earnings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getEarningsOverTime()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4caf50"
                strokeWidth={2}
                name="Earnings ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filter */}
      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter("all")}
          style={{
            ...styles.filterButton,
            ...(filter === "all" ? styles.activeFilter : {}),
          }}
        >
          All ({payments.length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{
            ...styles.filterButton,
            ...(filter === "completed" ? styles.activeFilter : {}),
          }}
        >
          Received ({payments.filter((p) => p.status === "completed").length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          style={{
            ...styles.filterButton,
            ...(filter === "pending" ? styles.activeFilter : {}),
          }}
        >
          Pending ({payments.filter((p) => p.status === "pending").length})
        </button>
      </div>

      {/* Payments List */}
      <div style={styles.paymentsSection}>
        <h2 style={styles.sectionTitle}>Payment History</h2>
        {filteredPayments.length === 0 ? (
          <p style={styles.emptyText}>
            {filter === "all" ? "No payments yet" : `No ${filter} payments`}
          </p>
        ) : (
          <div style={styles.paymentsList}>
            {filteredPayments.map((payment) => (
              <div key={payment._id} style={styles.paymentCard}>
                <div style={styles.paymentHeader}>
                  <div>
                    <div style={styles.invoiceNumber}>{payment.invoiceNumber}</div>
                    <div style={styles.projectTitle}>
                      {payment.contractId.projectTitle}
                    </div>
                    <div style={styles.clientName}>
                      From:{" "}
                      {payment.payerId.businessProfile?.companyName ||
                        payment.payerId.email}
                    </div>
                  </div>
                  <div style={styles.amount}>${payment.amount.toFixed(2)}</div>
                </div>

                <div style={styles.paymentDetails}>
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
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() => handleDownloadInvoice(payment)}
                    style={styles.downloadButton}
                  >
                    📥 Download Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    color: "#4caf50",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    textTransform: "uppercase",
  },
  chartContainer: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  chartTitle: {
    fontSize: "20px",
    marginBottom: "20px",
    color: "#333",
  },
  filterContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "10px 20px",
    backgroundColor: "white",
    border: "2px solid #e0e0e0",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  activeFilter: {
    backgroundColor: "#4caf50",
    color: "white",
    borderColor: "#4caf50",
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
    padding: "40px",
    fontSize: "16px",
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
  clientName: {
    fontSize: "13px",
    color: "#999",
    marginTop: "3px",
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
  actions: {
    display: "flex",
    gap: "10px",
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
};

export default Earnings;
