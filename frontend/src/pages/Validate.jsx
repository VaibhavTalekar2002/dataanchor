import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, ArrowLeft, ArrowRight } from "lucide-react"
import axios from "axios"

const DB_TYPES = ["csv", "excel", "mysql", "postgresql", "snowflake", "aws_rds", "bigquery", "mssql"]

function ConnectionForm({ title, config, setConfig }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Type</label>
          <select
            value={config.type}
            onChange={e => setConfig({ ...config, type: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            {DB_TYPES.map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {["csv", "excel"].includes(config.type) ? (
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Upload File</label>
            <input
              type="file"
              accept={config.type === "csv" ? ".csv" : ".xlsx,.xls"}
              onChange={e => setConfig({ ...config, file: e.target.files[0] })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        ) : (
          <>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Host</label>
              <input
                type="text"
                placeholder="localhost"
                value={config.host || ""}
                onChange={e => setConfig({ ...config, host: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Port</label>
              <input
                type="text"
                placeholder="3306"
                value={config.port || ""}
                onChange={e => setConfig({ ...config, port: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Database</label>
              <input
                type="text"
                placeholder="my_database"
                value={config.database || ""}
                onChange={e => setConfig({ ...config, database: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Table</label>
              <input
                type="text"
                placeholder="my_table"
                value={config.table || ""}
                onChange={e => setConfig({ ...config, table: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Username</label>
              <input
                type="text"
                placeholder="root"
                value={config.username || ""}
                onChange={e => setConfig({ ...config, username: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={config.password || ""}
                onChange={e => setConfig({ ...config, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Validate() {
  const navigate = useNavigate()
  const [source, setSource] = useState({ type: "csv" })
  const [target, setTarget] = useState({ type: "mysql" })
  const [checks, setChecks] = useState({
    schema: true,
    row_count: true,
    data_types: true,
    nulls: true,
    duplicates: true,
    sample_rows: true
  })
  const [aiEnabled, setAiEnabled] = useState(false)
  const [groqKey, setGroqKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

const handleValidate = async () => {
  setLoading(true)
  setError("")
  try {
    const formData = new FormData()
    formData.append("source_type", source.type)
    formData.append("target_type", target.type)
    formData.append("checks", JSON.stringify(checks))
    formData.append("ai_enabled", aiEnabled)
    formData.append("groq_key", groqKey)

    if (source.file) formData.append("source_file", source.file)
    else formData.append("source_config", JSON.stringify(source))

    if (target.file) formData.append("target_file", target.file)
    else formData.append("target_config", JSON.stringify(target))

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/validate`, formData)
    navigate("/results", { state: { results: res.data } })
  } catch (err) {
    setError(err.response?.data?.detail || "Validation failed. Check your connection details.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <Shield className="text-blue-500" size={28} />
          <span className="text-xl font-bold">DataAnchor</span>
        </div>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
          <ArrowLeft size={16} /> Back to Home
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">Configure Validation</h1>
        <p className="text-gray-400 mb-8">Connect your source and target systems to begin validation</p>

        {/* Source & Target */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ConnectionForm title="Source System" config={source} setConfig={setSource} />
          <ConnectionForm title="Target System" config={target} setConfig={setTarget} />
        </div>

        {/* Validation Checks */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Validation Checks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(checks).map(key => (
              <div
                key={key}
                onClick={() => toggleCheck(key)}
                className={`cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition ${
                  checks[key]
                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                    : "bg-gray-800 border-gray-700 text-gray-400"
                }`}>
                {key.replace("_", " ").toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* AI Toggle */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">AI Insights (BYOK)</h3>
              <p className="text-gray-400 text-sm">Bring your own Groq API key for AI-powered recommendations</p>
            </div>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`w-12 h-6 rounded-full transition ${aiEnabled ? "bg-blue-600" : "bg-gray-700"}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${aiEnabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
          {aiEnabled && (
            <input
              type="password"
              placeholder="Enter the API_KEY Here"
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleValidate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-lg">
          {loading ? "Running Validation..." : <>Run Validation <ArrowRight size={20} /></>}
        </button>
      </div>
    </div>
  )
}