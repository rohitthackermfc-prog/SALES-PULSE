
import { useState, useEffect, useRef } from "react";

// ── Indian currency formatter ──
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => "₹" + Number(n).toLocaleString("en-IN");

// GST slabs used in India
const GST_SLABS = [0, 5, 12, 18, 28];

const STAFF = [
  { id: 1, name: "Arjun Sharma", zone: "Mumbai North", avatar: "AS", phone: "+91 98765-43210" },
];

const PRODUCT_CATALOGUE = [
  { id: "P001", name: "Premium Coffee Blend", category: "Beverages", mrp: 850, unit: "per kg", sku: "BEV-001", gst: 18 },
  { id: "P002", name: "Green Tea Sachets", category: "Beverages", mrp: 220, unit: "per box/50", sku: "BEV-002", gst: 5 },
  { id: "P003", name: "Mineral Water 1L", category: "Beverages", mrp: 20, unit: "per bottle", sku: "BEV-003", gst: 18 },
  { id: "P004", name: "Energy Drink 250ml", category: "Beverages", mrp: 110, unit: "per can", sku: "BEV-004", gst: 28 },
  { id: "P005", name: "Whole Wheat Biscuits", category: "Snacks", mrp: 60, unit: "per pack", sku: "SNK-001", gst: 12 },
  { id: "P006", name: "Potato Chips 150g", category: "Snacks", mrp: 40, unit: "per bag", sku: "SNK-002", gst: 12 },
  { id: "P007", name: "Cashew Nuts 500g", category: "Snacks", mrp: 550, unit: "per pack", sku: "SNK-003", gst: 5 },
  { id: "P008", name: "Basmati Rice 5kg", category: "Staples", mrp: 480, unit: "per bag", sku: "STP-001", gst: 5 },
  { id: "P009", name: "Cooking Oil 1L", category: "Staples", mrp: 180, unit: "per bottle", sku: "STP-002", gst: 5 },
  { id: "P010", name: "Sugar 1kg", category: "Staples", mrp: 48, unit: "per pack", sku: "STP-003", gst: 5 },
  { id: "P011", name: "Ceramic Mugs", category: "Homeware", mrp: 350, unit: "per piece", sku: "HW-001", gst: 12 },
  { id: "P012", name: "Glass Bottles 500ml", category: "Homeware", mrp: 120, unit: "per piece", sku: "HW-002", gst: 18 },
  { id: "P013", name: "Hand Soap 300ml", category: "Personal Care", mrp: 95, unit: "per bottle", sku: "PC-001", gst: 18 },
  { id: "P014", name: "Shampoo 200ml", category: "Personal Care", mrp: 175, unit: "per bottle", sku: "PC-002", gst: 18 },
  { id: "P015", name: "Toothpaste 100g", category: "Personal Care", mrp: 85, unit: "per tube", sku: "PC-003", gst: 18 },
];

const CATEGORIES = ["All", ...Array.from(new Set(PRODUCT_CATALOGUE.map(p => p.category)))];

// GST is INCLUSIVE in MRP (as per Indian law)
// Base price (taxable value) = MRP / (1 + gst/100)
const basePrice = (mrp, gst) => mrp / (1 + gst / 100);
const gstAmount = (mrp, gst) => mrp - basePrice(mrp, gst);

const INITIAL_DATA = {
  orders: [
    { id: "ORD-001", client: "Metro Kirana", amount: 42000, status: "delivered", date: "2026-05-20", staffId: 1, items: [] },
    { id: "ORD-002", client: "City Mart", amount: 18500, status: "pending", date: "2026-05-21", staffId: 1, items: [] },
    { id: "ORD-003", client: "QuickShop", amount: 31000, status: "processing", date: "2026-05-22", staffId: 1, items: [] },
    { id: "ORD-004", client: "Westside Foods", amount: 9200, status: "delivered", date: "2026-05-19", staffId: 1, items: [] },
    { id: "ORD-005", client: "Harbor General", amount: 56000, status: "delivered", date: "2026-05-18", staffId: 1, items: [] },
  ],
  cashCollections: [
    { id: "CASH-001", client: "Metro Kirana", amount: 38000, date: "2026-05-20", staffId: 1, verified: true },
    { id: "CASH-002", client: "Harbor General", amount: 56000, date: "2026-05-21", staffId: 1, verified: true },
    { id: "CASH-003", client: "QuickShop", amount: 12000, date: "2026-05-22", staffId: 1, verified: false },
  ],
  chequeCollections: [
    { id: "CHQ-001", client: "City Mart", amount: 45000, date: "2026-05-19", dueDate: "2026-06-01", staffId: 1, status: "pending" },
    { id: "CHQ-002", client: "Westside Foods", amount: 22000, date: "2026-05-20", dueDate: "2026-05-30", staffId: 1, status: "cleared" },
  ],
  damages: [
    { id: "DMG-001", client: "QuickShop", product: "Glass Bottles x12", value: 1440, date: "2026-05-21", staffId: 1, resolved: false },
    { id: "DMG-002", client: "Metro Kirana", product: "Ceramic Mugs x6", value: 2100, date: "2026-05-20", staffId: 1, resolved: true },
  ],
  returns: [
    { id: "RET-001", client: "City Mart", product: "Premium Coffee x24", value: 4800, date: "2026-05-22", staffId: 1, reason: "Wrong item" },
  ],
  gpsLogs: [
    { time: "08:15", location: "Depot", lat: 19.076, lng: 72.877, activity: "Start" },
    { time: "09:30", location: "Metro Kirana", lat: 19.082, lng: 72.885, activity: "Delivery" },
    { time: "11:00", location: "City Mart", lat: 19.090, lng: 72.868, activity: "Collection" },
    { time: "13:20", location: "QuickShop", lat: 19.070, lng: 72.880, activity: "Delivery" },
    { time: "15:45", location: "Harbor General", lat: 19.095, lng: 72.860, activity: "Delivery" },
    { time: "17:00", location: "Depot", lat: 19.076, lng: 72.877, activity: "End" },
  ],
  targets: { monthly: 800000, collected: 524000, ordersTarget: 60, ordersCount: 48 },
};

const TABS = ["Dashboard", "Orders", "Cash & Cheques", "Damages & Returns", "GPS Tracker", "AI Insights"];
const statusColor = (s) => ({ delivered: "#22c55e", pending: "#f59e0b", processing: "#3b82f6", cleared: "#22c55e" }[s] || "#94a3b8");
const inp = { width: "100%", background: "#1e2a4a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none" };

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [data, setData] = useState(INITIAL_DATA);
  const [aiChat, setAiChat] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [orderMode, setOrderMode] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [orderClient, setOrderClient] = useState("");
  const [orderGstin, setOrderGstin] = useState("");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [orderItems, setOrderItems] = useState([]);
  const [catFilter, setCatFilter] = useState("All");
  const [productSearch, setProductSearch] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => { if (tab === "AI Insights" && aiChat.length === 0) runAutoInsight(); }, [tab]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiChat]);

  const totalOrders = data.orders.reduce((s, o) => s + o.amount, 0);
  const totalCash = data.cashCollections.reduce((s, c) => s + c.amount, 0);
  const totalCheques = data.chequeCollections.reduce((s, c) => s + c.amount, 0);
  const totalDamages = data.damages.reduce((s, d) => s + d.value, 0);
  const totalReturns = data.returns.reduce((s, r) => s + r.value, 0);
  const collectionRate = Math.round(((totalCash + totalCheques) / totalOrders) * 100);
  const pct = Math.round((data.targets.collected / data.targets.monthly) * 100);

  // ── Order builder calculations ──
  const orderTaxable = orderItems.reduce((s, i) => s + basePrice(i.price, i.gst) * i.qty, 0);
  const orderGstTotal = orderItems.reduce((s, i) => s + gstAmount(i.price, i.gst) * i.qty, 0);
  const orderTotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const orderMrpTotal = orderItems.reduce((s, i) => s + i.mrp * i.qty, 0);
  const totalDiscount = orderMrpTotal - orderTotal;

  // GST breakdown by slab
  const gstBreakdown = GST_SLABS.filter(s => s > 0).map(slab => {
    const slabItems = orderItems.filter(i => i.gst === slab);
    const taxable = slabItems.reduce((s, i) => s + basePrice(i.price, i.gst) * i.qty, 0);
    const gst = slabItems.reduce((s, i) => s + gstAmount(i.price, i.gst) * i.qty, 0);
    return { slab, taxable, cgst: gst / 2, sgst: gst / 2, total: gst };
  }).filter(g => g.total > 0);

  const addItemToOrder = (product) => {
    setOrderItems(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, sku: product.sku, mrp: product.mrp, price: product.mrp, qty: 1, unit: product.unit, gst: product.gst }];
    });
  };

  const updateItem = (productId, field, value) => {
    setOrderItems(prev => prev.map(i => i.productId === productId ? { ...i, [field]: parseFloat(value) || 0 } : i));
  };

  const removeItem = (productId) => setOrderItems(prev => prev.filter(i => i.productId !== productId));

  const saveOrder = () => {
    if (!orderClient.trim() || orderItems.length === 0) return;
    const order = {
      id: `ORD-${String(data.orders.length + 1).padStart(3, "0")}`,
      client: orderClient, gstin: orderGstin,
      amount: Math.round(orderTotal), status: orderStatus,
      date: new Date().toISOString().slice(0, 10), staffId: 1,
      items: orderItems, taxable: orderTaxable, gstTotal: orderGstTotal,
    };
    setData(prev => ({ ...prev, orders: [order, ...prev.orders] }));
    setOrderMode(null); setOrderClient(""); setOrderGstin(""); setOrderItems([]); setOrderStatus("pending");
  };

  const filteredProducts = PRODUCT_CATALOGUE.filter(p =>
    (catFilter === "All" || p.category === catFilter) &&
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const buildContext = () => `
Sales Staff: ${STAFF[0].name}, Zone: ${STAFF[0].zone} (India)
Orders: ${data.orders.length} orders, total ${fmtInt(totalOrders)}
Cash: ${fmtInt(totalCash)} (${data.cashCollections.filter(c => !c.verified).length} unverified)
Cheques: ${fmtInt(totalCheques)} (${data.chequeCollections.filter(c => c.status === "pending").length} pending)
Collection Rate: ${collectionRate}%
Monthly Target: ${fmtInt(data.targets.monthly)}, Collected: ${fmtInt(data.targets.collected)} (${pct}%)
Damages: ${data.damages.length} (${data.damages.filter(d => !d.resolved).length} unresolved, ${fmtInt(totalDamages)})
Returns: ${data.returns.length}, ${fmtInt(totalReturns)}
  `;

  const runAutoInsight = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are an AI sales manager for an Indian FMCG/distribution business. Analyze data, give concise bullet-point insights in Indian business context. Flag anomalies, highlight wins, suggest improvements. Mention amounts in Indian Rupees. Under 200 words.",
          messages: [{ role: "user", content: `Analyze:\n${buildContext()}` }],
        }),
      });
      const d = await res.json();
      setAiChat([{ role: "assistant", content: d.content?.map(b => b.text || "").join("") || "No insights.", auto: true }]);
    } catch { setAiChat([{ role: "assistant", content: "⚠️ AI unavailable.", auto: true }]); }
    setAiLoading(false);
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim(); setAiInput("");
    const history = [...aiChat, { role: "user", content: msg }];
    setAiChat(history); setAiLoading(true);
    try {
      const msgs = history.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
      if (msgs[0]?.role === "assistant") msgs.unshift({ role: "user", content: buildContext() });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `AI sales manager for Indian distribution business. Context: ${buildContext()}`, messages: msgs }),
      });
      const d = await res.json();
      setAiChat(prev => [...prev, { role: "assistant", content: d.content?.map(b => b.text || "").join("") || "No response." }]);
    } catch { setAiChat(prev => [...prev, { role: "assistant", content: "⚠️ Error." }]); }
    setAiLoading(false);
  };

  const card = { background: "#0d1322", border: "1px solid #1e2a4a", borderRadius: 12, padding: "14px", marginBottom: 10 };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0f1e", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", borderBottom: "1px solid #1e2a4a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>SalesCommand</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>AI-Powered Field Sales Manager · India</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{STAFF[0].name}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "0 16px", background: "#0d1322", borderBottom: "1px solid #1e2a4a", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setOrderMode(null); }} style={{
            background: "none", border: "none", color: tab === t ? "#818cf8" : "#64748b",
            padding: "12px 14px", fontSize: 12, fontWeight: tab === t ? 700 : 500, cursor: "pointer",
            borderBottom: tab === t ? "2px solid #818cf8" : "2px solid transparent", whiteSpace: "nowrap",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto" }}>

        {/* ── DASHBOARD ── */}
        {tab === "Dashboard" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Monthly Target Progress</div>
              <div style={{ background: "#1e2a4a", borderRadius: 8, height: 10, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: pct >= 80 ? "linear-gradient(90deg,#22c55e,#4ade80)" : pct >= 50 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                <span>{fmtInt(data.targets.collected)} collected</span>
                <span style={{ color: pct >= 80 ? "#22c55e" : "#f59e0b", fontWeight: 700 }}>{pct}% of {fmtInt(data.targets.monthly)}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Orders", value: fmtInt(totalOrders), sub: `${data.orders.length} orders`, icon: "🛒", color: "#6366f1" },
                { label: "Cash Collected", value: fmtInt(totalCash), sub: `${data.cashCollections.length} transactions`, icon: "💵", color: "#22c55e" },
                { label: "Cheques", value: fmtInt(totalCheques), sub: `${data.chequeCollections.filter(c => c.status === "pending").length} pending`, icon: "🏦", color: "#3b82f6" },
                { label: "Collection Rate", value: `${collectionRate}%`, sub: "vs orders value", icon: "📈", color: collectionRate >= 80 ? "#22c55e" : "#f59e0b" },
              ].map(m => (
                <div key={m.label} style={{ background: "#0d1322", border: "1px solid #1e2a4a", borderRadius: 12, padding: "16px 14px" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ ...card, marginBottom: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>⚠️ Alerts</div>
                {data.cashCollections.filter(c => !c.verified).length > 0 && <div style={{ fontSize: 12, color: "#f59e0b", marginBottom: 6 }}>• {data.cashCollections.filter(c => !c.verified).length} unverified cash</div>}
                {data.damages.filter(d => !d.resolved).length > 0 && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 6 }}>• {data.damages.filter(d => !d.resolved).length} open damages</div>}
                {data.chequeCollections.filter(c => c.status === "pending").length > 0 && <div style={{ fontSize: 12, color: "#3b82f6", marginBottom: 6 }}>• {data.chequeCollections.filter(c => c.status === "pending").length} cheques pending</div>}
                {data.returns.length > 0 && <div style={{ fontSize: 12, color: "#a78bfa" }}>• {data.returns.length} returns ({fmtInt(totalReturns)})</div>}
              </div>
              <div style={{ ...card, marginBottom: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>📍 Today's Route</div>
                {data.gpsLogs.slice(0, 4).map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: "#6366f1", minWidth: 36 }}>{g.time}</div>
                    <div style={{ fontSize: 12 }}>{g.location}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS LIST ── */}
        {tab === "Orders" && orderMode === null && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Orders</div>
              <button onClick={() => setOrderMode("new")} style={{ background: "#6366f1", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ New Order</button>
            </div>
            {data.orders.map(o => (
              <div key={o.id} onClick={() => { setViewOrder(o); setOrderMode("view"); }} style={{ ...card, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{o.client}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{o.id} · {o.date}</div>
                    {o.items?.length > 0 && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{o.items.length} item{o.items.length !== 1 ? "s" : ""}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtInt(o.amount)}</div>
                    <div style={{ fontSize: 11, marginTop: 3, color: statusColor(o.status), fontWeight: 600 }}>{o.status.toUpperCase()}</div>
                    {o.gstTotal > 0 && <div style={{ fontSize: 10, color: "#64748b" }}>GST: {fmt(o.gstTotal)}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VIEW ORDER ── */}
        {tab === "Orders" && orderMode === "view" && viewOrder && (
          <div>
            <button onClick={() => setOrderMode(null)} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, cursor: "pointer", marginBottom: 14, padding: 0 }}>← Back to Orders</button>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{viewOrder.client}</div>
                  {viewOrder.gstin && <div style={{ fontSize: 11, color: "#64748b" }}>GSTIN: {viewOrder.gstin}</div>}
                  <div style={{ fontSize: 12, color: "#64748b" }}>{viewOrder.id} · {viewOrder.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#6366f1" }}>{fmtInt(viewOrder.amount)}</div>
                  <div style={{ fontSize: 11, color: statusColor(viewOrder.status), fontWeight: 600 }}>{viewOrder.status.toUpperCase()}</div>
                </div>
              </div>

              {viewOrder.items?.length > 0 ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Items</div>
                  {viewOrder.items.map((item, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #1e2a4a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{item.sku} · {item.unit} · GST {item.gst}%</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>MRP {fmt(item.mrp)} × {item.qty}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{fmt(item.price * item.qty)}</div>
                          <div style={{ fontSize: 10, color: "#64748b" }}>
                            Taxable: {fmt(basePrice(item.price, item.gst) * item.qty)}
                          </div>
                          <div style={{ fontSize: 10, color: "#818cf8" }}>
                            GST: {fmt(gstAmount(item.price, item.gst) * item.qty)}
                          </div>
                          {item.price < item.mrp && <div style={{ fontSize: 10, color: "#22c55e" }}>Disc: {fmt((item.mrp - item.price) * item.qty)}</div>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Tax Summary */}
                  {viewOrder.gstTotal > 0 && (
                    <div style={{ background: "#0a0f1e", borderRadius: 10, padding: 12, marginTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>GST Summary</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 10, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
                        <span>Slab</span><span style={{ textAlign: "right" }}>Taxable</span><span style={{ textAlign: "right" }}>CGST</span><span style={{ textAlign: "right" }}>SGST</span><span style={{ textAlign: "right" }}>Total</span>
                      </div>
                      {viewOrder.items && GST_SLABS.filter(s => s > 0).map(slab => {
                        const slabItems = viewOrder.items.filter(i => i.gst === slab);
                        if (!slabItems.length) return null;
                        const taxable = slabItems.reduce((s, i) => s + basePrice(i.price, i.gst) * i.qty, 0);
                        const gstAmt = slabItems.reduce((s, i) => s + gstAmount(i.price, i.gst) * i.qty, 0);
                        return (
                          <div key={slab} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: "#818cf8" }}>{slab}%</span>
                            <span style={{ textAlign: "right" }}>{fmt(taxable)}</span>
                            <span style={{ textAlign: "right", color: "#6366f1" }}>{fmt(gstAmt / 2)}</span>
                            <span style={{ textAlign: "right", color: "#6366f1" }}>{fmt(gstAmt / 2)}</span>
                            <span style={{ textAlign: "right", fontWeight: 600 }}>{fmt(gstAmt)}</span>
                          </div>
                        );
                      })}
                      <div style={{ borderTop: "1px solid #1e2a4a", paddingTop: 8, marginTop: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                          <span>Taxable Value</span><span>{fmt(viewOrder.taxable || 0)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#818cf8", marginBottom: 4 }}>
                          <span>Total GST (CGST + SGST)</span><span>{fmt(viewOrder.gstTotal || 0)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                          <span>Grand Total</span><span style={{ color: "#6366f1" }}>{fmtInt(viewOrder.amount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 10 }}>No itemized details available.</div>
              )}
            </div>
          </div>
        )}

        {/* ── NEW ORDER BUILDER ── */}
        {tab === "Orders" && orderMode === "new" && (
          <div>
            <button onClick={() => setOrderMode(null)} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, cursor: "pointer", marginBottom: 14, padding: 0 }}>← Cancel</button>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>New Order</div>

            <div style={card}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>Order Details</div>
              <input placeholder="Party / Shop name" value={orderClient} onChange={e => setOrderClient(e.target.value)} style={{ ...inp, marginBottom: 8 }} />
              <input placeholder="GSTIN (optional)" value={orderGstin} onChange={e => setOrderGstin(e.target.value.toUpperCase())} maxLength={15}
                style={{ ...inp, marginBottom: 8, fontFamily: "monospace", letterSpacing: 1 }} />
              <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} style={{ ...inp }}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Product Catalogue */}
            <div style={card}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>📦 Product Catalogue</div>
              <input placeholder="Search product or SKU..." value={productSearch} onChange={e => setProductSearch(e.target.value)} style={{ ...inp, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{
                    background: catFilter === c ? "#6366f1" : "#1e2a4a", color: catFilter === c ? "white" : "#94a3b8",
                    border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  }}>{c}</button>
                ))}
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {filteredProducts.map(p => {
                  const inOrder = orderItems.find(i => i.productId === p.id);
                  return (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a2340" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{p.sku} · {p.unit}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 2, alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700 }}>MRP {fmt(p.mrp)}</span>
                          <span style={{ fontSize: 10, background: "#1e2a4a", color: "#818cf8", borderRadius: 4, padding: "1px 6px" }}>GST {p.gst}%</span>
                        </div>
                      </div>
                      <button onClick={() => addItemToOrder(p)} style={{
                        background: inOrder ? "#1e3a1e" : "#1e2a4a", color: inOrder ? "#22c55e" : "#94a3b8",
                        border: `1px solid ${inOrder ? "#22c55e" : "#334155"}`, borderRadius: 8,
                        padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", minWidth: 60,
                      }}>{inOrder ? `✓ ${inOrder.qty}` : "+ Add"}</button>
                    </div>
                  );
                })}
                {filteredProducts.length === 0 && <div style={{ fontSize: 13, color: "#475569", textAlign: "center", padding: 20 }}>No products found</div>}
              </div>
            </div>

            {/* Cart */}
            {orderItems.length > 0 && (
              <div style={card}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>🛒 Order Items ({orderItems.length})</div>
                {orderItems.map(item => (
                  <div key={item.productId} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #1a2340" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{item.sku} · MRP {fmt(item.mrp)} · GST {item.gst}%</div>
                      </div>
                      <button onClick={() => removeItem(item.productId)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 16, cursor: "pointer", padding: "0 4px" }}>✕</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Qty</div>
                        <input type="number" min="1" value={item.qty} onChange={e => updateItem(item.productId, "qty", e.target.value)}
                          style={{ ...inp, padding: "6px 10px" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Sale Price (₹)</div>
                        <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(item.productId, "price", e.target.value)}
                          style={{ ...inp, padding: "6px 10px", borderColor: item.price < item.mrp ? "#22c55e" : "#334155" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Line Total</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1", padding: "6px 0" }}>{fmt(item.price * item.qty)}</div>
                        {item.price < item.mrp && <div style={{ fontSize: 10, color: "#22c55e" }}>-{fmt((item.mrp - item.price) * item.qty)}</div>}
                      </div>
                    </div>
                    {/* Per-item tax breakdown */}
                    <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "#64748b" }}>
                      <span>Taxable: {fmt(basePrice(item.price, item.gst) * item.qty)}</span>
                      <span style={{ color: "#818cf8" }}>CGST ({item.gst / 2}%): {fmt(gstAmount(item.price, item.gst) / 2 * item.qty)}</span>
                      <span style={{ color: "#818cf8" }}>SGST ({item.gst / 2}%): {fmt(gstAmount(item.price, item.gst) / 2 * item.qty)}</span>
                    </div>
                  </div>
                ))}

                {/* GST Slab Summary */}
                {gstBreakdown.length > 0 && (
                  <div style={{ background: "#0a0f1e", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>GST Summary (MRP inclusive)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 9, color: "#64748b", marginBottom: 4, fontWeight: 700 }}>
                      <span>Slab</span><span style={{ textAlign: "right" }}>Taxable</span><span style={{ textAlign: "right" }}>CGST</span><span style={{ textAlign: "right" }}>SGST</span><span style={{ textAlign: "right" }}>Total</span>
                    </div>
                    {gstBreakdown.map(g => (
                      <div key={g.slab} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4, fontSize: 10, marginBottom: 3 }}>
                        <span style={{ color: "#818cf8", fontWeight: 600 }}>{g.slab}%</span>
                        <span style={{ textAlign: "right" }}>{fmt(g.taxable)}</span>
                        <span style={{ textAlign: "right", color: "#6366f1" }}>{fmt(g.cgst)}</span>
                        <span style={{ textAlign: "right", color: "#6366f1" }}>{fmt(g.sgst)}</span>
                        <span style={{ textAlign: "right", fontWeight: 600 }}>{fmt(g.total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Total Box */}
                <div style={{ background: "#0a0f1e", borderRadius: 10, padding: 12 }}>
                  {totalDiscount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#22c55e", marginBottom: 6 }}>
                      <span>Discount (off MRP)</span><span>-{fmt(totalDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                    <span>Taxable Value</span><span>{fmt(orderTaxable)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#818cf8", marginBottom: 6 }}>
                    <span>Total GST</span><span>{fmt(orderGstTotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6366f1", marginBottom: 8, paddingLeft: 10 }}>
                    <span>CGST + SGST</span><span>{fmt(orderGstTotal / 2)} + {fmt(orderGstTotal / 2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "#e2e8f0", borderTop: "1px solid #1e2a4a", paddingTop: 8 }}>
                    <span>Grand Total</span><span style={{ color: "#6366f1" }}>{fmtInt(orderTotal)}</span>
                  </div>
                </div>

                <button onClick={saveOrder} disabled={!orderClient.trim()}
                  style={{ width: "100%", background: !orderClient.trim() ? "#1e2a4a" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: !orderClient.trim() ? "#64748b" : "white", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: !orderClient.trim() ? "not-allowed" : "pointer", marginTop: 14 }}>
                  Confirm Order · {fmtInt(orderTotal)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CASH & CHEQUES ── */}
        {tab === "Cash & Cheques" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Collections</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>💵 Cash Collections</div>
            {data.cashCollections.map(c => (
              <div key={c.id} style={{ ...card, border: `1px solid ${c.verified ? "#1e2a4a" : "#7f1d1d"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.client}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{c.id} · {c.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtInt(c.amount)}</div>
                    <div style={{ fontSize: 11, marginTop: 3, color: c.verified ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{c.verified ? "✓ VERIFIED" : "⚠ UNVERIFIED"}</div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: "20px 0 10px" }}>🏦 Cheque Collections</div>
            {data.chequeCollections.map(c => (
              <div key={c.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.client}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{c.id} · Due: {c.dueDate}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtInt(c.amount)}</div>
                    <div style={{ fontSize: 11, marginTop: 3, color: statusColor(c.status), fontWeight: 600 }}>{c.status.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DAMAGES & RETURNS ── */}
        {tab === "Damages & Returns" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Damages & Returns</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>🔴 Damage Reports</div>
            {data.damages.map(d => (
              <div key={d.id} style={{ ...card, border: `1px solid ${d.resolved ? "#1e2a4a" : "#7f1d1d"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.client}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{d.product}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{d.id} · {d.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#ef4444" }}>-{fmtInt(d.value)}</div>
                    <div style={{ fontSize: 11, marginTop: 3, color: d.resolved ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{d.resolved ? "✓ RESOLVED" : "⚠ OPEN"}</div>
                    {!d.resolved && (
                      <button onClick={() => setData(p => ({ ...p, damages: p.damages.map(x => x.id === d.id ? { ...x, resolved: true } : x) }))}
                        style={{ marginTop: 6, background: "#1e2a4a", color: "#94a3b8", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Resolve</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", margin: "20px 0 10px" }}>↩️ Returns</div>
            {data.returns.map(r => (
              <div key={r.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.client}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{r.product}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{r.id} · {r.reason}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f59e0b" }}>-{fmtInt(r.value)}</div>
                    <div style={{ fontSize: 11, marginTop: 3, color: "#f59e0b" }}>PENDING</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GPS TRACKER ── */}
        {tab === "GPS Tracker" && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>GPS Activity Log</div>
            <div style={card}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Today · {STAFF[0].name} · {STAFF[0].zone}</div>
              <div style={{ position: "relative", paddingLeft: 24 }}>
                {data.gpsLogs.map((g, i) => (
                  <div key={i} style={{ position: "relative", paddingBottom: i < data.gpsLogs.length - 1 ? 20 : 0 }}>
                    {i < data.gpsLogs.length - 1 && <div style={{ position: "absolute", left: -17, top: 10, width: 2, height: "100%", background: "#1e2a4a" }} />}
                    <div style={{ position: "absolute", left: -22, top: 4, width: 10, height: 10, borderRadius: "50%", background: i === 0 || i === data.gpsLogs.length - 1 ? "#6366f1" : "#3b82f6", border: "2px solid #0d1322" }} />
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ fontSize: 11, color: "#6366f1", minWidth: 40, fontWeight: 600 }}>{g.time}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{g.location}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{g.activity} · {g.lat.toFixed(3)}, {g.lng.toFixed(3)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["Stops", data.gpsLogs.length, "#6366f1"], ["On Route", "8h 45m", "#22c55e"], ["Distance", "47 km", "#f59e0b"]].map(([l, v, c]) => (
                <div key={l} style={{ background: "#0d1322", border: "1px solid #1e2a4a", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI INSIGHTS ── */}
        {tab === "AI Insights" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>AI Sales Analyst</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Ask about performance, GST, forecasts, or route optimization</div>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
              {aiChat.length === 0 && !aiLoading && <div style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 40 }}>Generating insights...</div>}
              {aiLoading && aiChat.length === 0 && <div style={{ textAlign: "center", color: "#6366f1", fontSize: 13, marginTop: 40 }}>🤖 Analysing data...</div>}
              {aiChat.map((m, i) => (
                <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.auto && <div style={{ fontSize: 11, color: "#6366f1", marginBottom: 4, fontWeight: 600 }}>🤖 Auto Analysis</div>}
                  <div style={{ background: m.role === "user" ? "#3730a3" : "#0f172a", border: m.role === "user" ? "1px solid #4338ca" : "1px solid #1e2a4a", borderRadius: 12, padding: "12px 14px", maxWidth: "92%", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              ))}
              {aiLoading && aiChat.length > 0 && <div style={{ color: "#6366f1", fontSize: 13 }}>🤖 Thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAiMessage()}
                placeholder="Ask about GST, targets, anomalies..." style={{ flex: 1, background: "#0d1322", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
              <button onClick={sendAiMessage} disabled={aiLoading} style={{ background: "#6366f1", color: "white", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer", opacity: aiLoading ? 0.6 : 1 }}>↑</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {["Any anomalies?", "Monthly forecast", "GST liability today", "Unverified cash risk"].map(q => (
                <button key={q} onClick={() => setAiInput(q)} style={{ background: "#0d1322", border: "1px solid #334155", color: "#94a3b8", borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer" }}>{q}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
