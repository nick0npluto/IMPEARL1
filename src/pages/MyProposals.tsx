import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

interface Proposal {
  _id: string;
  jobId: string;
  jobTitle: string;
  businessId: {
    _id: string;
    email: string;
    businessProfile?: { companyName: string };
  };
  proposalText: string;
  proposedRate: number;
  estimatedDuration: string;
  status: string;
  createdAt: string;
  respondedAt?: string;
}

interface ProposalStats {
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  withdrawnProposals: number;
  acceptanceRate: string;
}

const MyProposals: React.FC = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!apiService.getToken()) {
      navigate("/login");
      return;
    }
    fetchProposals();
    fetchStats();
  }, [navigate]);

  const fetchProposals = async () => {
    try {
      const response = await apiService.getFreelancerProposals();
      setProposals(response.proposals);
      setLoading(false);
    } catch (error) {
      console.error("Fetch proposals error:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getProposalStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const handleWithdraw = async (proposalId: string) => {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;

    try {
      await apiService.withdrawProposal(proposalId);
      fetchProposals();
      fetchStats();
      alert("Proposal withdrawn successfully");
    } catch (error: any) {
      console.error("Withdraw proposal error:", error);
      alert(error.message || "Failed to withdraw proposal");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "#4caf50";
      case "pending":
        return "#ff9800";
      case "rejected":
        return "#f44336";
      case "withdrawn":
        return "#9e9e9e";
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

  const filteredProposals = proposals.filter((proposal) => {
    if (filter === "all") return true;
    return proposal.status === filter;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading proposals...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Proposals</h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalProposals}</div>
            <div style={styles.statLabel}>Total Proposals</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.pendingProposals}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.acceptedProposals}</div>
            <div style={styles.statLabel}>Accepted</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.acceptanceRate}%</div>
            <div style={styles.statLabel}>Acceptance Rate</div>
          </div>
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
          All ({proposals.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          style={{
            ...styles.filterButton,
            ...(filter === "pending" ? styles.activeFilter : {}),
          }}
        >
          Pending ({proposals.filter((p) => p.status === "pending").length})
        </button>
        <button
          onClick={() => setFilter("accepted")}
          style={{
            ...styles.filterButton,
            ...(filter === "accepted" ? styles.activeFilter : {}),
          }}
        >
          Accepted ({proposals.filter((p) => p.status === "accepted").length})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          style={{
            ...styles.filterButton,
            ...(filter === "rejected" ? styles.activeFilter : {}),
          }}
        >
          Rejected ({proposals.filter((p) => p.status === "rejected").length})
        </button>
      </div>

      {/* Proposals List */}
      <div style={styles.proposalsSection}>
        {filteredProposals.length === 0 ? (
          <p style={styles.emptyText}>
            {filter === "all"
              ? "No proposals yet. Start browsing jobs!"
              : `No ${filter} proposals`}
          </p>
        ) : (
          <div style={styles.proposalsList}>
            {filteredProposals.map((proposal) => (
              <div key={proposal._id} style={styles.proposalCard}>
                <div style={styles.proposalHeader}>
                  <div>
                    <h3 style={styles.jobTitle}>{proposal.jobTitle}</h3>
                    <div style={styles.companyName}>
                      {proposal.businessId.businessProfile?.companyName ||
                        proposal.businessId.email}
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(proposal.status),
                    }}
                  >
                    {proposal.status.toUpperCase()}
                  </div>
                </div>

                <div style={styles.proposalDetails}>
                  <div style={styles.detailRow}>
                    <span>Proposed Rate:</span>
                    <span style={styles.rate}>${proposal.proposedRate}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Estimated Duration:</span>
                    <span>{proposal.estimatedDuration}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>Submitted:</span>
                    <span>{formatDate(proposal.createdAt)}</span>
                  </div>
                  {proposal.respondedAt && (
                    <div style={styles.detailRow}>
                      <span>Responded:</span>
                      <span>{formatDate(proposal.respondedAt)}</span>
                    </div>
                  )}
                </div>

                <div style={styles.proposalText}>
                  <strong>Proposal:</strong>
                  <p>{proposal.proposalText}</p>
                </div>

                <div style={styles.actions}>
                  {proposal.status === "pending" && (
                    <button
                      onClick={() => handleWithdraw(proposal._id)}
                      style={styles.withdrawButton}
                    >
                      Withdraw Proposal
                    </button>
                  )}
                  {proposal.status === "accepted" && (
                    <button
                      onClick={() => navigate("/messages")}
                      style={styles.messagesButton}
                    >
                      Go to Messages
                    </button>
                  )}
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
    color: "#2196f3",
    marginBottom: "10px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    textTransform: "uppercase",
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
    backgroundColor: "#2196f3",
    color: "white",
    borderColor: "#2196f3",
  },
  proposalsSection: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    padding: "40px",
    fontSize: "16px",
  },
  proposalsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  proposalCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fafafa",
  },
  proposalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #e0e0e0",
  },
  jobTitle: {
    fontSize: "20px",
    marginBottom: "5px",
    color: "#333",
  },
  companyName: {
    fontSize: "14px",
    color: "#666",
  },
  statusBadge: {
    padding: "6px 16px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  },
  proposalDetails: {
    marginBottom: "15px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
  },
  rate: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#4caf50",
  },
  proposalText: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e0e0e0",
  },
  withdrawButton: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  messagesButton: {
    padding: "10px 20px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default MyProposals;