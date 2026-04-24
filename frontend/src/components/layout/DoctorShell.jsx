"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth } from "../../utils/auth";

const NAV_SECTIONS = [
  {
    label: "MAIN",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/" },
      { key: "patients", label: "Patients", href: "/patients" },
      { key: "add-patient", label: "Add Patient", href: "/patients/new" },
      { key: "compare", label: "Compare Patients", href: "/patients/compare" }
    ]
  },
  {
    label: "ANALYTICS",
    items: [
      { key: "alerts", label: "Alerts", href: "/alerts" },
      { key: "reports", label: "Reports", href: "/reports" },
      { key: "simulation", label: "Simulation Lab", href: "/simulation" }
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { key: "system-docs", label: "System Docs", href: "/system-docs" },
      { key: "settings", label: "Settings", href: "/settings" }
    ]
  }
];

export default function DoctorShell({ active, children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "doctor") {
      router.replace("/login/doctor");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <aside className="sidebar min-h-screen w-64 px-5 py-6 text-slate-200">
          <div className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/30 flex items-center justify-center">
              <span className="text-lg font-semibold">C</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">CLINIX</p>
              <p className="text-xs text-slate-400">Clinical OS</p>
            </div>
          </div>

          <nav className="mt-8 space-y-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="text-xs text-slate-400">{section.label}</p>
                <div className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`sidebar-item w-full ${active === item.key ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
