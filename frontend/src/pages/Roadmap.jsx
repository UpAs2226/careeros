import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Target, CheckCircle, Clock, BookOpen, Video, FileText, Code } from 'lucide-react';
import api from '../services/api';

const resourceIcons = {
  video: Video,
  article: FileText,
  practice: Code,
  project: Code
};

export default function Roadmap() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const { data } = await api.get('/job/roadmaps');
      setRoadmaps(data);
    } catch (error) {
      console.error('Fetch roadmaps error:', error);
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Skill Roadmap</h1>
        <p className="text-white/50">Your personalized learning paths</p>
      </motion.div>

      {roadmaps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Map className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Roadmaps Yet</h3>
          <p className="text-white/50 mb-6">Go to Job Matcher and generate a roadmap for your target role</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {roadmaps.map((roadmap, index) => (
            <motion.div
              key={roadmap._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{roadmap.targetRole}</h2>
                  <p className="text-white/50">Estimated: {roadmap.estimatedWeeks} weeks • Priority: {roadmap.priority}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${roadmap.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/60">{roadmap.progress}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {roadmap.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="space-y-4">
                {roadmap.timeline.map((week, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`relative pl-8 pb-6 border-l-2 last:pb-0 ${
                      week.completed ? 'border-green-500/50' : 'border-white/10'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 w-5 h-5 -translate-x-[11px] rounded-full border-4 border-dark flex items-center justify-center ${
                      week.completed ? 'bg-green-500' : 'bg-white/20'
                    }`}>
                      {week.completed && <CheckCircle className="w-3 h-3 text-dark" />}
                    </div>
                    <div className={`p-4 rounded-xl border ${
                      week.completed 
                        ? 'bg-green-500/5 border-green-500/20' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{week.week}</h4>
                        <span className="text-sm text-white/40">{week.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {week.topics.map((topic, j) => (
                          <span key={j} className="px-2 py-1 rounded-md bg-white/5 text-white/70 text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {week.resources.map((resource, k) => {
                          const Icon = resourceIcons[resource.type] || BookOpen;
                          return (
                            <a
                              key={k}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary transition-colors"
                            >
                              <Icon className="w-4 h-4" />
                              {resource.title}
                              <span className="text-xs text-white/40 capitalize">({resource.type})</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}