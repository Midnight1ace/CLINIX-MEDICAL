"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setAuth } from "../../../utils/auth";

const DOCTOR_DOMAINS = ["hospital.org", "clinix.org", "health.org"];
const DEMO_DOCTOR = {
  email: "doctor@hospital.org",
  licenseId: "DOC-123456",
  password: "demo1234"
};

export default function DoctorLoginPage() {
  const router = useRouter();
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    licenseId: "",
    remember: true
  });

  const updateField = (field) => (event) => {
    const value = field === "remember" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setAttempted(false);
    setError("");
  };

  const useDemo = () => {
    setForm((prev) => ({
      ...prev,
      email: DEMO_DOCTOR.email,
      licenseId: DEMO_DOCTOR.licenseId,
      password: DEMO_DOCTOR.password,
      remember: true
    }));
    setAttempted(false);
    setError("");
  };

  const emailOk =
    form.email.trim().length > 5 &&
    DOCTOR_DOMAINS.some((domain) => form.email.toLowerCase().endsWith(`@${domain}`));
  const licenseOk = /^DOC-\d{6}$/i.test(form.licenseId.trim());
  const passwordOk = form.password.length >= 8 && /\d/.test(form.password);

  const rules = [
    { id: "doctor-domain", label: "Email uses an approved clinical domain", ok: emailOk },
    { id: "doctor-license", label: "License ID matches DOC-######", ok: licenseOk },
    { id: "doctor-password", label: "Password is 8+ chars and includes a number", ok: passwordOk }
  ];

  const hasInput = Boolean(form.email || form.licenseId || form.password);
  const allChecksPass = rules.every((rule) => rule.ok);
  const statusLabel = allChecksPass ? "Verified" : attempted ? "Needs Attention" : "Pending";
  const statusClass = allChecksPass
    ? "text-emerald-600"
    : attempted
      ? "text-red-500"
      : "text-slate-400";

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);
    setError("");
    if (!allChecksPass) {
      setError("Please resolve the failed checks before continuing.");
      return;
    }

    const payload = {
      role: "doctor",
      email: form.email.trim(),
      verifiedAt: new Date().toISOString()
    };
    setAuth(payload, { remember: form.remember });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-50">
        <div className="max-w-md space-y-6">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-semibold">
            C
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">CLINIX Doctor Access</h1>
          <p className="text-slate-500">
            Verify clinician credentials before entering the clinical dashboard.
          </p>
          <div className="grid gap-3">
            <div className="card p-4">
              <p className="text-xs text-slate-400">Secure Access</p>
              <p className="text-sm font-semibold text-slate-800">
                Domain + license validation before access
              </p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-400">Explainability</p>
              <p className="text-sm font-semibold text-slate-800">
                Every decision backed with rationale
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md card p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Doctor Login</h2>
            <p className="text-sm text-slate-500">Use your clinical credentials to continue.</p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-slate-600">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="doctor@hospital.org"
                value={form.email}
                onChange={updateField("email")}
                required
              />
            </label>
            <label className="block text-sm text-slate-600">
              License ID
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="DOC-123456"
                value={form.licenseId}
                onChange={updateField("licenseId")}
                required
              />
            </label>
            <label className="block text-sm text-slate-600">
              Password
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="********"
                value={form.password}
                onChange={updateField("password")}
                required
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
            <p className="text-xs text-slate-500">Email: {DEMO_DOCTOR.email}</p>
            <p className="text-xs text-slate-500">License: {DEMO_DOCTOR.licenseId}</p>
            <p className="text-xs text-slate-500">Password: {DEMO_DOCTOR.password}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.remember} onChange={updateField("remember")} />
              Remember me
            </label>
            <Link href="/login" className="text-indigo-600">
              Patient access
            </Link>
          </div>

          <button
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={!allChecksPass}
          >
            Sign In
          </button>

          <div className="text-xs text-slate-400">
            Patient? Use the dedicated route at <span className="text-slate-600">/login</span>.
          </div>
        </form>
      </div>
    </div>
  );
}
