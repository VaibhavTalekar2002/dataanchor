import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import { Shield, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Download, Zap } from "lucide-react"


function ScoreCard({ label, score, status }) {
  const color = status === "PASS" ? "text-green-400" : status === "WARNING" ? "text-yellow-400" : "text-red-400"
  const bg = status === "PASS" ? "border-green-500/30 bg-green-500/5" : status === "WARNING" ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5"

  return (
    <div className={`border rounded-xl p-4 ${bg}`}>
      <div className="text-gray-400 text-xs mb-1 uppercase">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{score}%</div>
      <div className={`text-xs mt-1 ${color}`}>{status}</div>
    </div>
  )
}

function StatusIcon({ status }) {
  if (status === "PASS") return <CheckCircle className="text-green-400" size={20} />
  if (status === "WARNING") return <AlertTriangle className="text-yellow-400" size={20} />
  return <XCircle className="text-red-400" size={20} />
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const results = location.state?.results

  const [downloadingPDF, setDownloadingPDF] = useState(false)

const handleDownloadPDF = async () => {
  setDownloadingPDF(true)
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/generate/pdf`,
      results,
      { responseType: "blob" }
    )
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "dataanchor_report.pdf")
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    alert("PDF generation failed. Please try again.")
  } finally {
    setDownloadingPDF(false)
  }
}

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">No results found.</p>
        <button onClick={() => navigate("/validate")} className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
          Run Validation
        </button>
      </div>
    )
  }

  const overallColor = results.overall_status === "PASS" ? "text-green-400" : results.overall_status === "WARNING" ? "text-yellow-400" : "text-red-400"

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Shield className="text-blue-500" size={28} />
          <span className="text-xl font-bold">DataAnchor</span>
        </div>
        <button onClick={() => navigate("/validate")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
          <ArrowLeft size={16} /> New Validation
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Overall Score */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8 text-center">
          <p className="text-gray-400 mb-2">Overall Migration Health Score</p>
          <div className={`text-7xl font-bold mb-2 ${overallColor}`}>
            {results.overall_score}%
          </div>
          <div className={`text-lg font-medium ${overallColor}`}>
            {results.overall_status}
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(results.results).map(([key, val]) => (
            <ScoreCard key={key} label={key.replace("_", " ")} score={val.score} status={val.status} />
          ))}
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          {/* Row Count */}
          {results.results.row_count && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <StatusIcon status={results.results.row_count.status} />
                <h3 className="font-semibold">Row Count</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 mb-1">Source Rows</div>
                  <div className="text-white font-medium">{results.results.row_count.source_rows?.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 mb-1">Target Rows</div>
                  <div className="text-white font-medium">{results.results.row_count.target_rows?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Schema */}
          {results.results.schema && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <StatusIcon status={results.results.schema.status} />
                <h3 className="font-semibold">Schema Comparison</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 mb-1">Source Columns</div>
                  <div className="text-white font-medium">{results.results.schema.source_columns}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 mb-1">Target Columns</div>
                  <div className="text-white font-medium">{results.results.schema.target_columns}</div>
                </div>
              </div>
              {results.results.schema.missing_in_target?.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
                  <div className="text-red-400 mb-1 font-medium">Missing in Target:</div>
                  <div className="text-gray-300">{results.results.schema.missing_in_target.join(", ")}</div>
                </div>
              )}
            </div>
          )}

          {/* Data Types */}
          {results.results.data_types?.mismatches?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <StatusIcon status={results.results.data_types.status} />
                <h3 className="font-semibold">Data Type Mismatches</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2">Column</th>
                    <th className="pb-2">Source Type</th>
                    <th className="pb-2">Target Type</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.data_types.mismatches.map((m, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-2 text-white">{m.column}</td>
                      <td className="py-2 text-yellow-400">{m.source_type}</td>
                      <td className="py-2 text-red-400">{m.target_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Nulls */}
          {results.results.nulls?.mismatches?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <StatusIcon status={results.results.nulls.status} />
                <h3 className="font-semibold">NULL Value Mismatches</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2">Column</th>
                    <th className="pb-2">Source NULLs</th>
                    <th className="pb-2">Target NULLs</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.nulls.mismatches.map((m, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-2 text-white">{m.column}</td>
                      <td className="py-2 text-yellow-400">{m.source_nulls}</td>
                      <td className="py-2 text-red-400">{m.target_nulls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Duplicates */}
          {results.results.duplicates && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <StatusIcon status={results.results.duplicates.status} />
                <h3 className="font-semibold">Duplicate Records</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 mb-1">Source Duplicates</div>
                  <div className="text-white font-medium">{results.results.duplicates.source_duplicates}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 mb-1">Target Duplicates</div>
                  <div className="text-white font-medium">{results.results.duplicates.target_duplicates}</div>
                </div>
              </div>
            </div>
          )}
        </div>
{/* AI Insights */}
        {results.ai_insights && (
          <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-yellow-400" size={20} />
              <h3 className="font-semibold text-blue-300">AI Insights</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">{results.ai_insights.summary}</p>
            {results.ai_insights.recommendations?.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Recommendations</p>
                <ul className="space-y-2">
                  {results.ai_insights.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
       {/* Run Again */}
<div className="flex gap-4 mt-8">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2">
            {downloadingPDF ? "Generating PDF..." : <><Download size={20} /> Download PDF Report</>}
          </button>
          <button
            onClick={() => navigate("/validate")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-semibold transition">
            Run Another Validation
          </button>
        </div>
      </div>
    </div>
  )
}