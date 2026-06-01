import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, Send, Clock, Star, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import ProgressRing from '../components/ProgressRing';

const interviewTypes = [
  { id: 'HR', label: 'HR Interview', desc: 'Behavioral and cultural fit questions' },
  { id: 'Technical', label: 'Technical', desc: 'DSA, coding, and technical concepts' },
  { id: 'Project', label: 'Project', desc: 'Deep dive into your projects' },
  { id: 'System Design', label: 'System Design', desc: 'Architecture and design questions' },
  { id: 'Mixed', label: 'Mixed', desc: 'Combination of all types' },
];

export default function MockInterview() {
  const [step, setStep] = useState('setup');
  const [selectedType, setSelectedType] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('Fresher');
  const [interviewData, setInterviewData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const startInterview = async () => {
    if (!selectedType || !role) {
      setError('Please select interview type and enter role');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/interview/start', {
        type: selectedType,
        role,
        experience,
        company: ''
      });
      
      setInterviewData(data);
      setStep('active');
    } catch (err) {
      console.error('Start interview error:', err);
      setError(err.response?.data?.message || 'Failed to start interview. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await api.post(`/interview/answer/${interviewData.interviewId}`, {
        questionIndex: currentQuestion,
        answer
      });
      
      setEvaluations([...evaluations, { ...data.evaluation, question: interviewData.questions[currentQuestion].question }]);
      setAnswer('');
      
      if (currentQuestion < interviewData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      setError('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const completeInterview = async () => {
    try {
      const { data } = await api.post(`/interview/complete/${interviewData.interviewId}`);
      setResults(data.results);
      setStep('review');
    } catch (err) {
      console.error('Complete interview error:', err);
      setError('Failed to complete interview');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Mock Interview</h1>
        <p className="text-white/50">Practice with AI-powered interview simulations</p>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Select Interview Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedType === type.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className={`w-6 h-6 mb-2 ${selectedType === type.id ? 'text-primary' : 'text-white/40'}`} />
                    <p className="font-medium mb-1">{type.label}</p>
                    <p className="text-sm text-white/50">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Interview Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Target Role *</label>
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Frontend Developer" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Experience Level</label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} className="input-field">
                    <option value="Fresher">Fresher</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>
              <button onClick={startInterview} disabled={loading} className="mt-6 btn-primary w-full py-4 text-lg disabled:opacity-50">
                {loading ? 'Preparing...' : <span className="flex items-center justify-center gap-2"><Play className="w-5 h-5" /> Start Interview</span>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'active' && interviewData && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Question {currentQuestion + 1} of {interviewData.questions.length}</span>
                <span className="flex items-center gap-2 text-sm text-white/60"><Clock className="w-4 h-4" />~{interviewData.duration} min</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentQuestion + 1) / interviewData.questions.length) * 100}%` }} />
              </div>
            </div>

            <motion.div key={currentQuestion} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">{interviewData.questions[currentQuestion].category}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${interviewData.questions[currentQuestion].difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : interviewData.questions[currentQuestion].difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {interviewData.questions[currentQuestion].difficulty}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-6 leading-relaxed">{interviewData.questions[currentQuestion].question}</h3>
              <div className="mb-4">
                <p className="text-sm text-white/50 mb-2">Expected points to cover:</p>
                <div className="flex flex-wrap gap-2">
                  {interviewData.questions[currentQuestion].expectedAnswerPoints.map((point, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-white/5 text-white/60 text-sm">{point}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="glass-card p-6">
              <label className="block text-sm font-medium text-white/70 mb-3">Your Answer</label>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here..." className="input-field min-h-[150px] resize-none mb-4" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/40">{answer.length} characters</span>
                <button onClick={submitAnswer} disabled={!answer.trim() || loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Evaluating...' : <span className="flex items-center gap-2"><Send className="w-4 h-4" />{currentQuestion < interviewData.questions.length - 1 ? 'Next' : 'Finish'}</span>}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'review' && results && (
          <motion.div key="review" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="glass-card p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Interview Complete!</h2>
              <div className="flex justify-center mb-6">
                <ProgressRing percentage={results.overallScore} size={200} strokeWidth={16} color={results.overallScore >= 70 ? '#10b981' : results.overallScore >= 50 ? '#f59e0b' : '#ef4444'} />
              </div>
              <p className="text-xl font-semibold mb-2">Overall Score: {results.overallScore}%</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold mb-1">{results.communicationScore}%</p>
                <p className="text-white/60">Communication</p>
              </div>
              <div className="glass-card p-6 text-center">
                <Star className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="text-3xl font-bold mb-1">{results.technicalDepthScore}%</p>
                <p className="text-white/60">Technical Depth</p>
              </div>
              <div className="glass-card p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-3xl font-bold mb-1">{results.confidenceScore}%</p>
                <p className="text-white/60">Confidence</p>
              </div>
            </div>

            <button onClick={() => { setStep('setup'); setSelectedType(''); setRole(''); setCurrentQuestion(0); setEvaluations([]); setResults(null); }} className="w-full btn-primary py-4">
              Start New Interview
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}