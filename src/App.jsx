/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  ArrowUpDown,
  Trash2,
  Edit,
  PlusCircle,
  X,
  Search,
  DollarSign,
  Calendar,
  Users,
  BarChart2,
  Briefcase,
  User,
  Banknote,
  BrainCircuit,
  FileText,
  Settings, // Icono añadido
  UploadCloud, // Icono añadido
} from "lucide-react";

// --- Configuración de Firebase ---
const userProvidedConfig = {
  apiKey: "AIzaSyA7TPxMemR7F9qpU3kzPLRcC3K9lMZoEXc",
  authDomain: "mi-gestor-de-operaciones.firebaseapp.com",
  projectId: "mi-gestor-de-operaciones",
  storageBucket: "mi-gestor-de-operaciones.appspot.com",
  messagingSenderId: "1003121856869",
  appId: "1:1003121856869:web:2fec288ef83c8af586518c",
  measurementId: "G-F361D6HLFT",
};

const firebaseConfig =
  typeof __firebase_config !== "undefined" && __firebase_config
    ? JSON.parse(__firebase_config)
    : userProvidedConfig;

const appId =
  typeof __app_id !== "undefined" ? __app_id : "default-registro-app-v6";

let app;
let auth;
let db;
let firebaseInitialized = false;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseInitialized = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    firebaseInitialized = false;
  }
}

// --- Estilos y Helpers ---
const styles = {
  appContainer: {
    backgroundColor: "#111827",
    color: "white",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    paddingBottom: "80px",
  },
  container: { maxWidth: "1280px", margin: "0 auto", padding: "1rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#7dd3fc",
  },
  headerTitle: { display: "flex", alignItems: "center", gap: "0.75rem" },
  headerH1: { fontSize: "1.875rem", fontWeight: "bold" },
  card: {
    backgroundColor: "#1f2937",
    padding: "1.25rem",
    borderRadius: "0.75rem",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    border: "1px solid #374151",
  },
  statCard: { display: "flex", alignItems: "center", gap: "1rem" },
  statIcon: {
    padding: "0.75rem",
    borderRadius: "9999px",
    backgroundColor: "#374151",
  },
  statTextContainer: { display: "flex", flexDirection: "column" },
  statTitle: { fontSize: "0.875rem", fontWeight: "500", color: "#9ca3af" },
  statValue: { fontSize: "1.5rem", fontWeight: "bold" },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    justifyContent: "center",
    padding: "0.75rem 1rem",
    fontWeight: "bold",
    color: "white",
    borderRadius: "0.5rem",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  buttonPrimary: { backgroundColor: "#0284c7" },
  buttonSecondary: { backgroundColor: "#4b5563" },
  buttonDanger: { backgroundColor: "#dc2626" },
  table: { width: "100%", textAlign: "left", fontSize: "0.875rem" },
  th: {
    padding: "0.75rem",
    textTransform: "uppercase",
    color: "#9ca3af",
    backgroundColor: "rgba(55, 65, 81, 0.5)",
  },
  td: { padding: "0.75rem", borderBottom: "1px solid #374151" },
  modalOverlay: {
    position: "fixed",
    inset: "0",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  modalContent: {
    backgroundColor: "#1f2937",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "640px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #374151",
  },
  modalHeader: {
    padding: "1rem",
    borderBottom: "1px solid #374151",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
  },
  modalBody: { flexGrow: 1, overflowY: "auto", padding: "1.5rem" },
  modalFooter: {
    padding: "1rem",
    borderTop: "1px solid #374151",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexShrink: 0,
  },
  formInput: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#374151",
    border: "1px solid #4b5563",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    color: "white",
    outline: "none",
  },
  formSelect: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#374151",
    border: "1px solid #4b5563",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    color: "white",
    outline: "none",
  },
  grid: { display: "grid", gap: "1rem" },
  gridCols1: { gridTemplateColumns: "repeat(1, minmax(0, 1fr))" },
  gridCols2: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  gridCols3: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  gridCols4: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
  textRight: { textAlign: "right" },
  fontMono: { fontFamily: "monospace" },
  textGreen: { color: "#4ade80" },
  textSky: { color: "#38bdf8" },
  textYellow: { color: "#facc15" },
  textIndigo: { color: "#818cf8" },
  icon: { width: "24px", height: "24px" },
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const Icon = ({ name, style }) => {
  const icons = {
    Banknote, DollarSign, ArrowUpDown, BarChart2, Briefcase, PlusCircle,
    FileText, BrainCircuit, Users, User, Edit, Trash2, X, Search, Settings, UploadCloud
  };
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon style={{ ...styles.icon, ...style }} />;
};

const formatCurrency = (value, currency = "USD") => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) return currency === "USD" ? "$0.00" : "Bs 0.00";
  const options = { style: "currency", minimumFractionDigits: 2, maximumFractionDigits: 2 };
  if (currency === "BRL") {
    options.currency = "BRL";
    return new Intl.NumberFormat("pt-BR", options).format(numericValue);
  }
  if (currency === "VES") {
    options.currency = "VES";
    return `Bs ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue)}`;
  }
  options.currency = "USD";
  return new Intl.NumberFormat("en-US", options).format(numericValue);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = date.toDate ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return "Fecha inválida";
  return d.toLocaleDateString("es-VE", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const getLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// --- CONSTANTES (AHORA USADAS COMO FALLBACK) ---
const SUCURSALES = ["Brasil", "Ecuador", "Peru"];
const ASIGNADOS_FALLBACK = {
  Brasil: ["Charly", "Moises", "Daniela", "Liden", "Josef", "Luzmarys", "Leonel", "Giralbis", "Antonio", "Carolina", "Vanessa", "Francis"],
  Ecuador: ["Nathaly"],
  Peru: ["Wilyam"],
};
const BANCOS = [
  "Venezuela", "Banesco", "Provincial", "Mercantil", "BNC", "Pago Movil (Banesco)",
  "Pago Movil (Provincial)", "Pago Movil (Venezuela)", "Pago Movil (Mercantil)", "Pago Movil (BNC)",
];
const MONEDAS = ["BRL", "USD", "PEN", "EUR", "VES"];
const PAGO_MOVIL_COMMISSION_RATE = 0.003;

// --- INICIO DE COMPONENTES DE UI ---

const Header = () => ( <header style={styles.header}> <div style={styles.headerTitle}> <Icon name="Banknote" /> <h1 style={styles.headerH1}>Gestor de Cambios</h1> </div> </header> );

const DashboardView = ({ stats, onAddNew }) => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#d1d5db" }}> Tu Resumen del Día </h2>
        {!isMobile && ( <button onClick={onAddNew} style={{ ...styles.button, ...styles.buttonPrimary }}> <Icon name="PlusCircle" /> <span>Nueva Operación</span> </button> )}
      </div>
      <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols3) }}>
        <StatCard icon={<Icon name="DollarSign" style={{ color: "#4ade80" }} />} title="Mi Ganancia Hoy" value={formatCurrency(stats.myTotalGanancia)} />
        <StatCard icon={<Icon name="ArrowUpDown" style={{ color: "#38bdf8" }} />} title="Total Transado (USD)" value={formatCurrency(stats.totalMovidoUSD)} />
        <StatCard icon={<Icon name="BarChart2" style={{ color: "#facc15" }} />} title="Operaciones" value={stats.count} />
      </div>
    </div>
  );
};

const ResultsTable = ({ operations, loading, onEdit, onDelete }) => {
  if (loading) return ( <div style={{ textAlign: "center", padding: "2.5rem" }}> <p>Cargando datos...</p> </div> );
  if (operations.length === 0) return ( <div style={{ textAlign: "center", padding: "2.5rem" }}> <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}> No hay operaciones registradas </h3> </div> );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Fecha</th>
            <th style={styles.th}>Asignado</th>
            <th style={{ ...styles.th, ...styles.textRight }}>Monto</th>
            <th style={{ ...styles.th, ...styles.textRight }}>Mi Ganancia</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op) => (
            <tr key={op.id} style={{ borderBottom: "1px solid #374151" }}>
              <td style={styles.td}>{formatDate(op.fecha)}</td>
              <td style={{ ...styles.td, fontWeight: "500" }}>{op.asignado}</td>
              <td style={{ ...styles.td, ...styles.fontMono, ...styles.textRight }}> {formatCurrency(op.monto, op.moneda)} </td>
              <td style={{ ...styles.td, ...styles.fontMono, ...styles.textRight, ...styles.textGreen, fontWeight: "600" }}> {formatCurrency(op.gananciaMia)} </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                {onEdit && onDelete && (
                  <>
                    <button onClick={() => onEdit(op)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "#38bdf8" }}> <Icon name="Edit" /> </button>
                    <button onClick={() => onDelete(op.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: "#f87171" }}> <Icon name="Trash2" /> </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const OperationsListView = ({ operations, onEdit, onDelete, loading, onAddNew, onBulkAdd }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const filteredOperations = useMemo(() => {
    if (!searchTerm) return operations;
    return operations.filter( (op) => (op.asignado?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (op.sucursal?.toLowerCase() || "").includes(searchTerm.toLowerCase()) );
  }, [operations, searchTerm]);
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexDirection: isMobile ? "column" : "row", gap: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb" }}> Historial de Operaciones </h2>
        <div style={{ display: "flex", gap: "1rem", width: isMobile ? "100%" : "auto" }}>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.formInput, flexGrow: 1 }} />
          {!isMobile && (
            <>
              <button onClick={onBulkAdd} style={{ ...styles.button, ...styles.buttonSecondary }}> <Icon name="UploadCloud" /> <span>Carga Masiva</span> </button>
              <button onClick={onAddNew} style={{ ...styles.button, ...styles.buttonPrimary }}> <Icon name="PlusCircle" /> <span>Añadir</span> </button>
            </>
          )}
        </div>
      </div>
      <ResultsTable operations={filteredOperations} loading={loading} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

const ReportsView = ({ allOperations, asignados }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  
  const [filters, setFilters] = useState({
    startDate: getLocalDateString(firstDayOfMonth),
    endDate: getLocalDateString(today),
    asignado: "Todos",
    selectedSucursales: SUCURSALES,
  });
  const [reportData, setReportData] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSucursalChange = (sucursal) => {
    setFilters(prev => {
        const selected = prev.selectedSucursales;
        const newSelected = selected.includes(sucursal)
            ? selected.filter(s => s !== sucursal)
            : [...selected, sucursal];
        return {...prev, selectedSucursales: newSelected};
    });
  };

  const handleGenerateReport = () => {
    const { startDate, endDate, asignado, selectedSucursales } = filters;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");
    const filteredOps = allOperations.filter((op) => {
      const opDate = op.fecha;
      const sucursalMatch = selectedSucursales.includes(op.sucursal);
      return (
        opDate >= start && opDate <= end &&
        (asignado === "Todos" || op.asignado === asignado) &&
        sucursalMatch
      );
    });
    const totals = filteredOps.reduce( (acc, op) => {
        acc.gananciaMia += Number(op.gananciaMia) || 0;
        acc.gananciaAsignado += Number(op.gananciaAsignado) || 0;
        acc.gananciaCharly += Number(op.gananciaCharly) || 0;
        acc.gananciaNetaUSD += Number(op.gananciaNetaUSD) || 0;
        return acc;
      }, { gananciaMia: 0, gananciaAsignado: 0, gananciaCharly: 0, gananciaNetaUSD: 0 }
    );
    setReportData({ ops: filteredOps, totals: totals });
  };
  
  const ALL_ASIGNADOS = useMemo(() => [...new Set(Object.values(asignados).flat())], [asignados]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={styles.card}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1rem" }}> Generador de Reportes </h2>
        <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols3), marginBottom: "1rem" }}>
          <FormInput label="Desde" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          <FormInput label="Hasta" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          <FormSelect label="Asignado" name="asignado" value={filters.asignado} onChange={handleFilterChange} options={["Todos", ...ALL_ASIGNADOS]} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Sucursales</label>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {SUCURSALES.map(s => (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={filters.selectedSucursales.includes(s)} onChange={() => handleSucursalChange(s)} style={{ accentColor: "#0284c7" }}/>
                        {s}
                    </label>
                ))}
            </div>
        </div>
        <button onClick={handleGenerateReport} style={{ ...styles.button, ...styles.buttonPrimary }}> Generar </button>
      </div>
      {reportData && (
        <div style={styles.card}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "1rem" }}> Resultados del Reporte </h3>
          <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols4), marginBottom: "1.5rem" }}>
            <StatCard icon={<Icon name="DollarSign" style={styles.textGreen} />} title="Mi Ganancia" value={formatCurrency(reportData.totals.gananciaMia)} />
            <StatCard icon={<Icon name="Users" style={styles.textYellow} />} title="Ganancia Asignado(s)" value={formatCurrency(reportData.totals.gananciaAsignado)} />
            <StatCard icon={<Icon name="User" style={styles.textIndigo} />} title="Ganancia Charly" value={formatCurrency(reportData.totals.gananciaCharly)} />
            <StatCard icon={<Icon name="BarChart2" style={styles.textSky} />} title="Ganancia Neta Total" value={formatCurrency(reportData.totals.gananciaNetaUSD)} />
          </div>
          <ResultsTable operations={reportData.ops} loading={false} />
        </div>
      )}
    </div>
  );
};

const AnalysisView = ({ onGetAnalysis, result, isLoading }) => ( <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}> <div style={styles.card}> <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1rem" }}> Análisis con IA </h2> <button onClick={onGetAnalysis} disabled={isLoading} style={{ ...styles.button, ...styles.buttonPrimary }}> {isLoading ? "Analizando..." : "✨ Analizar último mes"} </button> </div> {result && ( <div style={styles.card}> <pre style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif" }}> {result} </pre> </div> )} </div> );

const NavItem = ({ icon, label, isActive, onClick }) => ( <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", color: isActive ? "#38bdf8" : "#9ca3af", background: "none", border: "none", cursor: "pointer", }}> {icon} <span style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>{label}</span> </button> );

const BottomNav = ({ currentView, setView, onAddNew }) => {
  const { width } = useWindowSize();
  if (width >= 768) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#1f2937", borderTop: "1px solid #374151", zIndex: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "4rem", maxWidth: "600px", margin: "0 auto" }}>
        <NavItem icon={<Icon name="BarChart2" />} label="Dashboard" isActive={currentView === "dashboard"} onClick={() => setView("dashboard")} />
        <NavItem icon={<Icon name="Briefcase" />} label="Historial" isActive={currentView === "list"} onClick={() => setView("list")} />
        <div style={{ position: "relative" }}>
          <button onClick={onAddNew} style={{ ...styles.button, ...styles.buttonPrimary, borderRadius: "9999px", padding: "1rem", position: "absolute", top: "-2rem", left: "50%", transform: "translateX(-50%)" }}>
            <Icon name="PlusCircle" style={{ width: "28px", height: "28px" }} />
          </button>
        </div>
        <NavItem icon={<Icon name="FileText" />} label="Reportes" isActive={currentView === "reports"} onClick={() => setView("reports")} />
        <NavItem icon={<Icon name="BrainCircuit" />} label="Análisis" isActive={currentView === "analysis"} onClick={() => setView("analysis")} />
        <NavItem icon={<Icon name="Settings" />} label="Ajustes" isActive={currentView === "settings"} onClick={() => setView("settings")} />
      </div>
    </div>
  );
};

const FormInput = ({ label, name, ...props }) => ( <div> <label htmlFor={name} style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }} title={props.title}> {label} </label> <input id={name} name={name} {...props} style={styles.formInput} /> </div> );
const FormSelect = ({ label, name, options, ...props }) => ( <div> <label htmlFor={name} style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.25rem" }}> {label} </label> <select id={name} name={name} {...props} style={styles.formSelect}> {options.map((opt) => ( <option key={opt} value={opt}> {opt} </option> ))} </select> </div> );
const StatCard = ({ icon, title, value }) => ( <div style={{ ...styles.card, ...styles.statCard }}> <div style={styles.statIcon}>{icon}</div> <div style={styles.statTextContainer}> <h3 style={styles.statTitle}>{title}</h3> <p style={styles.statValue}>{value}</p> </div> </div> );
const CalcResult = ({ label, value, isPositive, style = {} }) => ( <div style={{ backgroundColor: "#374151", padding: "0.75rem", borderRadius: "0.5rem" }}> <p style={styles.statTitle}>{label}</p> <p style={{ fontWeight: "bold", fontSize: "1.125rem", color: isPositive === false ? "#f87171" : "white", ...style, }} > {value} </p> </div> );

const OperationModal = ({ isOpen, onClose, onSave, operation, asignados }) => {
  const [formData, setFormData] = useState({});
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    if (operation) {
      const opDate = operation.fecha?.toDate ? operation.fecha.toDate() : new Date(operation.fecha || today);
      const opY = opDate.getFullYear();
      const opM = String(opDate.getMonth() + 1).padStart(2, "0");
      const opD = String(opDate.getDate()).padStart(2, "0");
      setFormData({ ...operation, fecha: `${opY}-${opM}-${opD}` });
    } else {
      setFormData({ id: null, fecha: `${y}-${m}-${d}`, sucursal: "Brasil", asignado: "Charly", banco: "Banesco", moneda: "BRL", monto: "", tasaCompra: "", tasaVenta: "", tasaCambio: "" });
    }
  }, [operation]);

  const calculations = useMemo(() => {
    const monto = parseFloat(formData.monto) || 0;
    const tasaCompra = parseFloat(formData.tasaCompra) || 0;
    const tasaInterna = parseFloat(formData.tasaVenta) || 0;
    const tasaCliente = parseFloat(formData.tasaCambio) || 0;
    const moneda = formData.moneda;
    const montoEntregarBs = monto * tasaCliente;
    let montoRecibidoEnUSD = 0;
    if (tasaCompra > 0) { montoRecibidoEnUSD = monto / tasaCompra; }
    else if (moneda === "USD" || moneda === "VES") { montoRecibidoEnUSD = monto; }
    let costoEntregaEnUSD = 0;
    if (tasaInterna > 0) costoEntregaEnUSD = montoEntregarBs / tasaInterna;
    const comisionPagoMovilBs = formData.banco?.includes("Pago Movil") ? montoEntregarBs * PAGO_MOVIL_COMMISSION_RATE : 0;
    const comisionEnUSD = tasaInterna > 0 ? comisionPagoMovilBs / tasaInterna : 0;
    const gananciaNetaUSD = montoRecibidoEnUSD - costoEntregaEnUSD - comisionEnUSD;
    const montoEnUSD = montoRecibidoEnUSD;
    let gananciaMia = 0, gananciaAsignado = 0, gananciaCharly = 0;

    if (formData.sucursal === "Brasil" && formData.asignado !== "Charly") {
      gananciaCharly = gananciaNetaUSD * 0.15;
      const gananciaRestante = gananciaNetaUSD * 0.85;
      gananciaMia = gananciaRestante / 2;
      gananciaAsignado = gananciaRestante / 2;
    } else {
      gananciaMia = gananciaNetaUSD * 0.5;
      gananciaAsignado = gananciaNetaUSD * 0.5;
      gananciaCharly = 0;
    }
    return { montoEnUSD, montoEntregarBs, comisionPagoMovilBs, gananciaNetaUSD, gananciaMia, gananciaAsignado, gananciaCharly };
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "sucursal") {
        newState.asignado = asignados[value]?.[0] || "";
        if (value === "Ecuador") { newState.moneda = "USD"; }
        else if (value === "Peru") { newState.moneda = "PEN"; }
        else if (value === "Brasil") { newState.moneda = "BRL"; }
      }
      return newState;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, ...calculations, monto: parseFloat(formData.monto) || 0, tasaCompra: parseFloat(formData.tasaCompra) || 0, tasaCambio: parseFloat(formData.tasaCambio) || 0, tasaVenta: parseFloat(formData.tasaVenta) || 0, fecha: new Date(formData.fecha + "T00:00:00") };
    if (operation && operation.id) { dataToSubmit.id = operation.id; }
    onSave(dataToSubmit);
  };

  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <header style={styles.modalHeader}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}> {operation ? "Editar Operación" : "Nueva Operación"} </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}> <Icon name="X" /> </button>
        </header>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
          <div style={{ ...styles.modalBody, padding: 0 }}>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), marginBottom: "1rem" }}>
                <FormInput label="Fecha" type="date" name="fecha" value={formData.fecha || ""} onChange={handleChange} required />
                <FormSelect label="Banco" name="banco" value={formData.banco || ""} onChange={handleChange} options={BANCOS} />
              </div>
              <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), marginBottom: "1rem" }}>
                <FormSelect label="Sucursal" name="sucursal" value={formData.sucursal || ""} onChange={handleChange} options={SUCURSALES} />
                <FormSelect label="Asignado" name="asignado" value={formData.asignado || ""} onChange={handleChange} options={asignados[formData.sucursal] || []} />
              </div>
              <div style={{ backgroundColor: "rgba(55, 65, 81, 0.5)", padding: "1rem", borderRadius: "0.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "1rem" }}> Monto y Tasas </h3>
                <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), marginBottom: "1rem" }}>
                  <FormInput label="Monto Recibido" type="number" name="monto" value={formData.monto || ""} onChange={handleChange} required placeholder="100.00" step="0.01" />
                  <FormSelect label="Moneda" name="moneda" value={formData.moneda || ""} onChange={handleChange} options={MONEDAS} />
                </div>
                <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols3) }}>
                  <FormInput label="Tasa Cliente" type="number" name="tasaCambio" value={formData.tasaCambio || ""} onChange={handleChange} placeholder="22.52" step="0.0001" />
                  <FormInput label="Tasa Compra" type="number" name="tasaCompra" value={formData.tasaCompra || ""} onChange={handleChange} placeholder="5.61" step="0.0001" />
                  <FormInput label="Tasa Interna" type="number" name="tasaVenta" value={formData.tasaVenta || ""} onChange={handleChange} placeholder="133" step="0.0001" />
                </div>
              </div>
              <div style={{ backgroundColor: "rgba(17, 24, 39, 0.5)", padding: "1.5rem", marginTop: "1rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "0.75rem" }}> Resultados </h3>
                <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2) }}>
                  <CalcResult label="Bolívares a Recibir" value={formatCurrency(calculations.montoEntregarBs, "VES")} style={styles.textSky} />
                  <CalcResult label="Ganancia Neta ($)" value={formatCurrency(calculations.gananciaNetaUSD)} isPositive={calculations.gananciaNetaUSD >= 0} />
                  <CalcResult label="Mi Ganancia" value={formatCurrency(calculations.gananciaMia)} style={styles.textGreen} />
                  <CalcResult label="Ganancia Asignado" value={formatCurrency(calculations.gananciaAsignado)} />
                  {formData.sucursal === "Brasil" && formData.asignado !== "Charly" && ( <CalcResult label="Ganancia Charly" value={formatCurrency(calculations.gananciaCharly)} /> )}
                </div>
              </div>
            </div>
          </div>
          <footer style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={{ ...styles.button, ...styles.buttonSecondary }}> Cancelar </button>
            <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }}> {operation ? "Actualizar" : "Guardar"} </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if(!isOpen) return null;
    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <header style={styles.modalHeader}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{title}</h2>
                </header>
                <div style={styles.modalBody}>
                    <p>{message}</p>
                </div>
                <footer style={styles.modalFooter}>
                    <button onClick={onClose} style={{...styles.button, ...styles.buttonSecondary}}>Cancelar</button>
                    <button onClick={onConfirm} style={{...styles.button, ...styles.buttonDanger}}>Confirmar</button>
                </footer>
            </div>
        </div>
    );
};

const BulkAddModal = ({ isOpen, onClose, onSaveBulk }) => {
    const [bulkData, setBulkData] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSaveBulk(bulkData);
        setIsSaving(false);
        setBulkData("");
        onClose();
    };
    
    if(!isOpen) return null;
    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <header style={styles.modalHeader}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Carga Masiva de Operaciones</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}> <Icon name="X" /> </button>
                </header>
                <div style={styles.modalBody}>
                    <p style={{marginBottom: '1rem', color: '#9ca3af', fontSize: '0.875rem'}}>
                        Pega los datos desde tu hoja de cálculo (Excel, Sheets). Asegúrate de que las columnas estén en el siguiente orden: <br/>
                        <code style={{fontFamily: 'monospace', backgroundColor: '#374151', padding: '0.2rem 0.4rem', borderRadius: '0.25rem'}}>
                        Fecha(YYYY-MM-DD) Sucursal Asignado Banco Moneda Monto TasaCliente TasaCompra TasaInterna
                        </code>
                    </p>
                    <textarea
                        value={bulkData}
                        onChange={e => setBulkData(e.target.value)}
                        placeholder="2025-10-07	Brasil	Moises	Banesco	BRL	100	22.52	5.61	133"
                        style={{...styles.formInput, height: '200px', fontFamily: 'monospace'}}
                    />
                </div>
                <footer style={styles.modalFooter}>
                    <button onClick={onClose} style={{...styles.button, ...styles.buttonSecondary}}>Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} style={{...styles.button, ...styles.buttonPrimary}}>
                        {isSaving ? "Guardando..." : "Guardar Operaciones"}
                    </button>
                </footer>
            </div>
        </div>
    )
};

const SettingsView = ({ asignados, onSaveAsignados }) => {
    const [localAsignados, setLocalAsignados] = useState(asignados);
    const [newAsignado, setNewAsignado] = useState({ sucursal: "Brasil", nombre: "" });

    useEffect(() => {
        setLocalAsignados(asignados);
    }, [asignados]);
    
    const handleAdd = () => {
        const { sucursal, nombre } = newAsignado;
        if (!nombre.trim()) return;
        
        const updated = { ...localAsignados };
        if (!updated[sucursal]) {
            updated[sucursal] = [];
        }
        if (updated[sucursal].includes(nombre)) return; // Evitar duplicados

        updated[sucursal].push(nombre);
        onSaveAsignados(updated);
        setNewAsignado({ sucursal: "Brasil", nombre: "" });
    };

    const handleDelete = (sucursal, nombre) => {
        const updated = { ...localAsignados };
        updated[sucursal] = updated[sucursal].filter(a => a !== nombre);
        onSaveAsignados(updated);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={styles.card}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1rem" }}>
                    Gestionar Asignados
                </h2>
                <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr auto", gap: "1rem", marginBottom: "2rem" }}>
                     <FormSelect
                        label="Sucursal"
                        value={newAsignado.sucursal}
                        onChange={e => setNewAsignado(p => ({...p, sucursal: e.target.value}))}
                        options={SUCURSALES}
                     />
                     <FormInput
                        label="Nombre del Asignado"
                        value={newAsignado.nombre}
                        onChange={e => setNewAsignado(p => ({...p, nombre: e.target.value}))}
                        placeholder="Nuevo Nombre"
                     />
                     <button onClick={handleAdd} style={{...styles.button, ...styles.buttonPrimary, alignSelf: 'flex-end', height: '38px'}}>
                        Añadir
                    </button>
                </div>
                <div style={{ ...styles.grid, ...styles.gridCols3 }}>
                    {SUCURSALES.map(sucursal => (
                        <div key={sucursal}>
                            <h3 style={{color: "#7dd3fc", borderBottom: "1px solid #374151", paddingBottom: '0.5rem', marginBottom: '1rem'}}>{sucursal}</h3>
                            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                {(localAsignados[sucursal] || []).map(nombre => (
                                    <li key={nombre} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#374151', padding: '0.5rem', borderRadius: '0.375rem'}}>
                                        <span>{nombre}</span>
                                        <button onClick={() => handleDelete(sucursal, nombre)} style={{background: 'none', border: 'none', color: '#f87171', cursor: 'pointer'}}>
                                            <Icon name="Trash2" style={{width: '18px', height: '18px'}}/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DE LA APP ---
export default function App() {
  const [view, setView] = useState("dashboard");
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [asignados, setAsignados] = useState(ASIGNADOS_FALLBACK);
  const [confirmation, setConfirmation] = useState({ isOpen: false });

  useEffect(() => { document.body.style.margin = "0"; }, []);

  useEffect(() => {
    if (!firebaseInitialized) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) { setUserId(user.uid); }
      else {
        try {
          if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
            await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        } catch (error) { console.error("Anonymous sign-in failed", error); }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId) { setLoading(false); return; }
    
    // Cargar asignados
    const asignadosDocRef = doc(db, `/artifacts/${appId}/public/settings/asignados`);
    const unsubAsignados = onSnapshot(asignadosDocRef, (docSnap) => {
        if(docSnap.exists()){
            setAsignados(docSnap.data());
        } else {
            // Si no existe, lo creamos con el fallback
            setDoc(asignadosDocRef, ASIGNADOS_FALLBACK);
        }
    });

    // Cargar operaciones
    setLoading(true);
    const collectionPath = `/artifacts/${appId}/users/${userId}/operations`;
    const q = query(collection(db, collectionPath));
    const unsubOps = onSnapshot( q, (querySnapshot) => {
        const opsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), fecha: doc.data().fecha?.toDate ? doc.data().fecha.toDate() : new Date(doc.data().fecha || new Date()) }));
        opsData.sort((a, b) => b.fecha - a.fecha);
        setOperations(opsData);
        setLoading(false);
      }, (error) => { console.error("Error fetching operations:", error); setLoading(false); }
    );
    return () => {
        unsubAsignados();
        unsubOps();
    };
  }, [isAuthReady, userId]);

  const handleSaveOperation = async (operationData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) { console.error("Error de autenticación."); return; }
    const collectionPath = `/artifacts/${appId}/users/${currentUser.uid}/operations`;
    const { id, ...dataToSave } = operationData;
    try {
      if (id) { await updateDoc(doc(db, collectionPath, id), dataToSave); }
      else { await addDoc(collection(db, collectionPath), dataToSave); }
      setIsModalOpen(false);
      setEditingOperation(null);
    } catch (error) { console.error("Error al guardar operación:", error); }
  };

  const handleDeleteOperation = (idToDelete) => {
      setConfirmation({
          isOpen: true,
          title: "Confirmar Eliminación",
          message: "¿Estás seguro de que quieres eliminar esta operación? Esta acción no se puede deshacer.",
          onConfirm: async () => {
              const currentUser = auth.currentUser;
              if (!currentUser) { console.error("Error de autenticación."); return; }
              const collectionPath = `/artifacts/${appId}/users/${currentUser.uid}/operations`;
              try {
                await deleteDoc(doc(db, collectionPath, idToDelete));
              } catch (error) { console.error("Error al borrar operación:", error); }
              setConfirmation({ isOpen: false });
          }
      });
  };

  const handleSaveAsignados = async (newAsignados) => {
      const docRef = doc(db, `/artifacts/${appId}/public/settings/asignados`);
      try {
        await setDoc(docRef, newAsignados);
      } catch(error) {
        console.error("Error al guardar asignados:", error);
      }
  };
  
  const handleSaveBulkOperations = async (bulkText) => {
    const currentUser = auth.currentUser;
    if (!currentUser) { console.error("Error de autenticación."); return; }
    const collectionPath = `/artifacts/${appId}/users/${currentUser.uid}/operations`;
    
    const rows = bulkText.trim().split('\n');
    const promises = [];

    for(const row of rows) {
        const [fecha, sucursal, asignado, banco, moneda, montoStr, tasaCambioStr, tasaCompraStr, tasaVentaStr] = row.split('\t');
        
        try {
            const monto = parseFloat(montoStr) || 0;
            const tasaCompra = parseFloat(tasaCompraStr) || 0;
            const tasaVenta = parseFloat(tasaVentaStr) || 0;
            const tasaCambio = parseFloat(tasaCambioStr) || 0;

            const tempFormData = { monto, tasaCompra, tasaVenta, tasaCambio, moneda, banco, sucursal, asignado };
            const calculations = calculateOperation(tempFormData);
            
            const dataToSubmit = {
                fecha: new Date(fecha + "T00:00:00"),
                sucursal, asignado, banco, moneda,
                monto, tasaCambio, tasaCompra, tasaVenta,
                ...calculations
            };
            promises.push(addDoc(collection(db, collectionPath), dataToSubmit));

        } catch(e) {
            console.error("Error procesando fila:", row, e);
        }
    }
    await Promise.all(promises);
  };
  
  // Función helper para carga masiva
  const calculateOperation = (formData) => {
    const { monto, tasaCompra, tasaVenta, tasaCambio, moneda, banco } = formData;
    const montoEntregarBs = monto * tasaCambio;
    let montoRecibidoEnUSD = 0;
    if (tasaCompra > 0) { montoRecibidoEnUSD = monto / tasaCompra; } 
    else if (moneda === "USD" || moneda === "VES") { montoRecibidoEnUSD = monto; }

    let costoEntregaEnUSD = 0;
    if (tasaVenta > 0) costoEntregaEnUSD = montoEntregarBs / tasaVenta;
    const comisionPagoMovilBs = banco?.includes("Pago Movil") ? montoEntregarBs * PAGO_MOVIL_COMMISSION_RATE : 0;
    const comisionEnUSD = tasaVenta > 0 ? comisionPagoMovilBs / tasaVenta : 0;
    const gananciaNetaUSD = montoRecibidoEnUSD - costoEntregaEnUSD - comisionEnUSD;
    const montoEnUSD = montoRecibidoEnUSD;
    let gananciaMia = 0, gananciaAsignado = 0, gananciaCharly = 0;

    if (formData.sucursal === "Brasil" && formData.asignado !== "Charly") {
      gananciaCharly = gananciaNetaUSD * 0.15;
      const gananciaRestante = gananciaNetaUSD * 0.85;
      gananciaMia = gananciaRestante / 2;
      gananciaAsignado = gananciaRestante / 2;
    } else {
      gananciaMia = gananciaNetaUSD * 0.5;
      gananciaAsignado = gananciaNetaUSD * 0.5;
      gananciaCharly = 0;
    }
    return { montoEnUSD, montoEntregarBs, gananciaNetaUSD, gananciaMia, gananciaAsignado, gananciaCharly };
  };


  const openModalForEdit = (op) => { setEditingOperation(op); setIsModalOpen(true); };
  const openModalForNew = () => { setEditingOperation(null); setIsModalOpen(true); };
  const openBulkModal = () => setIsBulkModalOpen(true);

  const myDailyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOps = operations.filter( (op) => new Date(op.fecha).setHours(0, 0, 0, 0) === today.getTime() );
    return {
      myTotalGanancia: todayOps.reduce( (acc, op) => acc + (Number(op.gananciaMia) || 0), 0 ),
      totalMovidoUSD: todayOps.reduce( (acc, op) => acc + (Number(op.montoEnUSD) || 0), 0 ),
      count: todayOps.length,
    };
  }, [operations]);

  if (!firebaseInitialized) return ( <div style={{ ...styles.appContainer, display: "flex", justifyContent: "center", alignItems: "center" }}> <p>Error: No se pudo conectar con la base de datos.</p> </div> );

  return (
    <div style={styles.appContainer}>
      <div style={styles.container}>
        <Header />
        <main style={{ marginTop: "1.5rem" }}>
          {view === "dashboard" && <DashboardView stats={myDailyStats} onAddNew={openModalForNew} />}
          {view === "list" && <OperationsListView operations={operations} onEdit={openModalForEdit} onDelete={handleDeleteOperation} loading={loading} onAddNew={openModalForNew} onBulkAdd={openBulkModal} />}
          {view === "reports" && <ReportsView allOperations={operations} asignados={asignados} />}
          {view === "analysis" && <AnalysisView onGetAnalysis={() => {}} result={analysisResult} isLoading={isAnalysisLoading} />}
          {view === "settings" && <SettingsView asignados={asignados} onSaveAsignados={handleSaveAsignados} />}
        </main>
      </div>
      <BottomNav currentView={view} setView={setView} onAddNew={openModalForNew} />
      {isModalOpen && <OperationModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingOperation(null); }} onSave={handleSaveOperation} operation={editingOperation} asignados={asignados}/>}
      {isBulkModalOpen && <BulkAddModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onSaveBulk={handleSaveBulkOperations} />}
      <ConfirmationModal {...confirmation} onClose={() => setConfirmation({ isOpen: false })} />
    </div>
  );
}

