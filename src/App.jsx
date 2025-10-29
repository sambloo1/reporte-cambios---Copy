import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,  // <-- AÑADE ESTA
  createUserWithEmailAndPassword, // <-- AÑADE ESTA
  onAuthStateChanged,
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
} from "firebase/firestore";
import {
  ArrowUpDown, Trash2, Edit, PlusCircle, X, Search, DollarSign,
  Users, BarChart2, Briefcase, User, Banknote, FileText,
  Settings, UploadCloud,
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

// --- ID DE ADMINISTRADOR ---
// !! REEMPLAZA ESTE VALOR CON TU PROPIO UID DE FIREBASE !!
const ADMIN_UID = "TU_UID_DE_ADMINISTRADOR_AQUI";

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


// --- Estilos y Helpers (sin cambios) ---
const styles = {
  appContainer: { backgroundColor: "#111827", color: "white", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: "80px" },
  container: { maxWidth: "1280px", margin: "0 auto", padding: "1rem" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#7dd3fc" },
  headerTitle: { display: "flex", alignItems: "center", gap: "0.75rem" },
  headerH1: { fontSize: "1.875rem", fontWeight: "bold" },
  card: { backgroundColor: "#1f2937", padding: "1.25rem", borderRadius: "0.75rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)", border: "1px solid #374151" },
  statCard: { display: "flex", alignItems: "center", gap: "1rem" },
  statIcon: { padding: "0.75rem", borderRadius: "9999px", backgroundColor: "#374151" },
  statTextContainer: { display: "flex", flexDirection: "column" },
  statTitle: { fontSize: "0.875rem", fontWeight: "500", color: "#9ca3af" },
  statValue: { fontSize: "1.5rem", fontWeight: "bold" },
  button: { display: "inline-flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.75rem 1rem", fontWeight: "bold", color: "white", borderRadius: "0.5rem", border: "none", cursor: "pointer", transition: "background-color 0.2s, color 0.2s" },
  buttonPrimary: { backgroundColor: "#0284c7" },
  buttonSecondary: { backgroundColor: "#4b5563" },
  buttonDanger: { backgroundColor: "#dc2626" },
  table: { width: "100%", textAlign: "left", fontSize: "0.875rem" },
  th: { padding: "0.75rem", textTransform: "uppercase", color: "#9ca3af", backgroundColor: "rgba(55, 65, 81, 0.5)" },
  td: { padding: "0.75rem", borderBottom: "1px solid #374151" },
  modalOverlay: { position: "fixed", inset: "0", backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 50, display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem" },
  modalContent: { backgroundColor: "#1f2937", borderRadius: "0.5rem", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", width: "100%", maxWidth: "640px", maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid #374151" },
  modalHeader: { padding: "1rem", borderBottom: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 },
  modalBody: { flexGrow: 1, overflowY: "auto", padding: "1.5rem" },
  modalFooter: { padding: "1rem", borderTop: "1px solid #374151", display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexShrink: 0 },
  formInput: { width: "100%", boxSizing: "border-box", backgroundColor: "#374151", border: "1px solid #4b5563", borderRadius: "0.375rem", padding: "0.5rem 0.75rem", color: "white", outline: "none" },
  formSelect: { width: "100%", boxSizing: "border-box", backgroundColor: "#374151", border: "1px solid #4b5563", borderRadius: "0.375rem", padding: "0.5rem 0.75rem", color: "white", outline: "none" },
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
  const [windowSize, setWindowSize] = useState({ width: undefined, height: undefined });
  useEffect(() => {
    function handleResize() { setWindowSize({ width: window.innerWidth, height: window.innerHeight }); }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

const Icon = ({ name, style }) => {
  const icons = { Banknote, DollarSign, ArrowUpDown, BarChart2, Briefcase, PlusCircle, FileText, Users, User, Edit, Trash2, X, Search, Settings, UploadCloud };
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon style={{ ...styles.icon, ...style }} />;
};

const formatCurrency = (value, currency = "USD") => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return currency === "USD" ? "$0.00" : "Bs 0.00";
    const options = { style: "currency", minimumFractionDigits: 2, maximumFractionDigits: 2 };
    if (currency === "BRL") { options.currency = "BRL"; return new Intl.NumberFormat("pt-BR", options).format(numericValue); }
    if (currency === "VES") { options.currency = "VES"; return `Bs ${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue)}`; }
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

// --- DATOS INICIALES Y CONSTANTES ---
const SUCURSALES = ["Brasil", "Ecuador", "Peru"];
const ASIGNADOS_FALLBACK = {
  Brasil: ["Charly", "Moises", "Daniela", "Liden", "Josef", "Luzmarys", "Leonel", "Giralbis", "Antonio", "Carolina", "Vanessa", "Francis"],
  Ecuador: ["Nathaly"],
  Peru: ["Wilyam"],
};
const BANCOS = ["Venezuela", "Banesco", "Provincial", "Mercantil", "BNC", "Pago Movil (Banesco)", "Pago Movil (Provincial)", "Pago Movil (Venezuela)", "Pago Movil (Mercantil)", "Pago Movil (BNC)"];
const MONEDAS = ["BRL", "USD", "PEN", "EUR", "VES"];
const PAGO_MOVIL_COMMISSION_RATE = 0.003;

// --- FUNCIÓN DE CÁLCULO GLOBAL ---
const calculateOperation = (formData) => {
    const monto = parseFloat(formData.monto) || 0;
    const tasaCompra = parseFloat(formData.tasaCompra) || 0;
    const tasaInterna = parseFloat(formData.tasaVenta) || 0;
    const tasaCliente = parseFloat(formData.tasaCambio) || 0;
    const { moneda, banco, sucursal, asignado } = formData;
    const montoEntregarBs = monto * tasaCliente;
    let montoRecibidoEnUSD = 0;
    if (tasaCompra > 0) { montoRecibidoEnUSD = monto / tasaCompra; } 
    else if (moneda === "USD" || moneda === "VES") { montoRecibidoEnUSD = monto; }
    let costoEntregaEnUSD = 0;
    if (tasaInterna > 0) costoEntregaEnUSD = montoEntregarBs / tasaInterna;
    const comisionPagoMovilBs = banco?.includes("Pago Movil") ? montoEntregarBs * PAGO_MOVIL_COMMISSION_RATE : 0;
    const comisionEnUSD = tasaInterna > 0 ? comisionPagoMovilBs / tasaInterna : 0;
    const gananciaNetaUSD = montoRecibidoEnUSD - costoEntregaEnUSD - comisionEnUSD;
    const montoEnUSD = montoRecibidoEnUSD;
    let gananciaMia = 0, gananciaAsignado = 0, gananciaCharly = 0;
    if (sucursal === "Brasil" && asignado !== "Charly") {
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


// --- INICIO DE COMPONENTES DE UI ---
const Header = () => ( <header style={styles.header}> <div style={styles.headerTitle}> <Icon name="Banknote" /> <h1 style={styles.headerH1}>Gestor de Cambios</h1> </div> </header> );
const DashboardView = ({ stats, onAddNew }) => {
    const { width } = useWindowSize();
    const isMobile = width <= 768;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#d1d5db" }}> Resumen del Día </h2>
                {!isMobile && ( <button onClick={onAddNew} style={{ ...styles.button, ...styles.buttonPrimary }}> <Icon name="PlusCircle" /> <span>Nueva Operación</span> </button> )}
            </div>
            <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols3) }}>
                <StatCard icon={<Icon name="DollarSign" style={{ color: "#4ade80" }} />} title="Ganancia Total Hoy" value={formatCurrency(stats.totalNetProfit)} />
                <StatCard icon={<Icon name="ArrowUpDown" style={{ color: "#38bdf8" }} />} title="Total Transado (USD)" value={formatCurrency(stats.totalMovidoUSD)} />
                <StatCard icon={<Icon name="BarChart2" style={{ color: "#facc15" }} />} title="Operaciones" value={stats.count} />
            </div>
        </div>
    );
};
const ResultsTable = ({ operations, onEdit, onDelete, userId }) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead> <tr> <th style={styles.th}>Fecha</th> <th style={styles.th}>Asignado</th> <th style={styles.th}>Creado por</th> <th style={{ ...styles.th, ...styles.textRight }}>Monto</th> <th style={{ ...styles.th, ...styles.textRight }}>Ganancia Neta</th> <th style={{ ...styles.th, textAlign: "center" }}>Acciones</th> </tr> </thead>
        <tbody>
          {operations.map((op) => (
            <tr key={op.id} style={{ borderBottom: "1px solid #374151" }}>
              <td style={styles.td}>{formatDate(op.fecha)}</td>
              <td style={{ ...styles.td, fontWeight: "500" }}>{op.asignado}</td>
              <td style={{ ...styles.td, color: "#9ca3af" }}>{op.createdBy || 'Anónimo'}</td>
              <td style={{ ...styles.td, ...styles.fontMono, ...styles.textRight }}> {formatCurrency(op.monto, op.moneda)} </td>
              <td style={{ ...styles.td, ...styles.fontMono, ...styles.textRight, ...styles.textGreen, fontWeight: "600" }}> {formatCurrency(op.gananciaNetaUSD)} </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                  { (userId === op.creatorId || userId === ADMIN_UID) && (
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
const OperationsListView = ({ operations, onEdit, onDelete, onAddNew, onBulkAdd, userId }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [historyFilter, setHistoryFilter] = useState('all'); // 'all' or 'mine'
    const { width } = useWindowSize();
    const isMobile = width <= 768;

    const filteredOperations = useMemo(() => {
        let ops = operations;
        if (historyFilter === 'mine') {
            ops = ops.filter(op => op.creatorId === userId);
        }
        if (!searchTerm) return ops;
        return ops.filter( (op) => 
            (op.asignado?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
            (op.sucursal?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (op.createdBy?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
    }, [operations, searchTerm, historyFilter, userId]);

    return (
        <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: 'wrap', gap: "1rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb" }}> Historial de Operaciones </h2>
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#374151', padding: '0.25rem', borderRadius: '0.5rem'}}>
                    <button onClick={() => setHistoryFilter('all')} style={{...styles.button, padding: '0.5rem 1rem', backgroundColor: historyFilter === 'all' ? '#0284c7' : 'transparent'}}>Todos</button>
                    <button onClick={() => setHistoryFilter('mine')} style={{...styles.button, padding: '0.5rem 1rem', backgroundColor: historyFilter === 'mine' ? '#0284c7' : 'transparent'}}>Mis Registros</button>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexDirection: isMobile ? "column" : "row", gap: "1rem" }}>
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.formInput, flexGrow: 1, width: '100%' }} />
                {isMobile && (
                    <button onClick={onBulkAdd} style={{ ...styles.button, ...styles.buttonSecondary, width: '100%' }}>
                        <Icon name="UploadCloud" /> <span>Adición Múltiple</span>
                    </button>
                )}
                {!isMobile && ( 
                    <div style={{display: 'flex', gap: '1rem', flexShrink: 0}}> 
                        <button onClick={onBulkAdd} style={{ ...styles.button, ...styles.buttonSecondary }}> <Icon name="UploadCloud" /> <span>Adición Múltiple</span> </button> 
                        <button onClick={onAddNew} style={{ ...styles.button, ...styles.buttonPrimary }}> <Icon name="PlusCircle" /> <span>Añadir</span> </button> 
                    </div> 
                )}
            </div>
            { operations.length > 0 ? 
                <ResultsTable operations={filteredOperations} onEdit={onEdit} onDelete={onDelete} userId={userId} /> :
                <div style={{ textAlign: "center", padding: "2.5rem" }}> <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}> No hay operaciones registradas </h3> </div>
            }
        </div>
    );
};
const ReportsView = ({ allOperations, asignados, userId }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { width } = useWindowSize();
    const isMobile = width <= 768;
    const ALL_ASIGNADOS = useMemo(() => [...new Set(Object.values(asignados).flat())].sort(), [asignados]);
    
    const [filters, setFilters] = useState({ 
        startDate: getLocalDateString(firstDayOfMonth), 
        endDate: getLocalDateString(today), 
        selectedAsignados: ALL_ASIGNADOS, 
        selectedSucursales: SUCURSALES 
    });
    const [reportData, setReportData] = useState(null);
    const [advancedReportData, setAdvancedReportData] = useState(null);
    const [advancedReportOptions, setAdvancedReportOptions] = useState({
        includeCharlysCut: false,
        includeMyProfit: false
    });

    const handleFilterChange = (e) => { setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleSucursalChange = (sucursal) => {
        setFilters(prev => ({...prev, selectedSucursales: prev.selectedSucursales.includes(sucursal) ? prev.selectedSucursales.filter(s => s !== sucursal) : [...prev.selectedSucursales, sucursal]}));
    };
    const handleAsignadoChange = (asignado) => {
        setFilters(prev => ({...prev, selectedAsignados: prev.selectedAsignados.includes(asignado) ? prev.selectedAsignados.filter(a => a !== asignado) : [...prev.selectedAsignados, asignado]}));
    };
    const handleAdvancedOptionsChange = (e) => {
        const { name, checked } = e.target;
        setAdvancedReportOptions(prev => ({...prev, [name]: checked}));
    };

    const getFilteredOps = () => {
        const { startDate, endDate, selectedAsignados, selectedSucursales } = filters;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return allOperations.filter((op) => {
            const opDate = op.fecha.toDate ? op.fecha.toDate() : op.fecha;
            const sucursalMatch = selectedSucursales.includes(op.sucursal);
            const asignadoMatch = selectedAsignados.includes(op.asignado);
            const opDateOnly = new Date(opDate.getFullYear(), opDate.getMonth(), opDate.getDate());
            return (opDateOnly >= start && opDateOnly <= end && sucursalMatch && asignadoMatch);
        });
    };

    const handleGenerateReport = () => {
        const filteredOps = getFilteredOps();
        const totals = filteredOps.reduce( (acc, op) => {
            acc.gananciaMia += Number(op.gananciaMia) || 0;
            acc.gananciaAsignado += Number(op.gananciaAsignado) || 0;
            acc.gananciaCharly += Number(op.gananciaCharly) || 0;
            acc.gananciaNetaUSD += Number(op.gananciaNetaUSD) || 0;
            return acc;
        }, { gananciaMia: 0, gananciaAsignado: 0, gananciaCharly: 0, gananciaNetaUSD: 0 } );
        setReportData({ ops: filteredOps, totals });
        setAdvancedReportData(null); 
    };

    const handleGenerateAdvancedReport = () => {
        const filteredOps = getFilteredOps();
        const totalsByAsignado = filteredOps.reduce((acc, op) => {
            const asignado = op.asignado;
            if (!acc[asignado]) {
                acc[asignado] = { totalVolumeOriginal: {}, totalVolumeUSD: 0, totalNetProfit: 0, totalMyProfit: 0, totalCharlysProfit: 0, count: 0 };
            }
            if (!acc[asignado].totalVolumeOriginal[op.moneda]) {
                acc[asignado].totalVolumeOriginal[op.moneda] = 0;
            }
            acc[asignado].totalVolumeOriginal[op.moneda] += Number(op.monto) || 0;
            acc[asignado].totalVolumeUSD += op.montoEnUSD || 0;
            acc[asignado].totalNetProfit += op.gananciaNetaUSD || 0;
            acc[asignado].totalMyProfit += op.gananciaMia || 0;
            acc[asignado].totalCharlysProfit += op.gananciaCharly || 0;
            acc[asignado].count += 1;
            return acc;
        }, {});
        setAdvancedReportData({ totals: totalsByAsignado, options: advancedReportOptions });
        setReportData(null);
    };

    const handleCopyForWhatsapp = (asignado, totals, options, e) => {
        const originalText = e.target.textContent;
        e.target.textContent = "Copiado!";
        setTimeout(() => { e.target.textContent = originalText; }, 1500);

        let volumeText = Object.entries(totals.totalVolumeOriginal).map(([moneda, total]) => `${formatCurrency(total, moneda)}`).join('\n');
        let reportText = `*${asignado}*\n\n`;
        reportText += `Volumen de operaciones:\n${volumeText}\n`;
        reportText += `(${formatCurrency(totals.totalVolumeUSD)} en total)\n\n`;
        reportText += `Ganancia Neta Total: ${formatCurrency(totals.totalNetProfit)}\n`;
        if (options.includeMyProfit) {
            reportText += `Mi Ganancia: ${formatCurrency(totals.totalMyProfit)}\n`;
        }
        if (options.includeCharlysCut && totals.totalCharlysProfit > 0) {
            reportText += `Ganancia 15%: *${formatCurrency(totals.totalCharlysProfit)}*\n`;
        }
        
        const textArea = document.createElement("textarea");
        textArea.value = reportText;
        document.body.appendChild(textArea);
        textArea.select();
        try { document.execCommand('copy'); } 
        catch (err) { console.error('Failed to copy text: ', err); }
        document.body.removeChild(textArea);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={styles.card}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1rem" }}> Generador de Reportes </h2>
                <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), marginBottom: "1rem" }}>
                    <FormInput label="Desde" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    <FormInput label="Hasta" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Sucursales</label>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        {SUCURSALES.map(s => ( <label key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}> <input type="checkbox" checked={filters.selectedSucursales.includes(s)} onChange={() => handleSucursalChange(s)} style={{ accentColor: "#0284c7" }}/> {s} </label> ))}
                    </div>
                </div>
                 <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>Asignados</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.5rem", maxHeight: '150px', overflowY: 'auto', backgroundColor: '#374151', padding: '0.5rem', borderRadius: '0.5rem' }}>
                        {ALL_ASIGNADOS.map(a => ( <label key={a} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}> <input type="checkbox" checked={filters.selectedAsignados.includes(a)} onChange={() => handleAsignadoChange(a)} style={{ accentColor: "#0284c7" }}/> {a} </label> ))}
                    </div>
                </div>
                <button onClick={handleGenerateReport} style={{ ...styles.button, ...styles.buttonPrimary, marginRight: '1rem' }}>Generar Reporte Detallado</button>
                <div style={{borderTop: '1px solid #374151', paddingTop: '1.5rem', marginTop: '1.5rem'}}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "1rem" }}>Reporte Avanzado (Resumen por Asignado)</h3>
                    <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                         <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}> 
                            <input type="checkbox" name="includeMyProfit" checked={advancedReportOptions.includeMyProfit} onChange={handleAdvancedOptionsChange} style={{ accentColor: "#0284c7" }}/> 
                            Incluir Mi Ganancia
                        </label>
                         <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}> 
                            <input type="checkbox" name="includeCharlysCut" checked={advancedReportOptions.includeCharlysCut} onChange={handleAdvancedOptionsChange} style={{ accentColor: "#0284c7" }}/> 
                            Incluir Ganancia 15%
                        </label>
                    </div>
                    <button onClick={handleGenerateAdvancedReport} style={{ ...styles.button, ...styles.buttonSecondary }}> Generar Reporte Avanzado </button>
                </div>
            </div>
            {advancedReportData && (
                <div style={styles.card}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "1rem" }}>Resultados del Reporte Avanzado</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {Object.entries(advancedReportData.totals).map(([asignado, totals]) => (
                        <div key={asignado} style={{backgroundColor: '#111827', padding: '1rem', borderRadius: '0.5rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                                <h4 style={{...styles.statTitle, color: '#e5e7eb', fontSize: '1rem'}}>{asignado} ({totals.count} ops)</h4>
                                <button onClick={(e) => handleCopyForWhatsapp(asignado, totals, advancedReportData.options, e)} style={{...styles.button, ...styles.buttonSecondary, padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}>Copiar</button>
                            </div>
                            <div style={{...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), gap: '1rem'}}>
                                <div>
                                    <h5 style={styles.statTitle}>Volumen de Operaciones</h5>
                                    <div style={{backgroundColor: '#374151', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem'}}>
                                        {Object.entries(totals.totalVolumeOriginal).map(([moneda, total]) => (
                                            <p key={moneda}>{formatCurrency(total, moneda)}</p>
                                        ))}
                                        <p style={{borderTop: '1px solid #4b5563', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold'}}>{formatCurrency(totals.totalVolumeUSD)} (Total en USD)</p>
                                    </div>
                                </div>
                                 <div>
                                    <h5 style={styles.statTitle}>Resumen de Ganancias</h5>
                                     <div style={{backgroundColor: '#374151', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem'}}>
                                        <p>Ganancia Neta Total: <span style={{fontWeight: 'bold', color: '#4ade80'}}>{formatCurrency(totals.totalNetProfit)}</span></p>
                                        {advancedReportData.options.includeMyProfit && (
                                            <p>Mi Ganancia: <span style={{fontWeight: 'bold'}}>{formatCurrency(totals.totalMyProfit)}</span></p>
                                        )}
                                        {advancedReportData.options.includeCharlysCut && totals.totalCharlysProfit > 0 && (
                                            <p>Ganancia 15% (Charly): <span style={{fontWeight: 'bold'}}>{formatCurrency(totals.totalCharlysProfit)}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            )}
            {reportData && (
                 <div style={styles.card}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "1rem" }}> Resultados del Reporte Detallado </h3>
                     <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols4), marginBottom: "1.5rem" }}>
                        <StatCard icon={<Icon name="DollarSign" style={styles.textGreen} />} title="Mi Ganancia" value={formatCurrency(reportData.totals.gananciaMia)} />
                        <StatCard icon={<Icon name="Users" style={styles.textYellow} />} title="Ganancia Asignado(s)" value={formatCurrency(reportData.totals.gananciaAsignado)} />
                        <StatCard icon={<Icon name="User" style={styles.textIndigo} />} title="Ganancia Charly" value={formatCurrency(reportData.totals.gananciaCharly)} />
                        <StatCard icon={<Icon name="BarChart2" style={styles.textSky} />} title="Ganancia Neta Total" value={formatCurrency(reportData.totals.gananciaNetaUSD)} />
                    </div>
                    <ResultsTable operations={reportData.ops} onEdit={()=>{}} onDelete={()=>{}} userId={userId}/>
                </div>
            )}
        </div>
    );
};
const NavItem = ({ icon, label, isActive, onClick, style }) => ( <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: isActive ? "#38bdf8" : "#9ca3af", background: "none", border: "none", cursor: "pointer", flex: 1, ...style }}> {icon} <span style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>{label}</span> </button> );
const BottomNav = ({ currentView, setView, onAddNew }) => {
    const { width } = useWindowSize();
    if (width >= 768) return null;
    return (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#1f2937", borderTop: "1px solid #374151", zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "4rem", maxWidth: "600px", margin: "0 auto" }}>
                <NavItem icon={<Icon name="BarChart2" />} label="Dashboard" isActive={currentView === "dashboard"} onClick={() => setView("dashboard")} />
                <NavItem icon={<Icon name="Briefcase" />} label="Historial" isActive={currentView === "list"} onClick={() => setView("list")} />
                <div style={{ flex: 1, position: 'relative' }}>
                    <button onClick={onAddNew} style={{ ...styles.button, ...styles.buttonPrimary, borderRadius: "9999px", padding: "1rem", position: "absolute", top: "-2rem", left: "50%", transform: "translateX(-50%)" }}>
                        <Icon name="PlusCircle" style={{ width: "28px", height: "28px" }} />
                    </button>
                </div>
                <NavItem icon={<Icon name="FileText" />} label="Reportes" isActive={currentView === "reports"} onClick={() => setView("reports")} />
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
        if (operation) {
             const opDate = operation.fecha?.toDate ? operation.fecha.toDate() : new Date(operation.fecha || today);
             setFormData({ ...operation, fecha: getLocalDateString(opDate) });
        } else {
            setFormData({ id: null, fecha: getLocalDateString(today), sucursal: "Brasil", asignado: "Charly", banco: "Banesco", moneda: "BRL", monto: "", tasaCompra: "", tasaVenta: "", tasaCambio: "" });
        }
    }, [operation]);
    const calculations = useMemo(() => calculateOperation(formData), [formData]);
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
        const dataToSubmit = { 
            ...formData, 
            ...calculations, 
            monto: parseFloat(formData.monto) || 0,
            fecha: new Date(formData.fecha + "T00:00:00") // Guardar con hora local para evitar desfase de día
        };
        onSave(dataToSubmit);
    };
    if (!isOpen) return null;
    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <header style={styles.modalHeader}> <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}> {operation ? "Editar Operación" : "Nueva Operación"} </h2> <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}> <Icon name="X" /> </button> </header>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
                    <div style={{ ...styles.modalBody, overflowY: 'auto', flexGrow: 1 }}>
                        <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), marginBottom: "1rem" }}>
                            <FormInput label="Fecha" type="date" name="fecha" value={formData.fecha || ""} onChange={handleChange} required />
                            <FormSelect label="Banco" name="banco" value={formData.banco || ""} onChange={handleChange} options={BANCOS} />
                        </div>
                        <div style={{ ...styles.grid, ...(isMobile ? styles.gridCols1 : styles.gridCols2), marginBottom: "1rem" }}>
                            <FormSelect label="Sucursal" name="sucursal" value={formData.sucursal || ""} onChange={handleChange} options={SUCURSALES} />
                            <FormSelect label="Asignado" name="asignado" value={formData.asignado || ""} onChange={handleChange} options={asignados[formData.sucursal] || []} />
                        </div>
                        <div style={{ backgroundColor: "rgba(55, 65, 81, 0.5)", padding: "1rem", borderRadius: "0.5rem", marginBottom: '1rem' }}>
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
                        <div style={{ backgroundColor: "rgba(17, 24, 39, 0.5)", padding: "1.5rem" }}>
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
                <header style={styles.modalHeader}> <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{title}</h2> </header>
                <div style={styles.modalBody}> <p>{message}</p> </div>
                <footer style={styles.modalFooter}> <button onClick={onClose} style={{...styles.button, ...styles.buttonSecondary}}>Cancelar</button> <button onClick={onConfirm} style={{...styles.button, ...styles.buttonDanger}}>Confirmar</button> </footer>
            </div>
        </div>
    );
};
const BulkAddModal = ({ isOpen, onClose, onSaveBulk, asignados }) => {
    const { width } = useWindowSize();
    const isMobile = width <= 768;
    const [stagedOps, setStagedOps] = useState([]);
    const [formData, setFormData] = useState({ fecha: getLocalDateString(new Date()), sucursal: "Brasil", asignado: "Charly", banco: "Banesco", moneda: "BRL", monto: "", tasaCompra: "", tasaVenta: "", tasaCambio: "" });
    const [isSaving, setIsSaving] = useState(false);

    const handleResetForm = () => {
         setFormData(prev => ({ ...prev, monto: '' }));
    };

    const handleAddToList = () => {
        const calculations = calculateOperation(formData);
        const newOp = {
            ...formData,
            ...calculations,
            id: crypto.randomUUID(), // temp id
            fecha: new Date(formData.fecha + "T00:00:00"),
        };
        setStagedOps(prev => [newOp, ...prev]);
        handleResetForm();
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        await onSaveBulk(stagedOps);
        setIsSaving(false);
        setStagedOps([]);
        onClose();
    };

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

    if(!isOpen) return null;
    return (
        <div style={styles.modalOverlay}>
            <div style={{...styles.modalContent, maxWidth: '960px'}}>
                <header style={styles.modalHeader}> <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Adición Múltiple de Operaciones</h2> <button onClick={onClose} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}> <Icon name="X" /> </button> </header>
                <div style={{...styles.modalBody, overflowY: 'auto'}}>
                    <div style={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem'}}>
                        {/* Columna del Formulario */}
                        <div style={{flex: 1}}>
                             <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr", gap: '1rem', marginBottom: "1rem" }}>
                                <FormInput label="Fecha" type="date" name="fecha" value={formData.fecha || ""} onChange={handleChange} required />
                                <FormSelect label="Banco" name="banco" value={formData.banco || ""} onChange={handleChange} options={BANCOS} />
                            </div>
                            <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr", gap: '1rem', marginBottom: "1rem" }}>
                                <FormSelect label="Sucursal" name="sucursal" value={formData.sucursal || ""} onChange={handleChange} options={SUCURSALES} />
                                <FormSelect label="Asignado" name="asignado" value={formData.asignado || ""} onChange={handleChange} options={asignados[formData.sucursal] || []} />
                            </div>
                            <div style={{ backgroundColor: "rgba(55, 65, 81, 0.5)", padding: "1rem", borderRadius: "0.5rem", marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#7dd3fc", marginBottom: "1rem" }}> Monto y Tasas </h3>
                                <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr", gap: '1rem', marginBottom: "1rem" }}>
                                    <FormInput label="Monto Recibido" type="number" name="monto" value={formData.monto || ""} onChange={handleChange} required placeholder="100.00" step="0.01" />
                                    <FormSelect label="Moneda" name="moneda" value={formData.moneda || ""} onChange={handleChange} options={MONEDAS} />
                                </div>
                                <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr 1fr", gap: '1rem' }}>
                                    <FormInput label="Tasa Cliente" type="number" name="tasaCambio" value={formData.tasaCambio || ""} onChange={handleChange} placeholder="22.52" step="0.0001" />
                                    <FormInput label="Tasa Compra" type="number" name="tasaCompra" value={formData.tasaCompra || ""} onChange={handleChange} placeholder="5.61" step="0.0001" />
                                    <FormInput label="Tasa Interna" type="number" name="tasaVenta" value={formData.tasaVenta || ""} onChange={handleChange} placeholder="133" step="0.0001" />
                                </div>
                            </div>
                            <button onClick={handleAddToList} style={{...styles.button, ...styles.buttonPrimary, width: '100%'}}>Agregar a la Lista</button>
                        </div>
                        
                        {/* Divisor */}
                        {!isMobile && <div style={{backgroundColor: '#374151', width: '1px'}}></div>}

                        {/* Columna de la Lista */}
                        <div style={{flex: 1}}>
                            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1rem" }}>Operaciones por Guardar ({stagedOps.length})</h3>
                            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                                {stagedOps.length > 0 ? (
                                    <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                    {stagedOps.map((op, index) => (
                                        <li key={op.id} style={{backgroundColor: '#374151', padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                                <span>{formatDate(op.fecha)} - {op.asignado}</span>
                                                <span style={{color: '#4ade80', fontWeight: 'bold'}}>{formatCurrency(op.gananciaNetaUSD)}</span>
                                            </div>
                                        </li>
                                    ))}
                                    </ul>
                                ) : (
                                    <p style={{color: '#9ca3af', textAlign: 'center'}}>Añade operaciones usando el formulario.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <footer style={styles.modalFooter}> <button onClick={onClose} style={{...styles.button, ...styles.buttonSecondary}}>Cancelar</button> <button onClick={handleSaveAll} disabled={isSaving || stagedOps.length === 0} style={{...styles.button, ...styles.buttonPrimary}}> {isSaving ? "Guardando..." : `Guardar Todo (${stagedOps.length})`} </button> </footer>
            </div>
        </div>
    )
};
const SettingsView = ({ asignados, onSaveAsignados, userName, onSaveUserName }) => {
    const [newAsignado, setNewAsignado] = useState({ sucursal: "Brasil", nombre: "" });
    const [localUserName, setLocalUserName] = useState(userName);

    useEffect(() => { setLocalUserName(userName); }, [userName]);

    const handleAdd = () => {
        const { sucursal, nombre } = newAsignado;
        if (!nombre.trim()) return;
        
        const currentSucursalList = asignados[sucursal] || [];
        if (currentSucursalList.includes(nombre)) return; // No duplicados

        const updated = { 
            ...asignados,
            [sucursal]: [...currentSucursalList, nombre]
        };
        onSaveAsignados(updated);
        setNewAsignado({ sucursal: "Brasil", nombre: "" });
    };

    const handleDelete = (sucursal, nombre) => {
        const updated = { 
            ...asignados,
            [sucursal]: (asignados[sucursal] || []).filter(a => a !== nombre)
        };
        onSaveAsignados(updated);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={styles.card}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1.5rem" }}>Mi Perfil</h2>
                <div style={{...styles.grid, gridTemplateColumns: "1fr auto", gap: "1rem", marginBottom: "2rem", alignItems: 'flex-end'}}>
                    <FormInput
                        label="Mi Nombre de Usuario"
                        value={localUserName || ''}
                        onChange={e => setLocalUserName(e.target.value)}
                        placeholder="Tu nombre"
                    />
                    <button onClick={() => onSaveUserName(localUserName)} style={{...styles.button, ...styles.buttonPrimary, height: '38px'}}>Guardar Nombre</button>
                </div>
            </div>
            <div style={styles.card}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#e5e7eb", marginBottom: "1rem" }}> Gestionar Asignados </h2>
                <div style={{ ...styles.grid, gridTemplateColumns: "1fr 1fr auto", gap: "1rem", marginBottom: "2rem" }}>
                     <FormSelect label="Sucursal" value={newAsignado.sucursal} onChange={e => setNewAsignado(p => ({...p, sucursal: e.target.value}))} options={SUCURSALES} />
                     <FormInput label="Nombre del Asignado" value={newAsignado.nombre} onChange={e => setNewAsignado(p => ({...p, nombre: e.target.value}))} placeholder="Nuevo Nombre" />
                     <button onClick={handleAdd} style={{...styles.button, ...styles.buttonPrimary, alignSelf: 'flex-end', height: '38px'}}> Añadir </button>
                </div>
                <div style={{ ...styles.grid, ...(useWindowSize().width <= 768 ? styles.gridCols1 : styles.gridCols3) }}>
                    {SUCURSALES.map(sucursal => (
                        <div key={sucursal}>
                            <h3 style={{color: "#7dd3fc", borderBottom: "1px solid #374151", paddingBottom: '0.5rem', marginBottom: '1rem'}}>{sucursal}</h3>
                            <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                                {(asignados[sucursal] || []).map(nombre => (
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
const LoginScreen = ({ auth }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, pass)
      .catch(err => alert("Error al iniciar sesión: " + err.message));
  };
  
  const handleRegister = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, pass)
      .catch(err => alert("Error al registrar: " + err.message));
  };

  return (
    <div style={{...styles.appContainer, ...styles.modalOverlay, alignItems: 'center'}}>
      <form style={{...styles.card, width: '100%', maxWidth: '400px'}}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: 'center', color: '#7dd3fc', marginBottom: '1.5rem' }}>Iniciar Sesión</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
          <FormInput label="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
        </div>
        <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
          <button onClick={handleLogin} type="submit" style={{...styles.button, ...styles.buttonPrimary, flex: 1}}>Entrar</button>
          <button onClick={handleRegister} type="button" style={{...styles.button, ...styles.buttonSecondary, flex: 1}}>Registrar</button>
        </div>
      </form>
    </div>
  );
};
// --- COMPONENTE PRINCIPAL DE LA APP ---
export default function App() {
  const [view, setView] = useState("dashboard");
  const [operations, setOperations] = useState([]);
  const [asignados, setAsignados] = useState(ASIGNADOS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState({ isOpen: false });
  
  useEffect(() => {
    // --- FIX VISUAL: APLICAR COLOR DE FONDO A TODO EL DOCUMENTO ---
    document.documentElement.style.backgroundColor = styles.appContainer.backgroundColor;
    document.body.style.backgroundColor = styles.appContainer.backgroundColor;
  }, []);

   useEffect(() => { 
    if (!firebaseInitialized) { setLoading(false); setIsAuthReady(true); return; }

    // Esto solo comprueba si hay un usuario logueado, no crea uno anónimo
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Hay un usuario, lo guardamos
        setUser(user);
      } else {
        // No hay usuario
        setUser(null);
      }
      // Marcamos que la autenticación está lista y quitamos el loading
      setIsAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // ¡Este useEffect se ejecuta solo una vez!

  useEffect(() => {
    if (!isAuthReady || !user) { 
        return; 
    }
    
    // Cargar perfil de usuario (nombre)
    const userProfileDocRef = doc(db, `/artifacts/${appId}/public/data/users/${user.uid}`);
    const unsubUserProfile = onSnapshot(userProfileDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setUserName(docSnap.data().name || '');
        }
    });
    
    // Cargar asignados
    const asignadosDocRef = doc(db, `/artifacts/${appId}/users/${user.uid}/settings/asignados`);
    const unsubAsignados = onSnapshot(asignadosDocRef, (docSnap) => {
        if(docSnap.exists()){
            setAsignados(docSnap.data());
        } else {
            setDoc(asignadosDocRef, ASIGNADOS_FALLBACK);
        }
    });

    // Cargar operaciones
    const collectionPath = `/artifacts/${appId}/public/data/operations`;
    const q = query(collection(db, collectionPath));
    const unsubOps = onSnapshot( q, (querySnapshot) => {
        const opsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        opsData.sort((a, b) => (b.fecha.toDate ? b.fecha.toDate() : new Date(b.fecha)) - (a.fecha.toDate ? a.fecha.toDate() : new Date(a.fecha)));
        setOperations(opsData);
        setLoading(false);
      }, (error) => { 
        console.error("Error al obtener operaciones:", error); 
        setLoading(false);
      }
    );
    return () => {
        unsubUserProfile();
        unsubAsignados();
        unsubOps();
    };
  }, [isAuthReady, user]);

  const handleSaveOperation = async (operationData) => {
    if (!user) return;
    const collectionPath = `/artifacts/${appId}/public/data/operations`;
    const { id, ...dataToSave } = operationData;
    
    // Añadir creatorId y createdBy si es una nueva operación
    if (!id) {
        dataToSave.creatorId = user.uid;
        dataToSave.createdBy = userName || 'Anónimo';
    }

    try {
      if (id) {
        await updateDoc(doc(db, collectionPath, id), dataToSave);
      } else {
        await addDoc(collection(db, collectionPath), dataToSave);
      }
      setIsModalOpen(false);
      setEditingOperation(null);
    } catch (error) { console.error("Error saving operation:", error); }
  };
  
  const handleDeleteOperation = (idToDelete) => {
      setConfirmation({
          isOpen: true,
          title: "Confirmar Eliminación",
          message: "¿Estás seguro de que quieres eliminar esta operación? Esta acción no se puede deshacer.",
          onConfirm: async () => {
              if (!user) return;
              const collectionPath = `/artifacts/${appId}/public/data/operations`;
              try {
                await deleteDoc(doc(db, collectionPath, idToDelete));
              } catch (error) { console.error("Error deleting operation:", error); }
              setConfirmation({ isOpen: false });
          }
      });
  };
  
  const handleSaveAsignados = async (newAsignados) => {
    if (!user) return;
    const docRef = doc(db, `/artifacts/${appId}/users/${user.uid}/settings/asignados`);
    try {
      await setDoc(docRef, newAsignados);
    } catch(error) {
      console.error("Error saving asignados:", error);
    }
  };

  const handleSaveUserName = async (newName) => {
    if (!user || !newName.trim()) return;
    const userProfileDocRef = doc(db, `/artifacts/${appId}/public/data/users/${user.Id}`);
    try {
        await setDoc(userProfileDocRef, { name: newName });
    } catch (error) {
        console.error("Error saving user name:", error);
    }
  };
  
  const handleSaveBulkOperations = async (opsToSave) => {
    if (!user) return;
    const collectionPath = `/artifacts/${appId}/public/data/operations`;
    const promises = opsToSave.map(op => {
        const {id, ...data} = op; // remove temp id
        data.creatorId = user.uid;
        data.createdBy = userName || 'Anónimo';
        return addDoc(collection(db, collectionPath), data);
    });
    
    try {
        await Promise.all(promises);
    } catch(e) { 
        console.error("Error procesando carga masiva:", e); 
    }
  };

  const openModalForEdit = (op) => { setEditingOperation(op); setIsModalOpen(true); };
  const openModalForNew = () => { setEditingOperation(null); setIsModalOpen(true); };
  const openBulkModal = () => setIsBulkModalOpen(true);
  
  const myDailyStats = useMemo(() => {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    const todayOps = operations.filter(op => {
        const opDate = op.fecha.toDate ? op.fecha.toDate() : new Date(op.fecha);
        // Corregido: Comparar directamente las fechas en la zona horaria local del navegador.
        return getLocalDateString(opDate) === todayStr;
    });

    return {
      totalNetProfit: todayOps.reduce( (acc, op) => acc + (Number(op.gananciaNetaUSD) || 0), 0 ),
      totalMovidoUSD: todayOps.reduce( (acc, op) => acc + (Number(op.montoEnUSD) || 0), 0 ),
      count: todayOps.length,
    };
  }, [operations]);

  if (!firebaseInitialized) {
      return (
          <div style={{...styles.appContainer, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <p>Error: No se pudo inicializar la conexión con la base de datos.</p>
          </div>
      );
  }

  // 1. Si estamos cargando o esperando la auth, muestra el spinner
  if (loading || !isAuthReady) {
      return (
        <div style={{...styles.appContainer, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <div style={{
                    border: '4px solid #4b5563',
                    borderTop: '4px solid #38bdf8',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    animation: 'spin 1s linear infinite'
                }}></div>
                 <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
        </div>
      );
  }
  
  // 2. Si la auth está lista Y NO HAY USUARIO, muestra el Login
  if (!user) {
      return <LoginScreen auth={auth} />;
  }

  // 3. Si la auth está lista Y SÍ HAY USUARIO, muestra tu app
  return (
    <div style={styles.appContainer}>
      <div style={styles.container}>
        <Header />
        <main style={{ marginTop: "1.5rem" }}>
              <>
              {/* Pasamos 'user.uid' a los componentes que lo necesitan */}
              {view === "dashboard" && <DashboardView stats={myDailyStats} onAddNew={openModalForNew} />}
              {view === "list" && <OperationsListView operations={operations} onEdit={openModalForEdit} onDelete={handleDeleteOperation} onAddNew={openModalForNew} onBulkAdd={openBulkModal} userId={user.uid} />}
              {view === "reports" && <ReportsView allOperations={operations} asignados={asignados} />}
              {view === "settings" && <SettingsView asignados={asignados} onSaveAsignados={handleSaveAsignados} userName={userName} onSaveUserName={handleSaveUserName} />}
              </>
        </main>
      </div>
      <BottomNav currentView={view} setView={setView} onAddNew={openModalForNew} />
      {isModalOpen && <OperationModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingOperation(null); }} onSave={handleSaveOperation} operation={editingOperation} asignados={asignados}/>}
      {isBulkModalOpen && <BulkAddModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} onSaveBulk={handleSaveBulkOperations} asignados={asignados} />}
      <ConfirmationModal {...confirmation} onClose={() => setConfirmation({ isOpen: false })} />
    </div>
  );
}


