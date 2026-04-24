// Route path constants for maintainability
export const ROUTES = {
  HOME: "/",
  PATIENTS: "/patients",
  PATIENT_DETAIL: "/patient",
  ADD_PATIENT: "/patients/new",
  COMPARE_PATIENTS: "/patients/compare",
  ALERTS: "/alerts",
  REPORTS: "/reports",
  SIMULATION: "/simulation",
  SYSTEM_DOCS: "/system-docs",
  SETTINGS: "/settings",
  LOGIN: "/login",
  DOCTOR_LOGIN: "/login/doctor"
} as const;

export const NAV_SECTIONS = [
  {
    label: "MAIN",
    items: [
      { key: "dashboard", label: "Dashboard", href: ROUTES.HOME },
      { key: "patients", label: "Patients", href: ROUTES.PATIENTS },
      { key: "add-patient", label: "Add Patient", href: ROUTES.ADD_PATIENT },
      { key: "compare", label: "Compare Patients", href: ROUTES.COMPARE_PATIENTS }
    ]
  },
  {
    label: "ANALYTICS",
    items: [
      { key: "alerts", label: "Alerts", href: ROUTES.ALERTS },
      { key: "reports", label: "Reports", href: ROUTES.REPORTS },
      { key: "simulation", label: "Simulation Lab", href: ROUTES.SIMULATION }
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { key: "system-docs", label: "System Docs", href: ROUTES.SYSTEM_DOCS },
      { key: "settings", label: "Settings", href: ROUTES.SETTINGS }
    ]
  }
];
