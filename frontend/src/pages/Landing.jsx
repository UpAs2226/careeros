import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, FileText, Brain, TrendingUp, MessageSquare, Shield } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Resume Analyzer', desc: 'AI-powered ATS scoring with keyword analysis' },
  { icon: Brain, title: 'Job Matcher', desc: 'Match your skills against job descriptions' },
  { icon: TrendingUp, title: 'Skill Roadmap', desc: 'Personalized learning paths to your dream role' },
  { icon: MessageSquare, title: 'Mock Interviews', desc: 'Practice with AI interviewers' },
  { icon: Shield, title: 'Application Tracker', desc: 'Track all your job applications' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">CareerOS</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Get Started
              </button>
            </div>
          </motion.nav>

          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                AI-Powered Career Intelligence
              </span>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Land Your Dream Job with{' '}
                <span className="gradient-text">AI Precision</span>
              </h1>
              <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                Resume analysis, skill gap identification, mock interviews, and application tracking — all powered by advanced AI.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/30 transition-all"
                >
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-white/50">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-12">Trusted by Students Worldwide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Resumes Analyzed' },
              { value: '85%', label: 'Interview Success' },
              { value: '12K+', label: 'Dream Jobs Landed' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}