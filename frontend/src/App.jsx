import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { Shield, Database, ArrowRight, CheckCircle, Zap, Lock } from "lucide-react"
import Validate from "./pages/Validate"
import Results from "./pages/Results"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-500" size={28} />
          <span className="text-xl font-bold">DataAnchor</span>
        </div>
        <button
          onClick={() => navigate("/validate")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
          Start Validation
        </button>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="bg-blue-500/10 text-blue-400 text-sm px-4 py-1 rounded-full mb-6 border border-blue-500/20">
          Data Migration Validator
        </div>
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          Migrate Confidently.<br />
          <span className="text-blue-500">Validate Completely.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-8">
          DataAnchor automatically compares your source and target systems — detecting mismatches, validating integrity, and generating audit reports.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/validate")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">
            Start Validation <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="px-8 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need for safe migrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <Database className="text-blue-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">20+ Migration Paths</h3>
            <p className="text-gray-400 text-sm">CSV, MySQL, PostgreSQL, Snowflake, AWS RDS, BigQuery and more — all in one tool.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <CheckCircle className="text-green-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">Automated Validation</h3>
            <p className="text-gray-400 text-sm">Schema checks, row counts, data types, NULL comparison, and duplicate detection — all automated.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <Zap className="text-yellow-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">AI Insights (BYOK)</h3>
            <p className="text-gray-400 text-sm">Bring your own Groq API key for AI-powered column mapping and fix recommendations.</p>
          </div>
        </div>
      </div>

      {/* Migration Paths */}
      <div className="px-8 py-16 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Supported Migration Paths</h2>
          <p className="text-gray-400 text-center mb-10">Connect any source to any target</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "CSV → MySQL", "CSV → PostgreSQL", "CSV → Snowflake", "CSV → BigQuery",
              "MySQL → PostgreSQL", "PostgreSQL → MySQL", "MySQL → Snowflake", "AWS RDS → Snowflake",
              "PostgreSQL → BigQuery", "MySQL → BigQuery", "Snowflake → BigQuery", "AWS RDS → BigQuery"
            ].map((path) => (
              <div key={path} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-center text-gray-300">
                {path}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="px-8 py-16 max-w-6xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex items-start gap-4">
          <Lock className="text-blue-500 mt-1 flex-shrink-0" size={28} />
          <div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Safe</h3>
            <p className="text-gray-400 text-sm">Your database credentials are never stored. All connections are session-only and discarded after validation. Do not enter production credentials on public deployments.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 text-center text-gray-500 text-sm">
        DataAnchor — Built by Vaibhav Talekar
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/validate" element={<Validate />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}