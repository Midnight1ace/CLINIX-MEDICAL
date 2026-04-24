"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { setAuth } from "../../utils/auth";

function buildPortalId(index) {
  return `P${String(index + 1).padStart(3, "0")}`;
}

const DEMO_PATIENT = {
  patientId: "P001",
  dob: "1980-01-01"
};

function isValidDob(value) {
  if (!value) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}

export default function PatientLoginPage() {
  const router = useRouter();
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    dob: "",
    remember: true
  });

  const patientIndex = useMemo(() => {
    if (typeof window === "undefined") {
      return { ids: [], portalIds: [] };
    }
    try {
      const raw = localStorage.getItem("clinix_patients_v1");
      if (!raw) return { ids: [], portalIds: [] };
      const patients = JSON.parse(raw);
      const ids = patients.map((patient) => patient.id);
      const portalIds = patients.map((_, index) => buildPortalId(index));
      return { ids, portalIds };
    } catch (error) {
      return { ids: [], portalIds: [] };
    }
  }, []);

  const updateField = (field) => (event) => {
    const value = field === "remember" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setAttempted(false);
    setError("");
  };

  const useDemo = () => {
    setForm((prev) => ({
      ...prev,
      patientId: DEMO_PATIENT.patientId,
      dob: DEMO_PATIENT.dob,
      remember: true
    }));
    setAttempted(false);
    setError("");
  };

  const normalizedPatientId = form.patientId.trim().toUpperCase();
  const patientIdOk = Boolean(
    normalizedPatientId &&
      (patientIndex.ids.includes(normalizedPatientId) ||
        patientIndex.portalIds.includes(normalizedPatientId) ||
        (patientIndex.ids.length === 0 && /^P\d{3}$/.test(normalizedPatientId)))
  );
  const dobOk = isValidDob(form.dob);

  const rules = [
    { id: "patient-id", label: "Patient ID matches a known portal ID (e.g. P001)", ok: patientIdOk },
    { id: "patient-dob", label: "Date of birth provided (YYYY-MM-DD)", ok: dobOk }
  ];

  const hasInput = Boolean(form.patientId || form.dob);
  const allChecksPass = rules.every((rule) => rule.ok);
  const statusLabel = allChecksPass ? "Verified" : attempted ? "Needs Attention" : "Pending";
  const statusClass = allChecksPass
    ? "text-emerald-600"
    : attempted
      ? "text-red-500"
      : "text-slate-400";

   const handleSubmit = async (event) => {
     event.preventDefault();
     setAttempted(true);
     setError("");
     if (!allChecksPass) {
       setError("Please resolve the failed checks before continuing.");
       return;
     }

     try {
       // Call backend login endpoint directly
       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/patient/login`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         credentials: 'include',
         body: JSON.stringify({
           patientId: normalizedPatientId,
           dob: form.dob
         })
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.detail || 'Login failed');
       }

       const result = await response.json();
       router.push("/patient");
     } catch (error) {
       setError(error.message || 'An error occurred during login');
       setAttempted(false);
     }
   };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-50">
        <div className="max-w-md space-y-6">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
            C
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">CLINIX Patient Access</h1>
          <p className="text-slate-500">
            Verify your portal details to view your latest summaries and care plan.
          </p>
          <div className="grid gap-3">
            <div className="card p-4">
              <p className="text-xs text-slate-400">Patient Verification</p>
              <p className="text-sm font-semibold text-slate-800">
                Portal ID + DOB checks before portal access
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-400">Privacy First</p>
              <p className="text-sm font-semibold text-slate-800">
                Demo environment using local storage only
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md card p-8 space-y-6" suppressHydrationWarning>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Patient Login</h2>
            <p className="text-sm text-slate-500">Verify your portal details to continue.</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-600">
              Patient ID
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="P001"
                value={form.patientId}
                onChange={updateField("patientId")}
                required
                autoComplete="off"
              />
              {patientIndex.portalIds.length > 0 && (
                <span className="mt-2 block text-xs text-slate-400">
                  Demo IDs: {patientIndex.portalIds.join(", ")}
                </span>
              )}
            </label>
            <label className="block text-sm text-slate-600">
              Date of Birth
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.dob}
                onChange={updateField("dob")}
                required
                autoComplete="bday"
              />
            </label>
          </div>

          <div className="card-soft p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Verification Checks</span>
              <span className={`text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
            </div>
            <div className="space-y-2 text-sm">
              {rules.map((rule) => {
                const showFail = !rule.ok && (attempted || hasInput);
                const label = rule.ok ? "Pass" : showFail ? "Fail" : "Pending";
                const color = rule.ok
                  ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                  : showFail
                    ? "text-red-500 border-red-200 bg-red-50"
                    : "text-slate-400 border-slate-200 bg-slate-50";
                return (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 ${color}`}
                  >
                    <span className="text-slate-700">{rule.label}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                );
              })}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-700">Demo Account</span>
              <button type="button" className="text-xs font-semibold text-indigo-700" onClick={useDemo}>
                Use demo
              </button>
            </div>
            <p className="text-xs text-slate-500">Patient ID: {DEMO_PATIENT.patientId}</p>
            <p className="text-xs text-slate-500">DOB: {DEMO_PATIENT.dob}</p>
          </div>

           <div className="flex items-center justify-between text-sm text-slate-500">
             <label className="flex items-center gap-2">
               <input type="checkbox" checked={form.remember} onChange={updateField("remember")} autoComplete="off" />
               Remember me
             </label>
           </div>

          <button
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={!allChecksPass}
          >
            Sign In
          </button>

          <div className="text-xs text-slate-400">
            Patient portal access only.
          </div>
        </form>
      </div>
    </div>
  );
}
