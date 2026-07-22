import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-900">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/agripredict_logo.png" className="w-8 h-8 rounded-lg shadow-sm" alt="AgriPredict Logo" />
          <span className="font-extrabold text-xl leading-none bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            AgriPredict Pro
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white text-sm font-semibold transition px-4 py-2 rounded-xl hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ─── Full-Screen Hero with Background Image ─── */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[calc(100vh-68px)]">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero_bg.png')" }}
        />

        {/* Deep gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />

        {/* Emerald glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 py-20">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 px-4 py-2 rounded-full border border-emerald-500/30 text-xs font-bold tracking-widest uppercase backdrop-blur-sm"
          >
            <Cpu className="w-3.5 h-3.5" />
            Hybrid Explainable AI (XAI) · Tamil Nadu Markets
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05]"
          >
            Maximize Crop Profits<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              with Machine Learning
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Predict market prices, compute spatial transportation cost optimizations,
            and understand predictions using localized SHAP explanation values.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-9 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-base cursor-pointer"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-slate-200 font-semibold px-9 py-4 rounded-2xl flex items-center justify-center gap-2 transition text-base"
            >
              Sign In to Dashboard
            </Link>
          </motion.div>

          {/* Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-6"
          >
            {[
              { icon: TrendingUp, label: '14 Crop Varieties', sub: 'Tracked across Tamil Nadu' },
              { icon: ShieldCheck, label: '99.82% R² Accuracy', sub: 'Continuous ML cross-validation' },
              { icon: Cpu, label: '5 ML Model Engines', sub: 'Hybrid, LSTM, XGBoost, RF, LR' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl"
              >
                <div className="bg-emerald-500/15 text-emerald-400 p-2 rounded-lg">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white leading-tight">{label}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade-out */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950">
        &copy; {new Date().getFullYear()} AgriPredict Pro &mdash; Designed for Sustainable Agricultural Supply Chains in Tamil Nadu.
      </footer>
    </div>
  );
}
