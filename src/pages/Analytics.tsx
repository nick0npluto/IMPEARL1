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

interface FreelancerAnalytics {
  totalEarnings: number;
  completedJobs: number;
  averageRating: string;
  activeProjects: number;
  pendingEarnings: number;
  successRate: string;
  earningsOverTime: Array<{ month: string; amount: number }>;
}

interface BusinessAnalytics {
  totalSpent: number;
  completedProjects: number;
  freelancersHired: number;
  activeProjects: number;
  pendingPayments: number;
  reviewsLeft: number;
  completionRate: string;
  spendingOverTime: Array<{ month: string; amount: number }>;
}

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<FreelancerAnalytics | BusinessAnalytics | null>(null);
  const [userType, setUserType] = useState<"freelancer" | "business" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data.analytics);
      setUserType(response.data.userType);
      setLoading(false);
    } catch (error) {
      console.error("Fetch analytics error:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>No analytics data available</div>
      </div>
    );
  }

  const renderFreelancerAnalytics = (data: FreelancerAnalytics) => (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${data.totalEarnings.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Earnings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.completedJobs}</div>
          <div style={styles.statLabel}>Completed Jobs</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.averageRating}⭐</div>
          <div style={styles.statLabel}>Average Rating</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.activeProjects}</div>
          <div style={styles.statLabel}>Active Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${data.pendingEarnings.toFixed(2)}</div>
          <div style={styles.statLabel}>Pending Earnings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.successRate}%</div>
          <div style={styles.statLabel}>Success Rate</div>
        </div>
      </div>

      {data.earningsOverTime.length > 0 && (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Earnings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.earningsOverTime}>
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

      <div style={styles.insights}>
        <h2 style={styles.insightsTitle}>Key Insights</h2>
        <ul style={styles.insightsList}>
          <li>
            You've completed <strong>{data.completedJobs}</strong> jobs with a success rate of{" "}
            <strong>{data.successRate}%</strong>
          </li>
          <li>
            Your average rating is <strong>{data.averageRating} stars</strong>
          </li>
          <li>
            You have <strong>${data.pendingEarnings.toFixed(2)}</strong> in pending earnings
          </li>
          <li>
            Currently working on <strong>{data.activeProjects}</strong> active{" "}
            {data.activeProjects === 1 ? "project" : "projects"}
          </li>
        </ul>
      </div>
    </>
  );

  const renderBusinessAnalytics = (data: BusinessAnalytics) => (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${data.totalSpent.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Spent</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.completedProjects}</div>
          <div style={styles.statLabel}>Completed Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.freelancersHired}</div>
          <div style={styles.statLabel}>Freelancers Hired</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.activeProjects}</div>
          <div style={styles.statLabel}>Active Projects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${data.pendingPayments.toFixed(2)}</div>
          <div style={styles.statLabel}>Pending Payments</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.reviewsLeft}</div>
          <div style={styles.statLabel}>Reviews Left</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.completionRate}%</div>
          <div style={styles.statLabel}>Completion Rate</div>
        </div>
      </div>

      {data.spendingOverTime.length > 0 && (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Spending Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.spendingOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2196f3"
                strokeWidth={2}
                name="Spending ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.insights}>
        <h2 style={styles.insightsTitle}>Key Insights</h2>
        <ul style={styles.insightsList}>
          <li>
            You've completed <strong>{data.completedProjects}</strong> projects with a completion
            rate of <strong>{data.completionRate}%</strong>
          </li>
          <li>
            You've hired <strong>{data.freelancersHired}</strong> unique{" "}
            {data.freelancersHired === 1 ? "freelancer" : "freelancers"}
          </li>
          <li>
            You have <strong>${data.pendingPayments.toFixed(2)}</strong> in pending payments
          </li>
          <li>
            Currently managing <strong>{data.activeProjects}</strong> active{" "}
            {data.activeProjects === 1 ? "project" : "projects"}
          </li>
          <li>
            You've left <strong>{data.reviewsLeft}</strong>{" "}
            {data.reviewsLeft === 1 ? "review" : "reviews"}
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {userType === "freelancer" ? "Freelancer Analytics" : "Business Analytics"}
        </h1>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {userType === "freelancer"
        ? renderFreelancerAnalytics(analytics as FreelancerAnalytics)
        : renderBusinessAnalytics(analytics as BusinessAnalytics)}
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
  insights: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  insightsTitle: {
    fontSize: "20px",
    marginBottom: "20px",
    color: "#333",
  },
  insightsList: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#555",
  },
};

export default Analytics;
