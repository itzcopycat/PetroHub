import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TABS = [
  { key: "bookings", label: "Bookings", icon: "bi-clipboard-data" },
  { key: "consumers", label: "Consumers", icon: "bi-people" },
  { key: "inventory", label: "Cylinder Inventory", icon: "bi-box-seam" },
  { key: "revenue", label: "Revenue", icon: "bi-graph-up-arrow" },
];

// TODO: replace with your actual registered business details before going live.
// These are placeholders so the invoice layout can be reviewed now.
const TAX_INVOICE_SELLER = {
  name: "PetroHub Gas Distributors Pvt. Ltd.",
  addressLine1: "123 Business Park Road, Industrial Area",
  addressLine2: "[City], [State] - 000000",
  gstin: "22AAAAA0000A1Z5",
  pan: "AAAAA0000A",
};

function Reports() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [activeTab, setActiveTab] = useState("bookings");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [revenue, setRevenue] = useState([]);

  const [loading, setLoading] = useState({
    overview: true,
    bookings: true,
    consumers: true,
    inventory: true,
    revenue: true,
  });
  const [error, setError] = useState("");
  const [invoiceError, setInvoiceError] = useState("");

  const dateParams = () => {
    const params = {};
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    return params;
  };

  const fetchAll = useCallback(async () => {
    setError("");
    setLoading({
      overview: true,
      bookings: true,
      consumers: true,
      inventory: true,
      revenue: true,
    });

    try {
      const [overviewRes, bookingsRes, consumersRes, inventoryRes, revenueRes] =
        await Promise.allSettled([
          axios.get("http://localhost:3000/api/reports/overview", authHeader),
          axios.get("http://localhost:3000/api/reports/bookings", {
            ...authHeader,
            params: dateParams(),
          }),
          axios.get("http://localhost:3000/api/reports/consumers", {
            ...authHeader,
            params: dateParams(),
          }),
          axios.get("http://localhost:3000/api/reports/inventory", authHeader),
          axios.get("http://localhost:3000/api/reports/revenue", {
            ...authHeader,
            params: dateParams(),
          }),
        ]);

      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data);
      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.data.bookings || []);
      if (consumersRes.status === "fulfilled") setConsumers(consumersRes.value.data.consumers || []);
      if (inventoryRes.status === "fulfilled") setInventory(inventoryRes.value.data.inventory || []);
      if (revenueRes.status === "fulfilled") setRevenue(revenueRes.value.data.revenue || []);

      if ([overviewRes, bookingsRes, consumersRes, inventoryRes, revenueRes].some((r) => r.status === "rejected")) {
        setError("Some report data could not be loaded.");
      }
    } catch (err) {
      setError("Could not load reports.");
    } finally {
      setLoading({
        overview: false,
        bookings: false,
        consumers: false,
        inventory: false,
        revenue: false,
      });
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  // On-screen only — browsers render ₹ fine.
  const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  // PDF only — jsPDF's default fonts (Helvetica) don't include the ₹ glyph,
  // so it renders as a broken/garbled character. Column headers carry the
  // "(₹)" label instead; cell values stay plain formatted numbers.
  const pdfAmount = (n) => Number(n || 0).toLocaleString("en-IN");

  const rangeLabel = dateFrom || dateTo ? `${dateFrom || "start"} to ${dateTo || "today"}` : "all time";

  // ---- PDF section builders ----
  const sectionTableConfig = {
    bookings: {
      title: "Booking Report",
      head: [["Booking ID", "Consumer", "Cylinder Type", "Qty", "Status", "Amount (Rs.)", "Date"]],
      rows: () =>
        bookings.map((b) => [
          b.id,
          b.consumerName,
          b.cylinderType,
          b.quantity,
          b.status,
          pdfAmount(b.amount),
          b.date ? new Date(b.date).toLocaleDateString("en-IN") : "-",
        ]),
    },
    consumers: {
      title: "Consumer Report",
      head: [["Consumer ID", "Name", "Phone", "Total Orders", "Total Spent (Rs.)", "Joined"]],
      rows: () =>
        consumers.map((c) => [
          c.id,
          c.name,
          c.phone,
          c.totalOrders,
          pdfAmount(c.totalSpent),
          c.joinedDate ? new Date(c.joinedDate).toLocaleDateString("en-IN") : "-",
        ]),
    },
    inventory: {
      title: "Cylinder Inventory Report",
      head: [["Cylinder Type", "In Stock", "Reserved", "Sold (all-time)", "Reorder Level"]],
      rows: () =>
        inventory.map((i) => [i.type, i.inStock, i.reserved, i.sold, i.reorderLevel]),
    },
    revenue: {
      title: "Revenue Report",
      head: [["Month", "Bookings", "Revenue (Rs.)"]],
      rows: () => revenue.map((r) => [r.label || r.month, r.bookingsCount ?? "-", pdfAmount(r.amount)]),
    },
  };

  const addSectionToDoc = (doc, key, startY) => {
    const config = sectionTableConfig[key];
    doc.setFontSize(13);
    doc.text(config.title, 14, startY);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Range: ${rangeLabel}`, 14, startY + 5);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: startY + 9,
      head: config.head,
      body: config.rows(),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [13, 110, 253] },
      margin: { left: 14, right: 14 },
    });

    return doc.lastAutoTable.finalY + 12;
  };

  const downloadSectionPDF = (key) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("PetroHub", 14, 16);
    addSectionToDoc(doc, key, 26);
    doc.save(`${key}-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadFullReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("PetroHub — Full Report", 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 22);
    doc.setTextColor(0);

    let y = 32;
    TABS.forEach((tab, idx) => {
      if (idx > 0) {
        doc.addPage();
        y = 20;
      }
      y = addSectionToDoc(doc, tab.key, y);
    });

    doc.save(`petrohub-full-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ---- Bulk tax invoice for the selected date range ----
  const downloadTaxInvoice = () => {
    setInvoiceError("");

    // Only bookings that actually have a price breakdown can appear on a tax invoice.
    const invoiceBookings = bookings.filter((b) => b.priceBreakup);
    if (invoiceBookings.length === 0) {
      setInvoiceError("No billable bookings with pricing data found for this date range.");
      return;
    }

    const doc = new jsPDF();
    const invoiceNumber = `INV-${(dateFrom || "ALL").replace(/-/g, "")}-${(dateTo || "TODATE").replace(
      /-/g,
      ""
    )}-${Date.now().toString().slice(-5)}`;

    // Header — seller details
    doc.setFontSize(15);
    doc.setFont(undefined, "bold");
    doc.text(TAX_INVOICE_SELLER.name, 14, 16);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(TAX_INVOICE_SELLER.addressLine1, 14, 22);
    doc.text(TAX_INVOICE_SELLER.addressLine2, 14, 27);
    doc.text(`GSTIN: ${TAX_INVOICE_SELLER.gstin}   PAN: ${TAX_INVOICE_SELLER.pan}`, 14, 32);
    doc.setTextColor(0);

    // Header — invoice metadata
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("TAX INVOICE", 196, 16, { align: "right" });
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.text(`Invoice No: ${invoiceNumber}`, 196, 22, { align: "right" });
    doc.text(`Invoice Date: ${new Date().toLocaleDateString("en-IN")}`, 196, 27, { align: "right" });
    doc.text(`Billing Period: ${rangeLabel}`, 196, 32, { align: "right" });

    doc.setDrawColor(200);
    doc.line(14, 37, 196, 37);

    // Line items
    let taxableSum = 0;
    let taxSum = 0;
    let grandSum = 0;

    const rows = invoiceBookings.map((b, idx) => {
      const pb = b.priceBreakup || {};
      const taxable = (pb.cylinderPrice || 0) + (pb.deliveryFee || 0) + (pb.platformFee || 0);
      const taxAmount = pb.taxAmount || 0;
      const total = pb.total || b.amount || 0;

      taxableSum += taxable;
      taxSum += taxAmount;
      grandSum += total;

      return [
        idx + 1,
        b.id,
        b.consumerName,
        `${b.cylinderType} x ${b.quantity}`,
        pdfAmount(taxable),
        `${pb.taxRatePercent || 0}%`,
        pdfAmount(taxAmount),
        pdfAmount(total),
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [["#", "Booking ID", "Consumer", "Item", "Taxable Value (Rs.)", "Tax %", "Tax Amt (Rs.)", "Total (Rs.)"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [13, 110, 253] },
      margin: { left: 14, right: 14 },
    });

    // Summary totals
    let y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.text(`Taxable Amount (Rs.): ${pdfAmount(taxableSum)}`, 196, y, { align: "right" });
    y += 5;
    doc.text(`Total Tax (Rs.): ${pdfAmount(taxSum)}`, 196, y, { align: "right" });
    y += 6;
    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text(`Grand Total (Rs.): ${pdfAmount(grandSum)}`, 196, y, { align: "right" });
    doc.setFont(undefined, "normal");

    y += 12;
    doc.setFontSize(7);
    doc.setTextColor(130);
    doc.text("This is a system-generated tax invoice and does not require a signature.", 14, y);

    doc.save(`tax-invoice-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const isCurrentTabLoading = loading[activeTab];

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-file-earmark-bar-graph" aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow mb-1">Insights</p>
            <h1 className="h3 mb-1">Reports</h1>
            <p className="text-muted mb-0">
              Booking, consumer, inventory, and revenue reports — exportable as PDF.
            </p>
          </div>
        </div>
        <div className="heading-actions d-flex gap-2">
          <button
            className="btn btn-outline-dark btn-sm"
            type="button"
            onClick={downloadTaxInvoice}
            disabled={loading.bookings}
          >
            <i className="bi bi-receipt" aria-hidden="true" /> Download tax invoice
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={downloadFullReport}>
            <i className="bi bi-file-earmark-arrow-down" aria-hidden="true" /> Download full report
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mt-3">{error}</div>}
      {invoiceError && <div className="alert alert-warning py-2 mt-3">{invoiceError}</div>}

      {/* Overview stat cards */}
      <section className="row g-3 mt-1" aria-label="Report overview">
        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-primary">
            <div className="metric-top">
              <span className="metric-label">Total Bookings</span>
              <span className="metric-icon">
                <i className="bi bi-clipboard-data" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">
              {loading.overview ? "—" : overview?.totalBookings?.toLocaleString("en-IN")}
            </div>
            <div className="metric-meta">
              <span>{rangeLabel}</span>
            </div>
          </article>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-success">
            <div className="metric-top">
              <span className="metric-label">Total Consumers</span>
              <span className="metric-icon">
                <i className="bi bi-people" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">
              {loading.overview ? "—" : overview?.totalConsumers?.toLocaleString("en-IN")}
            </div>
            <div className="metric-meta">
              <span>all-time</span>
            </div>
          </article>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-warning">
            <div className="metric-top">
              <span className="metric-label">Cylinders In Stock</span>
              <span className="metric-icon">
                <i className="bi bi-box-seam" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">
              {loading.overview ? "—" : overview?.totalCylindersInStock?.toLocaleString("en-IN") ?? "—"}
            </div>
            <div className="metric-meta">
              <span>current</span>
            </div>
          </article>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <article className="metric-card metric-danger">
            <div className="metric-top">
              <span className="metric-label">Total Revenue</span>
              <span className="metric-icon">
                <i className="bi bi-currency-rupee" aria-hidden="true" />
              </span>
            </div>
            <div className="metric-value">
              {loading.overview ? "—" : currency(overview?.totalRevenue)}
            </div>
            <div className="metric-meta">
              <span>{rangeLabel}</span>
            </div>
          </article>
        </div>
      </section>

      {/* Filters + tabs */}
      <div className="panel mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
          <ul className="nav nav-tabs border-0 flex-grow-1 gap-1">
            {TABS.map((tab) => (
              <li className="nav-item" key={tab.key}>
                <button
                  type="button"
                  className={`nav-link ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon} me-1`} aria-hidden="true" />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="d-flex flex-wrap align-items-end gap-2">
            <div>
              <label className="form-label small text-muted mb-1">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <p className="text-muted small mb-0">
            Showing <strong>{TABS.find((t) => t.key === activeTab)?.label}</strong> — {rangeLabel}
          </p>
          <button
            className="btn btn-outline-primary btn-sm"
            type="button"
            onClick={() => downloadSectionPDF(activeTab)}
            disabled={isCurrentTabLoading}
          >
            <i className="bi bi-download" aria-hidden="true" /> Download this report
          </button>
        </div>

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="table-responsive">
            {loading.bookings ? (
              <p className="text-muted mb-0 py-3">Loading bookings…</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted mb-0 py-3">No bookings found for this range.</p>
            ) : (
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Consumer</th>
                    <th>Cylinder Type</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Amount(₹)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.consumerName}</td>
                      <td>{b.cylinderType}</td>
                      <td>{b.quantity}</td>
                      <td>
                        <span className="badge text-bg-light border">{b.status}</span>
                      </td>
                      <td>{(b.amount)}</td>
                      <td>{b.date ? new Date(b.date).toLocaleDateString("en-IN") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Consumers tab */}
        {activeTab === "consumers" && (
          <div className="table-responsive">
            {loading.consumers ? (
              <p className="text-muted mb-0 py-3">Loading consumers…</p>
            ) : consumers.length === 0 ? (
              <p className="text-muted mb-0 py-3">No consumers found for this range.</p>
            ) : (
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Consumer ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {consumers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.name}</td>
                      <td>{c.phone}</td>
                      <td>{c.totalOrders}</td>
                      <td>{currency(c.totalSpent)}</td>
                      <td>{c.joinedDate ? new Date(c.joinedDate).toLocaleDateString("en-IN") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Inventory tab */}
        {activeTab === "inventory" && (
          <div className="table-responsive">
            {loading.inventory ? (
              <p className="text-muted mb-0 py-3">Loading inventory…</p>
            ) : inventory.length === 0 ? (
              <p className="text-muted mb-0 py-3">No inventory data available.</p>
            ) : (
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Cylinder Type</th>
                    <th>In Stock</th>
                    <th>Reserved</th>
                    <th>Sold (all-time)</th>
                    <th>Reorder Level</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((i) => (
                    <tr key={i.type}>
                      <td>{i.type}</td>
                      <td>{i.inStock}</td>
                      <td>{i.reserved}</td>
                      <td>{i.sold}</td>
                      <td>
                        {i.inStock <= i.reorderLevel ? (
                          <span className="badge text-bg-danger-subtle text-danger">
                            {i.reorderLevel} (reorder now)
                          </span>
                        ) : (
                          i.reorderLevel
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Revenue tab */}
        {activeTab === "revenue" && (
          <div className="table-responsive">
            {loading.revenue ? (
              <p className="text-muted mb-0 py-3">Loading revenue…</p>
            ) : revenue.length === 0 ? (
              <p className="text-muted mb-0 py-3">No revenue data found for this range.</p>
            ) : (
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((r, idx) => (
                    <tr key={`${r.label || r.month}-${idx}`}>
                      <td>{r.label || r.month}</td>
                      <td>{r.bookingsCount ?? "-"}</td>
                      <td>{currency(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;