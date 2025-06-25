/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
// Removed duplicate firebaseConfig declaration to avoid redeclaration error.
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
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
  Sparkles,
  BrainCircuit,
  FileText,
  XCircle,
} from "lucide-react";
const userPastedConfig = {
  apiKey: "AIzaSyA7TPxMemR7F9qpU3kzPLRcC3K9lMZoEXc",
  authDomain: "mi-gestor-de-operaciones.firebaseapp.com",
  projectId: "mi-gestor-de-operaciones",
  storageBucket: "mi-gestor-de-operaciones.firebasestorage.app",
  messagingSenderId: "1003121856869",
  appId: "1:1003121856869:web:2fec288ef83c8af586518c",
  measurementId: "G-F361D6HLFT"
};

// --- Custom Hook for window size ---
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

// --- Estilos en JS (Reemplazo de Tailwind CSS) ---
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
  modalBody: { flexGrow: 1, overflowY: "auto" },
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

const Icon = ({ name, style }) => {
  const icons = {
    Banknote,
    DollarSign,
    ArrowUpDown,
    BarChart2,
    Briefcase,
    PlusCircle,
    FileText,
    BrainCircuit,
    Users,
    User,
    Edit,
    Trash2,
    X,
    Search,
  };
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon style={{ ...styles.icon, ...style }} />;
};

// --- Firebase Initialization ---
const firebaseConfig =
  typeof __firebase_config !== "undefined" && __firebase_config
    ? JSON.parse(__firebase_config)
    : {};
const appId =
  typeof __app_id !== "undefined" ? __app_id : "default-registro-app-v6";
  

let app;
let auth;
let db;
let firebaseInitialized = false;
let isDevelopmentMode = false;

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
} else {
  isDevelopmentMode = true;
}

// --- Helper Functions & Constants ---
const formatCurrency = (value, currency = "USD") => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) return currency === "USD" ? "$0.00" : "Bs 0.00";
  const options = {
    style: "currency",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  if (currency === "BRL") {
    options.currency = "BRL";
    return new Intl.NumberFormat("pt-BR", options).format(numericValue);
  }
  if (currency === "VES") {
    options.currency = "VES";
    return `Bs ${new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue)}`;
  }
  options.currency = "USD";
  return new Intl.NumberFormat("en-US", options).format(numericValue);
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = date.toDate ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return "Fecha inválida";
  return d.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getLocalDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const SUCURSALES = ["Brasil", "Ecuador", "Peru"];
const ASIGNADOS = {
  Brasil: [
    "Charly",
    "Moises",
    "Daniela",
    "Liden",
    "Josef",
    "Luzmarys",
    "Leonel",
    "Giralbis",
    "Antonio",
    "Carolina",
    "Vanessa",
    "Francis",
  ],
  Ecuador: ["Nathaly"],
  Peru: ["Wilyam"],
};
const ALL_ASIGNADOS = [...new Set(Object.values(ASIGNADOS).flat())];
const BANCOS = [
  "Venezuela",
  "Banesco",
  "Provincial",
  "Mercantil",
  "BNC",
  "Pago Movil (Banesco)",
  "Pago Movil (Provincial)",
  "Pago Movil (Venezuela)",
  "Pago Movil (Mercantil)",
  "Pago Movil (BNC)",
];
const MONEDAS = ["BRL", "USD", "PEN", "EUR", "VES"];
const PAGO_MOVIL_COMMISSION_RATE = 0.003;

const createMockData = () => [
  {
    id: "mock1",
    fecha: new Date(2025, 5, 20),
    sucursal: "Brasil",
    asignado: "Charly",
    banco: "Banesco",
    moneda: "BRL",
    monto: 100,
    tasaCambio: 22.52,
    tasaCompra: 5.61,
    tasaVenta: 133,
    montoEnUSD: 17.83,
    montoEntregarBs: 2252,
    gananciaNetaUSD: 0.9,
    gananciaMia: 0.45,
    gananciaAsignado: 0.45,
    gananciaCharly: 0,
  },
  {
    id: "mock2",
    fecha: new Date(2025, 5, 19),
    sucursal: "Peru",
    asignado: "Wilyam",
    banco: "Provincial",
    moneda: "PEN",
    monto: 200,
    tasaCambio: 10.5,
    tasaCompra: 3.75,
    tasaVenta: 40,
    montoEnUSD: 53.33,
    montoEntregarBs: 2100,
    gananciaNetaUSD: 0.83,
    gananciaMia: 0.415,
    gananciaAsignado: 0.415,
    gananciaCharly: 0,
  },
];

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState("dashboard");
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => {
    // Remove default browser margin to prevent white borders
    document.body.style.margin = "0";
  }, []);

  useEffect(() => {
    if (isDevelopmentMode) {
      setIsAuthReady(true);
      setUserId("dev-user");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          )
            await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign-in failed", error);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId) {
      setLoading(false);
      return;
    }
    if (isDevelopmentMode) {
      setOperations(createMockData());
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionPath = `/artifacts/${appId}/users/${userId}/operations`;
    const q = query(collection(db, collectionPath));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const opsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha?.toDate
            ? doc.data().fecha.toDate()
            : new Date(doc.data().fecha || new Date()),
        }));
        opsData.sort((a, b) => b.fecha - a.fecha);
        setOperations(opsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching operations:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isAuthReady, userId]);

  const handleSaveOperation = async (operationData) => {
    if (isDevelopmentMode) {
      if (operationData.id) {
        setOperations((ops) =>
          ops.map((op) => (op.id === operationData.id ? operationData : op))
        );
      } else {
        const newOp = { ...operationData, id: `mock${Date.now()}` };
        setOperations((ops) => [newOp, ...ops]);
      }
      setIsModalOpen(false);
      setEditingOperation(null);
      return;
    }
    const collectionPath = `/artifacts/${appId}/users/${userId}/operations`;
    try {
      if (operationData.id) {
        const { id, ...dataToUpdate } = operationData;
        await updateDoc(doc(db, collectionPath, id), dataToUpdate);
      } else {
        await addDoc(collection(db, collectionPath), operationData);
      }
      setIsModalOpen(false);
      setEditingOperation(null);
    } catch (error) {
      console.error("Error saving operation:", error);
    }
  };

  const handleDeleteOperation = async (id) => {
    if (isDevelopmentMode) {
      setOperations((ops) => ops.filter((op) => op.id !== id));
      return;
    }
    const collectionPath = `/artifacts/${appId}/users/${userId}/operations`;
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (error) {
      console.error("Error deleting operation: ", error);
    }
  };

  const openModalForEdit = (op) => {
    setEditingOperation(op);
    setIsModalOpen(true);
  };
  const openModalForNew = () => {
    setEditingOperation(null);
    setIsModalOpen(true);
  };

  const myDailyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOps = operations.filter(
      (op) => new Date(op.fecha).setHours(0, 0, 0, 0) === today.getTime()
    );
    return {
      myTotalGanancia: todayOps.reduce(
        (acc, op) => acc + (Number(op.gananciaMia) || 0),
        0
      ),
      totalMovidoUSD: todayOps.reduce(
        (acc, op) => acc + (Number(op.montoEnUSD) || 0),
        0
      ),
      count: todayOps.length,
    };
  }, [operations]);

  return (
    <div style={styles.appContainer}>
      <div style={styles.container}>
        <Header />
        <main style={{ marginTop: "1.5rem" }}>
          {view === "dashboard" && (
            <DashboardView stats={myDailyStats} onAddNew={openModalForNew} />
          )}
          {view === "list" && (
            <OperationsListView
              operations={operations}
              onEdit={openModalForEdit}
              onDelete={handleDeleteOperation}
              loading={loading}
              onAddNew={openModalForNew}
            />
          )}
          {view === "reports" && <ReportsView allOperations={operations} />}
          {view === "analysis" && (
            <AnalysisView
              onGetAnalysis={() => {}}
              result={analysisResult}
              isLoading={isAnalysisLoading}
            />
          )}
        </main>
      </div>
      <BottomNav
        currentView={view}
        setView={setView}
        onAddNew={openModalForNew}
      />
      {isModalOpen && (
        <OperationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOperation(null);
          }}
          onSave={handleSaveOperation}
          operation={editingOperation}
        />
      )}
    </div>
  );
}

// --- View Components ---
const Header = () => (
  <header style={styles.header}>
    <div style={styles.headerTitle}>
      <Icon name="Banknote" />
      <h1 style={styles.headerH1}>Gestor de Cambios</h1>
    </div>
  </header>
);

const DashboardView = ({ stats, onAddNew }) => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{ fontSize: "1.25rem", fontWeight: "600", color: "#d1d5db" }}
        >
          Tu Resumen del Día
        </h2>
        {!isMobile && (
          <button
            onClick={onAddNew}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Icon name="PlusCircle" />
            <span>Nueva Operación</span>
          </button>
        )}
      </div>
      <div
        style={{
          ...styles.grid,
          ...(isMobile ? styles.gridCols1 : styles.gridCols3),
        }}
      >
        <StatCard
          icon={<Icon name="DollarSign" style={{ color: "#4ade80" }} />}
          title="Mi Ganancia Hoy"
          value={formatCurrency(stats.myTotalGanancia)}
        />
        <StatCard
          icon={<Icon name="ArrowUpDown" style={{ color: "#38bdf8" }} />}
          title="Total Transado (USD)"
          value={formatCurrency(stats.totalMovidoUSD)}
        />
        <StatCard
          icon={<Icon name="BarChart2" style={{ color: "#facc15" }} />}
          title="Operaciones"
          value={stats.count}
        />
      </div>
    </div>
  );
};

const OperationsListView = ({
  operations,
  onEdit,
  onDelete,
  loading,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const filteredOperations = useMemo(() => {
    if (!searchTerm) return operations;
    return operations.filter(
      (op) =>
        (op.asignado?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (op.sucursal?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [operations, searchTerm]);

  return (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexDirection: isMobile ? "column" : "row",
          gap: "1rem",
        }}
      >
        <h2
          style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb" }}
        >
          Historial de Operaciones
        </h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.formInput, flexGrow: 1 }}
          />
          {!isMobile && (
            <button
              onClick={onAddNew}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              <Icon name="PlusCircle" />
              <span>Añadir</span>
            </button>
          )}
        </div>
      </div>
      <ResultsTable
        operations={filteredOperations}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

const ReportsView = ({ allOperations }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const [filters, setFilters] = useState({
    startDate: getLocalDateString(firstDayOfMonth),
    endDate: getLocalDateString(today),
    asignado: "Todos",
  });
  const [reportData, setReportData] = useState(null);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGenerateReport = () => {
    const { startDate, endDate, asignado } = filters;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");
    const filteredOps = allOperations.filter((op) => {
      const opDate = op.fecha;
      return (
        opDate >= start &&
        opDate <= end &&
        (asignado === "Todos" || op.asignado === asignado)
      );
    });
    const totals = filteredOps.reduce(
      (acc, op) => {
        acc.gananciaMia += Number(op.gananciaMia) || 0;
        acc.gananciaAsignado += Number(op.gananciaAsignado) || 0;
        acc.gananciaCharly += Number(op.gananciaCharly) || 0;
        acc.gananciaNetaUSD += Number(op.gananciaNetaUSD) || 0;
        return acc;
      },
      {
        gananciaMia: 0,
        gananciaAsignado: 0,
        gananciaCharly: 0,
        gananciaNetaUSD: 0,
      }
    );
    setReportData({ ops: filteredOps, totals: totals });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={styles.card}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#e5e7eb",
            marginBottom: "1rem",
          }}
        >
          Generador de Reportes
        </h2>
        <div
          style={{
            ...styles.grid,
            ...(isMobile ? styles.gridCols1 : styles.gridCols4),
          }}
        >
          <FormInput
            label="Desde"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <FormInput
            label="Hasta"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <FormSelect
            label="Asignado"
            name="asignado"
            value={filters.asignado}
            onChange={handleFilterChange}
            options={["Todos", ...ALL_ASIGNADOS]}
          />
          <button
            onClick={handleGenerateReport}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              alignSelf: "flex-end",
              height: "38px",
            }}
          >
            Generar
          </button>
        </div>
      </div>
      {reportData && (
        <div style={styles.card}>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#7dd3fc",
              marginBottom: "1rem",
            }}
          >
            Resultados del Reporte
          </h3>
          <div
            style={{
              ...styles.grid,
              ...(isMobile ? styles.gridCols1 : styles.gridCols4),
              marginBottom: "1.5rem",
            }}
          >
            <StatCard
              icon={<Icon name="DollarSign" style={styles.textGreen} />}
              title="Mi Ganancia"
              value={formatCurrency(reportData.totals.gananciaMia)}
            />
            <StatCard
              icon={<Icon name="Users" style={styles.textYellow} />}
              title="Ganancia Asignado(s)"
              value={formatCurrency(reportData.totals.gananciaAsignado)}
            />
            <StatCard
              icon={<Icon name="User" style={styles.textIndigo} />}
              title="Ganancia Charly"
              value={formatCurrency(reportData.totals.gananciaCharly)}
            />
            <StatCard
              icon={<Icon name="BarChart2" style={styles.textSky} />}
              title="Ganancia Neta Total"
              value={formatCurrency(reportData.totals.gananciaNetaUSD)}
            />
          </div>
          <ResultsTable operations={reportData.ops} loading={false} />
        </div>
      )}
    </div>
  );
};

const AnalysisView = ({ onGetAnalysis, result, isLoading }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <div style={styles.card}>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "#e5e7eb",
          marginBottom: "1rem",
        }}
      >
        Análisis con IA
      </h2>
      <button
        onClick={onGetAnalysis}
        disabled={isLoading}
        style={{ ...styles.button, ...styles.buttonPrimary }}
      >
        {isLoading ? "Analizando..." : "✨ Analizar último mes"}
      </button>
    </div>
    {result && (
      <div style={styles.card}>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif" }}>
          {result}
        </pre>
      </div>
    )}
  </div>
);

const BottomNav = ({ currentView, setView, onAddNew }) => {
  const { width } = useWindowSize();
  if (width >= 768) return null; // Hide on desktop
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1f2937",
        borderTop: "1px solid #374151",
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: "4rem",
          maxWidth: "448px",
          margin: "0 auto",
        }}
      >
        <NavItem
          icon={<Icon name="BarChart2" />}
          label="Dashboard"
          isActive={currentView === "dashboard"}
          onClick={() => setView("dashboard")}
        />
        <NavItem
          icon={<Icon name="Briefcase" />}
          label="Historial"
          isActive={currentView === "list"}
          onClick={() => setView("list")}
        />
        <div style={{ position: "relative" }}>
          <button
            onClick={onAddNew}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              borderRadius: "9999px",
              padding: "1rem",
              position: "absolute",
              top: "-2rem",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Icon name="PlusCircle" style={{ width: "28px", height: "28px" }} />
          </button>
        </div>
        <NavItem
          icon={<Icon name="FileText" />}
          label="Reportes"
          isActive={currentView === "reports"}
          onClick={() => setView("reports")}
        />
        <NavItem
          icon={<Icon name="BrainCircuit" />}
          label="Análisis"
          isActive={currentView === "analysis"}
          onClick={() => setView("analysis")}
        />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      color: isActive ? "#38bdf8" : "#9ca3af",
      background: "none",
      border: "none",
      cursor: "pointer",
    }}
  >
    {icon}
    <span style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>{label}</span>
  </button>
);

const ResultsTable = ({ operations, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem" }}>
        <p>Cargando...</p>
      </div>
    );
  }
  if (operations.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
          No se encontraron operaciones
        </h3>
      </div>
    );
  }
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
              <td
                style={{
                  ...styles.td,
                  ...styles.fontMono,
                  ...styles.textRight,
                }}
              >
                {formatCurrency(op.monto, op.moneda)}
              </td>
              <td
                style={{
                  ...styles.td,
                  ...styles.fontMono,
                  ...styles.textRight,
                  ...styles.textGreen,
                  fontWeight: "600",
                }}
              >
                {formatCurrency(op.gananciaMia)}
              </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                {onEdit && onDelete && (
                  <>
                    <button
                      onClick={() => onEdit(op)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.5rem",
                        color: "#38bdf8",
                      }}
                    >
                      <Icon name="Edit" />
                    </button>
                    <button
                      onClick={() => onDelete(op.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.5rem",
                        color: "#f87171",
                      }}
                    >
                      <Icon name="Trash2" />
                    </button>
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

const OperationModal = ({ isOpen, onClose, onSave, operation }) => {
  const [formData, setFormData] = useState({});
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    if (operation) {
      const opDate = operation.fecha?.toDate
        ? operation.fecha.toDate()
        : new Date(operation.fecha || today);
      const opY = opDate.getFullYear();
      const opM = String(opDate.getMonth() + 1).padStart(2, "0");
      const opD = String(opDate.getDate()).padStart(2, "0");
      setFormData({ ...operation, fecha: `${opY}-${opM}-${opD}` });
    } else {
      setFormData({
        id: null,
        fecha: `${y}-${m}-${d}`,
        sucursal: "Brasil",
        asignado: "Charly",
        banco: "Banesco",
        moneda: "BRL",
        monto: "",
        tasaCompra: "",
        tasaVenta: "",
        tasaCambio: "",
      });
    }
  }, [operation, isOpen]);

  const calculations = useMemo(() => {
    const monto = parseFloat(formData.monto) || 0;
    const tasaCompra = parseFloat(formData.tasaCompra) || 0;
    const tasaInterna = parseFloat(formData.tasaVenta) || 0;
    const tasaCliente = parseFloat(formData.tasaCambio) || 0;
    const moneda = formData.moneda;
    const montoEntregarBs = monto * tasaCliente;
    let montoRecibidoEnUSD = 0;
    if (moneda === "USD") montoRecibidoEnUSD = monto;
    else if (tasaCompra > 0) montoRecibidoEnUSD = monto / tasaCompra;
    let costoEntregaEnUSD = 0;
    if (tasaInterna > 0) costoEntregaEnUSD = montoEntregarBs / tasaInterna;
    const comisionPagoMovilBs = formData.banco?.includes("Pago Movil")
      ? montoEntregarBs * PAGO_MOVIL_COMMISSION_RATE
      : 0;
    const comisionEnUSD =
      tasaInterna > 0 ? comisionPagoMovilBs / tasaInterna : 0;
    const gananciaNetaUSD =
      montoRecibidoEnUSD - costoEntregaEnUSD - comisionEnUSD;
    const montoEnUSD = montoRecibidoEnUSD;
    let gananciaMia = 0,
      gananciaAsignado = 0,
      gananciaCharly = 0;
    if (formData.sucursal === "Brasil" && formData.asignado !== "Charly") {
      gananciaMia = gananciaNetaUSD * 0.5;
      const gananciaSocio = gananciaNetaUSD * 0.5;
      gananciaAsignado = gananciaSocio * (0.43 / 0.5);
      gananciaCharly = gananciaSocio * (0.07 / 0.5);
    } else {
      gananciaMia = gananciaNetaUSD * 0.5;
      gananciaAsignado = gananciaNetaUSD * 0.5;
    }
    return {
      montoEnUSD,
      montoEntregarBs,
      comisionPagoMovilBs,
      gananciaNetaUSD,
      gananciaMia,
      gananciaAsignado,
      gananciaCharly,
    };
  }, [formData]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "sucursal") newState.asignado = ASIGNADOS[value]?.[0] || "";
      return newState;
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      ...calculations,
      monto: parseFloat(formData.monto) || 0,
      tasaCompra: parseFloat(formData.tasaCompra) || 0,
      tasaCambio: parseFloat(formData.tasaCambio) || 0,
      tasaVenta: parseFloat(formData.tasaVenta) || 0,
      fecha: new Date(formData.fecha + "T00:00:00"),
    };
    onSave(finalData);
  };
  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <header style={styles.modalHeader}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            Nueva Operación
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            <Icon name="X" />
          </button>
        </header>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowY: "auto", flexGrow: 1, padding: "1.5rem" }}>
            <div
              style={{
                ...styles.grid,
                ...(isMobile ? styles.gridCols1 : styles.gridCols2),
                marginBottom: "1rem",
              }}
            >
              <FormInput
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha || ""}
                onChange={handleChange}
                required
              />
              <FormSelect
                label="Banco"
                name="banco"
                value={formData.banco || ""}
                onChange={handleChange}
                options={BANCOS}
              />
            </div>
            <div
              style={{
                ...styles.grid,
                ...(isMobile ? styles.gridCols1 : styles.gridCols2),
                marginBottom: "1rem",
              }}
            >
              <FormSelect
                label="Sucursal"
                name="sucursal"
                value={formData.sucursal || ""}
                onChange={handleChange}
                options={SUCURSALES}
              />
              <FormSelect
                label="Asignado"
                name="asignado"
                value={formData.asignado || ""}
                onChange={handleChange}
                options={ASIGNADOS[formData.sucursal] || []}
              />
            </div>
            <div
              style={{
                backgroundColor: "rgba(55, 65, 81, 0.5)",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#7dd3fc",
                  marginBottom: "1rem",
                }}
              >
                Monto y Tasas
              </h3>
              <div
                style={{
                  ...styles.grid,
                  ...(isMobile ? styles.gridCols1 : styles.gridCols2),
                  marginBottom: "1rem",
                }}
              >
                <FormInput
                  label="Monto Recibido"
                  type="number"
                  name="monto"
                  value={formData.monto || ""}
                  onChange={handleChange}
                  required
                  placeholder="100.00"
                  step="0.01"
                />
                <FormSelect
                  label="Moneda"
                  name="moneda"
                  value={formData.moneda || ""}
                  onChange={handleChange}
                  options={MONEDAS}
                />
              </div>
              <div
                style={{
                  ...styles.grid,
                  ...(isMobile ? styles.gridCols1 : styles.gridCols3),
                }}
              >
                <FormInput
                  label="Tasa Cliente"
                  type="number"
                  name="tasaCambio"
                  value={formData.tasaCambio || ""}
                  onChange={handleChange}
                  placeholder="22.52"
                  step="0.0001"
                />
                <FormInput
                  label="Tasa Compra"
                  type="number"
                  name="tasaCompra"
                  value={formData.tasaCompra || ""}
                  onChange={handleChange}
                  placeholder="5.61"
                  step="0.0001"
                />
                <FormInput
                  label="Tasa Interna"
                  type="number"
                  name="tasaVenta"
                  value={formData.tasaVenta || ""}
                  onChange={handleChange}
                  placeholder="133"
                  step="0.0001"
                />
              </div>
            </div>
            <div
              style={{
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                padding: "1.5rem",
                marginTop: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#7dd3fc",
                  marginBottom: "0.75rem",
                }}
              >
                Resultados
              </h3>
              <div
                style={{
                  ...styles.grid,
                  ...(isMobile ? styles.gridCols1 : styles.gridCols2),
                }}
              >
                <CalcResult
                  label="Bolívares a Recibir"
                  value={formatCurrency(calculations.montoEntregarBs, "VES")}
                  style={styles.textSky}
                />
                <CalcResult
                  label="Ganancia Neta ($)"
                  value={formatCurrency(calculations.gananciaNetaUSD)}
                  isPositive={calculations.gananciaNetaUSD >= 0}
                />
                <CalcResult
                  label="Mi Ganancia"
                  value={formatCurrency(calculations.gananciaMia)}
                  style={styles.textGreen}
                />
                <CalcResult
                  label="Ganancia Asignado"
                  value={formatCurrency(calculations.gananciaAsignado)}
                />
                {formData.sucursal === "Brasil" &&
                  formData.asignado !== "Charly" && (
                    <CalcResult
                      label="Ganancia Charly"
                      value={formatCurrency(calculations.gananciaCharly)}
                    />
                  )}
              </div>
            </div>
          </div>
          <footer style={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              Guardar
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const FormInput = ({ label, name, ...props }) => (
  <div>
    <label
      htmlFor={name}
      style={{
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
        marginBottom: "0.25rem",
      }}
      title={props.title}
    >
      {label}
    </label>
    <input id={name} name={name} {...props} style={styles.formInput} />
  </div>
);
const FormSelect = ({ label, name, options, ...props }) => (
  <div>
    <label
      htmlFor={name}
      style={{
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
        marginBottom: "0.25rem",
      }}
    >
      {label}
    </label>
    <select id={name} name={name} {...props} style={styles.formSelect}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
const StatCard = ({ icon, title, value }) => (
  <div style={{ ...styles.card, ...styles.statCard }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statTextContainer}>
      <h3 style={styles.statTitle}>{title}</h3>
      <p style={styles.statValue}>{value}</p>
    </div>
  </div>
);
const CalcResult = ({ label, value, isPositive, style }) => (
  <div
    style={{
      backgroundColor: "#374151",
      padding: "0.75rem",
      borderRadius: "0.5rem",
    }}
  >
    <p style={styles.statTitle}>{label}</p>
    <p
      style={{
        fontWeight: "bold",
        fontSize: "1.125rem",
        ...style,
        color: isPositive === false ? "#f87171" : "white",
      }}
    >
      {value}
    </p>
  </div>
);
