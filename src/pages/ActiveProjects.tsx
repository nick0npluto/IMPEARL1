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
  projectTitle: string;
  projectDescription: string;
  budget: number;
  deadline: string;
  status: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

const ActiveProjects: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("active");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchContracts();
  }, [navigate]);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(response.data.contracts);
      setLoading(false);
    } catch (error) {
      console.error("Fetch contracts error:", error);
      setLoading(false);
    }
  };

  const handleAcceptContract = async (contractId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/contracts/${contractId}/status`,
        { status: "active" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      fetchContracts();
      alert("Contract accepted successfully!");
    } catch (error) {
      console.error("Accept contract error:", error);
      alert("Failed to accept contract");
    }
  };

  const handleMarkComplete = async (contractId: string) => {
    if (!confirm("Mark this project as completed?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/contracts/${contractId}/status`,
        { status: "completed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      fetchContracts();
      alert("Project marked as completed!");
    } catch (error) {
      console.error("Complete contract error:", error);
      alert("Failed to mark project as completed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "pending":
        return "#ff9800";
      case "completed":
        return "#2196f3";
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filter === "all") return true;
    return contract.status === filter;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Active Projects</h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {contracts.filter((c) => c.status === "pending").length}
          </div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {contracts.filter((c) => c.status === "active").length}
          </div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {contracts.filter((c) => c.status === "completed").length}
          </div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{contracts.length}</div>
          <div style={styles.statLabel}>Total Projects</div>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilter("pending")}
          style={{
            ...styles.filterButton,
            ...(filter === "pending" ? styles.activeFilter : {}),
          }}
        >
          Pending ({contracts.filter((c) => c.status === "pending").length})
        </button>
        <button
          onClick={() => setFilter("active")}
          style={{
            ...styles.filterButton,
            ...(filter === "active" ? styles.activeFilter : {}),
          }}
        >
          Active ({contracts.filter((c) => c.status === "active").length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{
            ...styles.filterButton,
            ...(filter === "completed" ? styles.activeFilter : {}),
          }}
        >
          Completed ({contracts.filter((c) => c.status === "completed").length})
        </button>
        <button
          onClick={() => setFilter("all")}
          style={{
            ...styles.filterButton,
            ...(filter === "all" ? styles.activeFilter : {}),
          }}
        >
          All ({contracts.length})
        </button>
      </div>

      {/* Projects List */}
      <div style={styles.projectsSection}>
        {filteredContracts.length === 0 ? (
          <p style={styles.emptyText}>
            {filter === "all"
              ? "No projects yet"
              : `No ${filter} projects`}
          </p>
        ) : (
          <div style={styles.projectsList}>
            {filteredContracts.map((contract) => {
              const daysLeft = getDaysUntilDeadline(contract.deadline);
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft <= 3 && daysLeft >= 0;

              return (
                <div key={contract._id} style={styles.projectCard}>
                  <div style={styles.projectHeader}>
                    <div>
                      <h3 style={styles.projectTitle}>{contract.projectTitle}</h3>
                      <div style={styles.clientName}>
                        Client:{" "}
                        {contract.businessId.businessProfile?.companyName ||
                          contract.businessId.email}
                      </div>
                    </div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(contract.status),
                      }}
                    >
                      {contract.status.toUpperCase()}
                    </div>
                  </div>

                  <div style={styles.projectDescription}>
                    {contract.projectDescription}
                  </div>

                  <div style={styles.projectDetails}>
                    <div style={styles.detailRow}>
                      <span>Budget:</span>
                      <span style={styles.budget}>${contract.budget}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span>Deadline:</span>
                      <span
                        style={{
                          color: isOverdue ? "#f44336" : isUrgent ? "#ff9800" : "#666",
                          fontWeight: isOverdue || isUrgent ? "bold" : "normal",
                        }}
                      >
                        {formatDate(contract.deadline)}
                        {contract.status === "active" && (
                          <>
                            {" "}
                            ({isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`})
                          </>
                        )}
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span>Created:</span>
                      <span>{formatDate(contract.createdAt)}</span>
                    </div>
                    {contract.acceptedAt && (
                      <div style={styles.detailRow}>
                        <span>Accepted:</span>
                        <span>{formatDate(contract.acceptedAt)}</span>
                      </div>
                    )}
                    {contract.completedAt && (
                      <div style={styles.detailRow}>
                        <span>Completed:</span>
                        <span>{formatDate(contract.completedAt)}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.actions}>
                    {contract.status === "pending" && (
                      <button
                        onClick={() => handleAcceptContract(contract._id)}
                        style={styles.acceptButton}
                      >
                        Accept Contract
                      </button>
                    )}
                    {contract.status === "active" && (
                      <>
                        <button
                          onClick={() => handleMarkComplete(contract._id)}
                          style={styles.completeButton}
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() => navigate("/messages")}
                          style={styles.messagesButton}
                        >
                          View Messages
                        </button>
                      </>
                    )}
                    {contract.status === "completed" && (
                      <button
                        onClick={() => navigate("/messages")}
                        style={styles.messagesButton}
                      >
                        View Messages
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
  projectsSection: {
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
  projectsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  projectCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fafafa",
  },
  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #e0e0e0",
  },
  projectTitle: {
    fontSize: "20px",
    marginBottom: "5px",
    color: "#333",
  },
  clientName: {
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
  projectDescription: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
    color: "#555",
    lineHeight: "1.6",
  },
  projectDetails: {
    marginBottom: "15px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
  },
  budget: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#4caf50",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid #e0e0e0",
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
  messagesButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ActiveProjects;
