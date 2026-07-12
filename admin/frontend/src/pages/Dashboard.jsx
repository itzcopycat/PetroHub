function Dashboard() {
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
              Monitor performance, sales, users, and support from one clean
              workspace.
            </p>
          </div>
        </div>
        <div className="heading-actions">
          <button className="btn btn-outline-secondary btn-sm" type="button">
            <i className="bi bi-download" aria-hidden="true" /> Export
          </button>
          <button className="btn btn-primary btn-sm" type="button">
            <i className="bi bi-file-earmark-plus" aria-hidden="true" />{" "}
            Create Report
          </button>
        </div>
      </div>

      <section className="row g-3 mt-1" aria-label="Dashboard metrics">
        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-primary">
            <div className="metric-top">
              <span className="metric-label">Total Consumers</span>
              <span className="metric-icon">
                <i className="bi bi-people" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">1,234</div>
            <div className="metric-meta">
              <span className="text-success">+12.5%</span>
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
            <div className="metric-value">1,284</div>
            <div className="metric-meta">
              <span className="text-success">+8.2%</span>
              <span>new orders</span>
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
            <div className="metric-value">8,742</div>
            <div className="metric-meta">
              <span className="text-success">+5.1%</span>
              <span>active users</span>
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
            <div className="metric-value">36</div>
            <div className="metric-meta">
              <span className="text-danger">3 urgent</span>
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
                  Monthly bookings compared with operational targets.
                </p>
              </div>
              <a className="btn btn-light btn-sm" href="charts.html">
                View Details
              </a>
            </div>
            <div className="chart-bars" aria-label="Sales performance chart">
              <div className="chart-column bar-42">
                <span />
                <small>Jan</small>
              </div>
              <div className="chart-column bar-58">
                <span />
                <small>Feb</small>
              </div>
              <div className="chart-column bar-51">
                <span />
                <small>Mar</small>
              </div>
              <div className="chart-column bar-72">
                <span />
                <small>Apr</small>
              </div>
              <div className="chart-column bar-66">
                <span />
                <small>May</small>
              </div>
              <div className="chart-column bar-83">
                <span />
                <small>Jun</small>
              </div>
            </div>
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
                  <p className="text-muted small mb-0">
                    Marketing team published the May offer.
                  </p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot bg-success" />
                <div>
                  <p className="mb-1 fw-semibold">Payment batch cleared</p>
                  <p className="text-muted small mb-0">
                    246 invoices were processed successfully.
                  </p>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-dot bg-warning" />
                <div>
                  <p className="mb-1 fw-semibold">Support queue rising</p>
                  <p className="text-muted small mb-0">
                    Average first response time is 18 minutes.
                  </p>
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