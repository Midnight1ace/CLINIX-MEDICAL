"use client";

import ExplainabilityModal from "../components/ExplainabilityModal";
import InputPanel from "../components/InputPanel";
import Recommendations from "../components/Recommendations";
import RiskAlerts from "../components/RiskAlerts";
import SummaryCard from "../components/SummaryCard";
import { useAnalysis } from "../hooks/useAnalysis";

export default function Page() {
  const {
    rawText,
    setRawText,
    result,
    loading,
    error,
    analyze,
    loadSample,
    showExplain,
    setShowExplain
  } = useAnalysis();

  return (
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 font-bold">
            C
          </span>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">CLINIX Workflow Engine</h1>
            <p className="text-sm text-slate-300">
              Multi-agent clinical pipeline with hybrid rules + AI explainability.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="chip">Ingestion</span>
          <span className="chip">Summary</span>
          <span className="chip">Risk Detection</span>
          <span className="chip">Recommendations</span>
          <span className="chip">Explainability</span>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <InputPanel
            value={rawText}
            onChange={setRawText}
            onAnalyze={analyze}
            onLoadSample={loadSample}
            loading={loading}
          />
          <SummaryCard summary={result?.summary} structured={result?.structured} steps={result?.steps} />
        </div>

        <div className="space-y-6">
          <RiskAlerts risks={result?.risks || []} />
          <Recommendations recommendations={result?.recommendations || []} />
          <div className="flex items-center justify-between glass-card p-6">
            <div>
              <h2 className="text-xl font-semibold">Explainability</h2>
              <p className="text-sm text-slate-300">Show the reasoning behind each decision.</p>
            </div>
            <button
              className={`btn-primary ${!result ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => result && setShowExplain(true)}
              type="button"
              disabled={!result}
            >
              Explain
            </button>
          </div>
        </div>
      </section>

      <ExplainabilityModal
        open={showExplain}
        onClose={() => setShowExplain(false)}
        items={result?.explainability || []}
      />
    </main>
  );
}
