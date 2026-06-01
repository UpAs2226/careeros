import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, CheckCircle, XCircle, Target, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import ProgressRing from '../components/ProgressRing';

export default function JobMatcher() {
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleMatch = async () => {
    if (!jdText.trim()) return;
    
    setAnalyzing(true);
    try {
      const { data } = await api.post('/job/match', { jdText });
      setResult(data);
    } catch (error) {
      console.error('Match error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRoadmap = async () => {
    if (!targetRole) return;
    
    setAnalyzing(true);
    try {
      const { data } = await api.post('/job/roadmap', { targetRole });
      setRoadmap(data.roadmap);
      setShowRoadmap(true);
    } catch (error) {
      console.error('Roadmap error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Job Description Matcher</h1>
        <p className="text-white/50">Paste a job description to see how well you match</p>
      </motion.div>

      {/* JD Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary" />
          <label className="font-medium">Job Description</label>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here..."
          className="input-field min-h-[200px] resize-none"
        />
        <button
          onClick={handleMatch}
          disabled={!jdText.trim() || analyzing}
          className="mt-4 btn-primary disabled:opacity-50"
        >
          {analyzing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Analyze Match
            </span>
          )}
        </button>
      </motion.div>

      {/* Match Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Match Score */}
            <div className="glass-card p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <ProgressRing 
                    percentage={result.matchScore} 
                    size={160} 
                    strokeWidth={14}
                    color={result.matchScore >= 70 ? '#10b981' : result.matchScore >= 50 ? '#f59e0b' : '#ef4444'}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    Match Score: {result.matchScore}%
                  </h2>
                  <p className="text-white/60 mb-4">
                    Readiness Score: {result.readinessScore}%
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      result.matchScore >= 70 ? 'bg-green-500/10 text-green-400' : 
                      result.matchScore >= 50 ? 'bg-yellow-500/10 text-yellow-400' : 
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {result.matchScore >= 70 ? 'Strong Match' : result.matchScore >= 50 ? 'Moderate Match' : 'Weak Match'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Matched Skills ({result.matchedSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm border border-green-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Missing Skills */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  Missing Skills ({result.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Critical Missing */}
            {result.criticalMissing?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 border-red-500/20"
              >
                <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Critical Missing Skills
                </h3>
                <p className="text-white/60 mb-4">These skills are essential for this role:</p>
                <div className="flex flex-wrap gap-2">
                  {result.criticalMissing.map((skill, i) => (
                    <span key={i} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recommendations
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-white/80">{rec}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Generate Roadmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Generate Skill Roadmap</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Enter target role (e.g., SDE Intern, Full Stack Developer)"
                  className="input-field flex-1"
                />
                <button
                  onClick={generateRoadmap}
                  disabled={!targetRole || analyzing}
                  className="btn-primary disabled:opacity-50"
                >
                  {analyzing ? 'Generating...' : 'Generate Roadmap'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap Display */}
      <AnimatePresence>
        {showRoadmap && roadmap && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold mb-2">Your Learning Roadmap</h3>
              <p className="text-white/60 mb-6">Target: {targetRole} • Estimated: {roadmap.estimatedWeeks} weeks</p>
              
              <div className="space-y-4">
                {roadmap.timeline.map((week, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-8 pb-8 border-l-2 border-white/10 last:pb-0"
                  >
                    <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full bg-primary border-4 border-dark" />
                    <div className="glass-card p-4 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-primary">{week.week}</h4>
                        <span className="text-xs text-white/40">{week.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {week.topics.map((topic, j) => (
                          <span key={j} className="px-2 py-1 rounded-md bg-white/5 text-white/70 text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {week.resources.map((resource, k) => (
                          <a
                            key={k}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                            {resource.title}
                            <span className="text-xs text-white/40 capitalize">({resource.type})</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}