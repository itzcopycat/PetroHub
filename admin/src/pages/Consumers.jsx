import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function getStatusBadgeClass(status) {
  switch (status) {
    case "Active":
      return "badge text-bg-success";
    case "Pending":
      return "badge text-bg-warning";
    case "Suspended":
      return "badge text-bg-secondary";
    default:
      return "badge text-bg-secondary";
  }
}

function Consumers() {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchConsumers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/consumers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsumers(res.data.consumers || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load consumers from server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumers();
  }, []);

  const filteredConsumers = consumers.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.mobileNumber?.toLowerCase().includes(term) ||
      c.consumerId?.toLowerCase().includes(term)
    );
  });

  const summary = {
    total: consumers.length,
    active: consumers.filter((c) => c.status === "Active").length,
    pending: consumers.filter((c) => c.status === "Pending").length,
    suspended: consumers.filter((c) => c.status === "Suspended").length,
  };

  return (
    <>
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">
          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-people" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Consumers</h1>
                <p className="text-muted mb-0">
                  Review accounts, KYC status, and connection details.
                </p>
              </div>
            </div>
            <div className="heading-actions">
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={fetchConsumers}
              >
                <i className="bi bi-arrow-clockwise" aria-hidden="true" /> Refresh
              </button>
              <Link className="btn btn-primary btn-sm" to="/addconsumer">
                <i className="bi bi-person-plus" aria-hidden="true" /> Add Consumer
              </Link>
            </div>
          </div>

          <section className="row g-3 mt-1" aria-label="User summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-primary">
                <div className="metric-top">
                  <span className="metric-label">Total Consumers</span>
                  <span className="metric-icon">
                    <i className="bi bi-people" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.total}</div>
                <div className="metric-meta">
                  <span>all-time records</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-success">
                <div className="metric-top">
                  <span className="metric-label">Active</span>
                  <span className="metric-icon">
                    <i className="bi bi-check2-circle" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.active}</div>
                <div className="metric-meta">
                  <span>healthy accounts</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-warning">
                <div className="metric-top">
                  <span className="metric-label">Pending</span>
                  <span className="metric-icon">
                    <i className="bi bi-hourglass-split" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.pending}</div>
                <div className="metric-meta">
                  <span>need approval</span>
                </div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card metric-danger">
                <div className="metric-top">
                  <span className="metric-label">Suspended</span>
                  <span className="metric-icon">
                    <i className="bi bi-slash-circle" aria-hidden="true" />
                  </span>
                </div>
                <div className="metric-value">{summary.suspended}</div>
                <div className="metric-meta">
                  <span>flagged accounts</span>
                </div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true" />
                  <span>User List</span>
                </h2>
                <p className="text-muted mb-0">
                  Search, review, and manage consumer accounts.
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <input
                  className="form-control form-control-sm table-search"
                  type="search"
                  placeholder="Search by name, phone, consumer ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search consumers"
                />
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

            {loading ? (
              <div className="blank-panel">
                <div className="blank-state">
                  <p className="text-muted mb-0">Loading consumers…</p>
                </div>
              </div>
            ) : filteredConsumers.length === 0 ? (
              <div className="blank-panel">
                <div className="blank-state">
                  <p className="text-muted mb-0">No consumers found.</p>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table
                  className="table align-middle mb-0"
                  id="usersTable"
                  data-searchable-table=""
                >
                  <thead>
                    <tr>
                      <th scope="col">User</th>
                      <th scope="col">Consumer ID</th>
                      <th scope="col">Connection</th>
                      <th scope="col">Status</th>
                      <th scope="col">Joined</th>
                      <th scope="col" className="text-end">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsumers.map((consumer) => (
                      <tr key={consumer._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              className="avatar-img avatar-sm"
                              src={
                                consumer.avatarUrl
                                  ? `http://localhost:3000${consumer.avatarUrl}`
                                  : "/assets/images/avatar/avatar.jpg"
                              }
                              alt={consumer.name}
                            />
                            <div>
                              <p className="fw-semibold mb-0">{consumer.name}</p>
                              <p className="text-muted small mb-0">
                                {consumer.mobileNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>{consumer.consumerId}</td>
                        <td>
                          {consumer.connectionType} · {consumer.cylinderSize}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(consumer.status)}>
                            {consumer.status}
                          </span>
                        </td>
                        <td>
                          {consumer.joinedAt
                            ? new Date(consumer.joinedAt).toLocaleDateString(
                                "en-IN",
                                { day: "2-digit", month: "short", year: "numeric" }
                              )
                            : "—"}
                        </td>
                        <td className="text-end">
                          <Link
                            className="btn btn-light btn-sm"
                            to={`/users/${consumer._id}`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mt-3">
              <p className="text-muted small mb-0">
                Showing {filteredConsumers.length} of {consumers.length} consumers
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Consumers;