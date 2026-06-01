import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import api from '../services/api';
import ProgressRing from '../components/ProgressRing';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function ReadinessScore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadiness();
  }, []);

  const fetchReadiness = async () => {
    try {
      const { data } = await api.get('/dashboard');
      setData(data.readiness);
    } catch (error) {
      console.error('Readiness fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const radarData = data?.breakdown ? [
    { subject: 'Resume', A: data.breakdown.resume, fullMark: 100 },
    { subject: 'Skills', A: data.breakdown.skills, fullMark: 100 },
    { subject: 'DSA', A: data.breakdown.dsa, fullMark: 100 },
    { subject: 'Projects', A: data.breakdown.projects, fullMark: 100 },
    { subject: 'Communication', A: data.breakdown.communication, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Placement Readiness Score</h1>
        <p className="text-white/50">AI-powered assessment of your placement readiness</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-shrink-0">
            <ProgressRing 
              percentage={data?.overallScore || 0} 
              size={220} 
              strokeWidth={18}
              color={data?.overallScore >= 70 ? '#10b981' : data?.overallScore >= 50 ? '#f59e0b' : '#ef4444'}
            />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl font-bold mb-4">
              {data?.verdict || 'Assessment Pending'}
            </h2>
            <p className="text-xl text-white/60 mb-6">
              Overall Score: <span className="font-bold text-white">{data?.overallScore || 0}%</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {radarData.map((item) => (
                <div key={item.subject} className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-2xl font-bold gradient-text">{item.A}%</p>
                  <p className="text-xs text-white/50 mt-1">{item.subject}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Radar
                name="Your Score"
                dataKey="A"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Your Strengths
            </h3>
            <div className="space-y-3">
              {data?.strengths?.map((strength, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10"
                >
                  <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white/80">{strength}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Areas to Improve
            </h3>
            <div className="space-y-3">
              {data?.gaps?.map((gap, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10"
                >
                  <TrendingUp className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white/80">{gap}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Recommended Action Items
        </h3>
        <div className="space-y-3">
          {data?.actionItems?.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-primary font-bold">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-white/80">{item}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {data?.timelineToReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6 text-center"
        >
          <p className="text-lg text-white/60">
            Estimated time to placement readiness: <span className="font-bold gradient-text">{data.timelineToReady}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}