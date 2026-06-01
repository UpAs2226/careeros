import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Zap, Award, TrendingUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import ProgressRing from '../components/ProgressRing';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const handleAnalyze = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume');
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
        <h1 className="text-3xl font-bold mb-2">Resume Analyzer</h1>
        <p className="text-white/50">Upload your resume and get AI-powered ATS analysis</p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-white/10 hover:border-white/30 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          {file ? (
            <div>
              <p className="text-lg font-medium mb-2">{file.name}</p>
              <p className="text-sm text-white/50">Click or drop to change file</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-white/50">Supports PDF, DOC, DOCX (max 10MB)</p>
            </div>
          )}
        </div>

        {file && !analyzing && !result && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleAnalyze}
            className="w-full mt-4 btn-primary py-4 text-lg"
          >
            <Zap className="w-5 h-5 inline mr-2" />
            Analyze Resume with AI
          </motion.button>
        )}

        {analyzing && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white/60 animate-pulse">AI is analyzing your resume...</p>
            <p className="text-sm text-white/40">Extracting skills, experience, and calculating ATS score</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-6"
          >
            {/* ATS Score */}
            <div className="glass-card p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <ProgressRing 
                    percentage={result.atsScore} 
                    size={180} 
                    strokeWidth={14}
                    color={result.atsScore >= 70 ? '#10b981' : result.atsScore >= 50 ? '#f59e0b' : '#ef4444'}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">ATS Score: {result.atsScore}%</h2>
                  <p className="text-white/60 mb-4">
                    {result.atsScore >= 70 
                      ? 'Great! Your resume is well-optimized for ATS systems.' 
                      : result.atsScore >= 50 
                      ? 'Good start, but there\'s room for improvement.'
                      : 'Your resume needs significant improvements to pass ATS filters.'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {result.strengths.map((strength, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm border border-green-500/20">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Extracted Skills */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Missing Keywords */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-sm border border-orange-500/20">
                      {keyword}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-bold">{i + 1}</span>
                    </div>
                    <p className="text-white/80">{suggestion}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Education & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Education</h3>
                <div className="space-y-3">
                  {result.education.map((edu, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5">
                      <p className="font-medium">{edu.institution}</p>
                      <p className="text-sm text-white/60">{edu.degree}</p>
                      <p className="text-xs text-white/40">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Experience</h3>
                <div className="space-y-3">
                  {result.experience.map((exp, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5">
                      <p className="font-medium">{exp.role}</p>
                      <p className="text-sm text-white/60">{exp.company}</p>
                      <p className="text-xs text-white/40">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}