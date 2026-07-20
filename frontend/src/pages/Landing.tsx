import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  LineChart, 
  HelpCircle, 
  MapPin, 
  CloudSun, 
  Cpu, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mail,
  UserCheck
} from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-900">
      
      {/* 1. Header Navbar */}
      <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/agripredict_logo.png" className="w-8.5 h-8.5 rounded-lg shadow-sm" alt="AgriPredict Logo" />
          <span className="font-extrabold text-xl leading-none bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            AgriPredict Pro
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-emerald-400 text-sm font-semibold transition px-3 py-2">
            Login
          </Link>
          <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition cursor-pointer">
            Register Account
          </Link>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-radial from-slate-900/60 via-slate-950 to-slate-950">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
        
        {/* Glow orb */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto px-6 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/25 text-xs font-semibold tracking-wide uppercase"
          >
            <Cpu className="w-3.5 h-3.5" />
            Hybrid Explainable AI (XAI)
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            Maximize Crop Profits with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Hybrid Machine Learning
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Predict market prices, compute spatial transportation cost optimizations, and understand predictions using localized SHAP explanation values.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/register" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-base cursor-pointer">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#about" className="w-full sm:w-auto border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-200 font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition text-base">
              Learn More
            </a>
          </motion.div>

          {/* Glowing Hero Showcase Preview Image */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/40 p-2 shadow-2xl relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur opacity-30 transition duration-1000" />
            <img 
              src="/landing_hero_preview.png" 
              alt="AgriPredict Pro Dashboard Showcase" 
              className="w-full rounded-2.5xl object-cover border border-slate-800"
            />
          </motion.div>
        </div>
      </section>

      {/* 3. About Project & Research Objectives */}
      <section id="about" className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
              Project Abstract & Research Context
            </h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              AgriPredict Pro addresses agricultural price volatility caused by localized crop yields, seasonal weather, and middlemen inflation. By proposing a <strong>Hybrid LSTM + XGBoost model</strong>, the framework captures both sequence time-series lags and static context weather variables.
            </p>
            <p className="text-slate-400 leading-relaxed font-medium">
              Importantly, we address the "black-box" nature of deep learning using <strong>SHAP (SHapley Additive exPlanations)</strong>. Farmers receive step-by-step price contribution insights, letting them verify the system's trustworthiness before selling their produce.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-emerald-400 font-black text-2xl">92.1%</span>
                <p className="text-xs text-slate-400 mt-1">Cross-Validation R² Score</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-teal-300 font-black text-2xl">&lt; Rs 1.50</span>
                <p className="text-xs text-slate-400 mt-1">Mean Absolute Error (MAE)</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-slate-200">Core Research Objectives</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg h-fit">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">Predict Sequential Lags</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Capture daily pricing momentum using memory-based LSTM networks.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg h-fit">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">Integrate Spatial Factors</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Factor in transportation costs, base fuel prices, and market distances.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg h-fit">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">Explainable Decisions</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Quantify seasonal and weather parameters contribution per prediction.</p>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>
      </section>

      {/* 4. Features Section */}
      <section className="py-24 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Application Modules</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              Explore the fully functional features equipped in the AgriPredict Pro platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Intelligent Price Predictor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Input crop type, market center, harvest date, and weather parameters to evaluate expected spot prices.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Selling Recommendation Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates haversine spatial distance, storage cost limits, and transport expenses to list optimal markets.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Explainable AI (SHAP)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understand the "why" with interactive charts representing negative and positive feature impacts on price.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Weather Risk Dashboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time Open-Meteo forecasts coupled with custom seasonal triggers for heavy precipitation alarms.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Multi-Model Training</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare Linear Regression, Random Forest, XGBoost, and LSTM metrics. Saves the lowest RMSE model.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-200">Role-Based Access Controls</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tailored dashboard portals matching Farmer profiles, Researcher query tools, and Administrator controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. System Architecture Section */}
      <section className="py-24 max-w-6xl mx-auto px-6 border-t border-slate-900">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">System Architecture</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Our multi-tiered architecture starts with a high-performance **React + TypeScript** web interface. All API operations are managed via **FastAPI** leveraging asynchronous request cycles.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              Machine Learning predictions are served directly from our custom model training pipeline, which compares LSTM sequence predictions with XGBoost and Scikit-learn algorithms on database startup or admin trigger.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">SQLAlchemy ORM</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">FastAPI ASGI</span>
              </div>
            </div>
          </div>

          {/* Interactive ASCII or CSS Diagram representation */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm">Pipeline Pipeline Topology</h3>
            <div className="space-y-3 font-mono text-[10px] text-emerald-400 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
              <div>[Farmer UI] --(Quantities & Date)--&gt; [FastAPI Route]</div>
              <div className="pl-4 text-slate-500">|</div>
              <div>[FastAPI] --(Fetch Weather & Lags)--&gt; [SQLite / Postgres]</div>
              <div className="pl-4 text-slate-500">|</div>
              <div>[Model Registry] --(Inference & SHAP)--&gt; [Best Model]</div>
              <div className="pl-4 text-slate-500">|</div>
              <div>[Response API] --(Predicted Price + SHAP)--&gt; [Render Charts]</div>
            </div>
            <p className="text-[11px] text-slate-400 italic mt-2">
              Ensures high performance, caching forecasts locally to reduce external rate limits.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Contact Section */}
      <section className="py-24 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold">Research Collaboration</h2>
            <p className="text-xs text-slate-400">
              Are you an agricultural researcher or data analyst? Get in touch to collaborate.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
              <input 
                type="text" 
                placeholder="Ramesh Kumar" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-200" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="ramesh@gmail.com" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-200" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Message</label>
              <textarea 
                rows={4} 
                placeholder="Inquire about dataset uploads or explainable model details..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-200" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 transition active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              <Mail className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} AgriPredict Pro. Designed for Sustainable Agricultural Supply Chains.</p>
      </footer>
    </div>
  );
}
