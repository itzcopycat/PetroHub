import { useEffect, useState } from "react";
import axios from "axios";

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
    <div
      className="chart-bars"
      aria-label="Number of bookings per month"
      style={{ gridTemplateColumns: `repeat(${monthlyData.length || 6}, minmax(38px, 1fr))` }}
    >
      {chartLoading ? (
        <p className="text-muted mb-0">Loading chart…</p>
      ) : (
        monthlyData.map((m, i) => (
          <div className="chart-column" key={`${m.year}-${m.month}-${i}`}>
            <div className="chart-bar-wrap">
              <span className="chart-bar-value">{m.count}</span>
              <span
                className="chart-bar"
                style={{ height: `${(m.count / maxBooking) * 100}%` }}
              />
            </div>
            <small>
              {m.label}
              {selectedYear === "recent" ? ` '${String(m.year).slice(2)}` : ""}
            </small>
          </div>
        ))
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
                <p className="text-muted mb-0">Recent operational updates.</p>
              </div>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-dot bg-primary" />
                <div>
                  <p className="mb-1 fw-semibold">New campaign launched</p>
                  <p className="text-muted small mb-0">Marketing team published the May offer.</p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot bg-success" />
                <div>
                  <p className="mb-1 fw-semibold">Payment batch cleared</p>
                  <p className="text-muted small mb-0">246 invoices were processed successfully.</p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot bg-warning" />
                <div>
                  <p className="mb-1 fw-semibold">Support queue rising</p>
                  <p className="text-muted small mb-0">Average first response time is 18 minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;