import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("recent"); // "recent" = rolling last 6 months
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/dashboard/dashboard-stats", authHeader);
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/dashboard/recent-notifications", {
          ...authHeader,
          params: { limit: 5 },
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        setNotifications([]);
      } finally {
        setNotifLoading(false);
      }
    };

    const fetchYears = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/dashboard/available-years", authHeader);
        setAvailableYears(res.data.years || []);
      } catch (err) {
        // non-critical, silently ignore
      }
    };
    fetchStats();
    fetchYears();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchMonthly = async () => {
      setChartLoading(true);
      try {
        const params = selectedYear === "recent" ? { months: 6 } : { year: selectedYear };
        const res = await axios.get("http://localhost:3000/api/dashboard/monthly-bookings", {
          ...authHeader,
          params,
        });
        setMonthlyData(res.data.months || []);
      } catch (err) {
        setMonthlyData([]);
      } finally {
        setChartLoading(false);
      }
    };
    fetchMonthly();
  }, [selectedYear]);

  const maxBooking = Math.max(...monthlyData.map((m) => m.count), 1);

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const dotColorForType = (type) => {
    switch (type) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "danger":
        return "bg-danger";
      default:
        return "bg-primary";
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-speedometer2" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow mb-1">Overview</p>
            <h1 className="h3 mb-1">Dashboard</h1>
            <p className="text-muted mb-0">
              Monitor performance, sales, users, and support from one clean workspace.
            </p>
          </div>
        </div>
        <div className="heading-actions">
          <button className="btn btn-outline-secondary btn-sm" type="button">
            <i className="bi bi-download" aria-hidden="true" /> Export
          </button>
          <button className="btn btn-primary btn-sm" type="button">
            <i className="bi bi-file-earmark-plus" aria-hidden="true" /> Create Report
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}

      <section className="row g-3 mt-1" aria-label="Dashboard metrics">
        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-primary">
            <div className="metric-top">
              <span className="metric-label">Total Consumers</span>
              <span className="metric-icon">
                <i className="bi bi-people" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">{loading ? "—" : stats.totalConsumers.toLocaleString("en-IN")}</div>
            <div className="metric-meta">
              {!loading && (
                <span className={stats.consumerGrowthPercent >= 0 ? "text-success" : "text-danger"}>
                  {stats.consumerGrowthPercent >= 0 ? "+" : ""}
                  {stats.consumerGrowthPercent}%
                </span>
              )}
              <span>from last month</span>
            </div>
          </article>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-success">
            <div className="metric-top">
              <span className="metric-label">Today's Revenue</span>
              <span className="metric-icon">
                <i className="bi bi-currency-rupee" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">{loading ? "—" : `₹${stats.todaysRevenue.toLocaleString("en-IN")}`}</div>
            <div className="metric-meta">
              <span>{loading ? "—" : stats.todaysOrders} new orders</span>
            </div>
          </article>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-warning">
            <div className="metric-top">
              <span className="metric-label">Delivered Cylinders</span>
              <span className="metric-icon">
                <i className="bi bi-bag-check" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">{loading ? "—" : stats.deliveredCylinders.toLocaleString("en-IN")}</div>
            <div className="metric-meta">
              <span>all-time</span>
            </div>
          </article>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-danger">
            <div className="metric-top">
              <span className="metric-label">Pending Delivery</span>
              <span className="metric-icon">
                <i className="bi bi-hourglass-top" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">{loading ? "—" : stats.pendingDelivery}</div>
            <div className="metric-meta">
              <span>need review</span>
            </div>
          </article>
        </div>
      </section>

      <section className="row g-3 mt-1">
        <div className="col-12 col-xl-8">
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                  <span>Monthly Booking Report</span>
                </h2>
                <p className="text-muted mb-0">
                  Number of cylinder bookings placed per month
                  {selectedYear === "recent" ? " (last 6 months)" : ` in ${selectedYear}`}.
                </p>
              </div>
              <select
                className="form-select form-select-sm w-auto"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="recent">Last 6 Months</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: "100%", height: "clamp(220px, 35vw, 320px)" }}>
              {chartLoading ? (
                <p className="text-muted mb-0">Loading chart…</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData.map((m) => ({
                      ...m,
                      displayLabel: selectedYear === "recent" ? `${m.label} '${String(m.year).slice(2)}` : m.label,
                    }))}
                    margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      dataKey="displayLabel"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(59,130,246,0.08)" }}
                      formatter={(value) => [`${value} bookings`, ""]}
                      labelStyle={{ fontWeight: 600 }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <p className="text-muted small mt-2 mb-0">
              <i className="bi bi-info-circle" aria-hidden="true" /> Each bar represents total bookings created that month, not revenue.
            </p>
          </div>
        </div>

        <div className="col-12 col-xl-4">
  <div className="panel h-100">
    <div className="panel-header">
      <div>
        <h2 className="h5 mb-1 section-title">
          <i className="bi bi-activity" aria-hidden="true" />
          <span>Team Activity</span>
        </h2>
        <p className="text-muted mb-0">Recent notifications.</p>
      </div>
    </div>
    <div className="activity-list">
      {notifLoading ? (
        <p className="text-muted mb-0">Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <p className="text-muted mb-0">No recent notifications.</p>
      ) : (
        notifications.map((n) => (
          <div className="activity-item" key={n.id}>
            <span className={`activity-dot ${dotColorForType(n.type)}`} />
            <div>
              <p className="mb-1 fw-semibold">{n.title}</p>
              <p className="text-muted small mb-0">{n.message}</p>
              <p className="text-muted small mb-0">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</div>
      </section>
    </div>
  );
}

export default Dashboard;