import { useState } from "react";
import { analyzePatient } from "../services/api";

const SAMPLE_TEXT =
  "45-year-old male with chest pain and shortness of breath. BP 150/95, HR 110, temp 37.8. Taking aspirin.";

export function useAnalysis() {
  const [rawText, setRawText] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExplain, setShowExplain] = useState(false);

  const analyze = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzePatient(rawText);
      setResult(data);
      setShowExplain(false);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => setRawText(SAMPLE_TEXT);

  return {
    rawText,
    setRawText,
    result,
    loading,
    error,
    analyze,
    loadSample,
    showExplain,
    setShowExplain
  };
}
