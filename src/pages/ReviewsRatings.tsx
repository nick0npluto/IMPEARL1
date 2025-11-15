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
  budget: number;
  status: string;
  completedAt?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

const ReviewsRatings: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter only completed contracts with reviews
      const reviewedContracts = response.data.contracts.filter(
        (c: Contract) => c.status === "completed" && c.review
      );
      setContracts(reviewedContracts);
      setLoading(false);
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (contracts.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0,
      };
    }

    const totalRating = contracts.reduce(
      (sum, contract) => sum + (contract.review?.rating || 0),
      0
    );
    const averageRating = totalRating / contracts.length;

    return {
      averageRating: averageRating.toFixed(1),
      totalReviews: contracts.length,
      fiveStars: contracts.filter((c) => c.review?.rating === 5).length,
      fourStars: contracts.filter((c) => c.review?.rating === 4).length,
      threeStars: contracts.filter((c) => c.review?.rating === 3).length,
      twoStars: contracts.filter((c) => c.review?.rating === 2).length,
      oneStar: contracts.filter((c) => c.review?.rating === 1).length,
    };
  };

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reviews & Ratings</h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Overall Stats */}
      <div style={styles.overallStatsCard}>
        <div style={styles.ratingSection}>
          <div style={styles.overallRating}>{stats.averageRating}</div>
          <div style={styles.overallStars}>
            {renderStars(Math.round(parseFloat(stats.averageRating)))}
          </div>
          <div style={styles.totalReviews}>{stats.totalReviews} reviews</div>
        </div>

        <div style={styles.ratingBreakdown}>
          <h3 style={styles.breakdownTitle}>Rating Breakdown</h3>
          <div style={styles.breakdownList}>
            <div style={styles.breakdownRow}>
              <span>5 ⭐</span>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(stats.fiveStars / stats.totalReviews) * 100}%`,
                  }}
                />
              </div>
              <span>{stats.fiveStars}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span>4 ⭐</span>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(stats.fourStars / stats.totalReviews) * 100}%`,
                  }}
                />
              </div>
              <span>{stats.fourStars}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span>3 ⭐</span>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(stats.threeStars / stats.totalReviews) * 100}%`,
                  }}
                />
              </div>
              <span>{stats.threeStars}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span>2 ⭐</span>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(stats.twoStars / stats.totalReviews) * 100}%`,
                  }}
                />
              </div>
              <span>{stats.twoStars}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span>1 ⭐</span>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(stats.oneStar / stats.totalReviews) * 100}%`,
                  }}
                />
              </div>
              <span>{stats.oneStar}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div style={styles.reviewsSection}>
        <h2 style={styles.sectionTitle}>All Reviews</h2>
        {contracts.length === 0 ? (
          <p style={styles.emptyText}>
            No reviews yet. Complete projects to receive reviews from clients!
          </p>
        ) : (
          <div style={styles.reviewsList}>
            {contracts.map((contract) => (
              <div key={contract._id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>
                    <div style={styles.stars}>
                      {renderStars(contract.review!.rating)}
                    </div>
                    <div style={styles.clientName}>
                      {contract.businessId.businessProfile?.companyName ||
                        contract.businessId.email}
                    </div>
                  </div>
                  <div style={styles.reviewDate}>
                    {formatDate(contract.review!.createdAt)}
                  </div>
                </div>

                <div style={styles.projectInfo}>
                  <strong>Project:</strong> {contract.projectTitle}
                </div>

                <div style={styles.reviewComment}>
                  {contract.review!.comment}
                </div>

                <div style={styles.reviewFooter}>
                  <div style={styles.projectBudget}>
                    Budget: ${contract.budget}
                  </div>
                  <div style={styles.completedDate}>
                    Completed: {contract.completedAt && formatDate(contract.completedAt)}
                  </div>
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
  overallStatsCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "30px",
    display: "flex",
    gap: "60px",
    flexWrap: "wrap",
  },
  ratingSection: {
    textAlign: "center",
    flex: "0 0 200px",
  },
  overallRating: {
    fontSize: "72px",
    fontWeight: "bold",
    color: "#ff9800",
    marginBottom: "10px",
  },
  overallStars: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  totalReviews: {
    fontSize: "16px",
    color: "#666",
  },
  ratingBreakdown: {
    flex: 1,
    minWidth: "300px",
  },
  breakdownTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#333",
  },
  breakdownList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  breakdownRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "14px",
  },
  progressBar: {
    flex: 1,
    height: "8px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff9800",
    transition: "width 0.3s ease",
  },
  reviewsSection: {
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
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  reviewCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fafafa",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    paddingBottom: "15px",
    borderBottom: "1px solid #e0e0e0",
  },
  stars: {
    fontSize: "24px",
    marginBottom: "5px",
  },
  clientName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  reviewDate: {
    fontSize: "13px",
    color: "#999",
  },
  projectInfo: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
  },
  reviewComment: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#555",
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
    fontStyle: "italic",
  },
  reviewFooter: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#999",
    paddingTop: "15px",
    borderTop: "1px solid #e0e0e0",
  },
  projectBudget: {
    fontWeight: "bold",
  },
  completedDate: {},
};

export default ReviewsRatings;
