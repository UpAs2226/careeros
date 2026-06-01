import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, MapPin, DollarSign, Calendar, Trash2, Edit3, X, Check, Filter } from 'lucide-react';
import api from '../services/api';

const statusColors = {
  'Applied': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'OA': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Interview': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Technical Round': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'HR Round': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Selected': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Offer Received': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const statusOptions = Object.keys(statusColors);

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    type: 'Full-time',
    mode: 'On-site',
    salary: '',
    status: 'Applied',
    notes: '',
    jdText: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/application');
      setApplications(data);
    } catch (error) {
      console.error('Fetch applications error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/application/stats/overview');
      setStats(data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/application', formData);
      setShowForm(false);
      setFormData({
        company: '',
        role: '',
        location: '',
        type: 'Full-time',
        mode: 'On-site',
        salary: '',
        status: 'Applied',
        notes: '',
        jdText: ''
      });
      fetchApplications();
      fetchStats();
    } catch (error) {
      console.error('Add application error:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/application/${id}/status`, { status: newStatus });
      fetchApplications();
      fetchStats();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const deleteApplication = async (id) => {
    try {
      await api.delete(`/application/${id}`);
      fetchApplications();
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredApps = filter === 'All' 
    ? applications 
    : applications.filter(app => app.status === filter);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
          <p className="text-white/50">Manage and track all your job applications</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Application'}
        </button>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {[
            { label: 'Total', value: stats.total, color: 'bg-primary/20 text-primary' },
            { label: 'Applied', value: stats.byStatus.find(s => s._id === 'Applied')?.count || 0, color: 'bg-blue-500/20 text-blue-400' },
            { label: 'Interview', value: stats.byStatus.filter(s => ['Interview', 'Technical Round', 'HR Round'].includes(s._id)).reduce((a, b) => a + b.count, 0), color: 'bg-yellow-500/20 text-yellow-400' },
            { label: 'Offers', value: stats.byStatus.find(s => s._id === 'Offer Received')?.count || 0, color: 'bg-green-500/20 text-green-400' },
            { label: 'Rejected', value: stats.byStatus.find(s => s._id === 'Rejected')?.count || 0, color: 'bg-red-500/20 text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className={`glass-card p-4 text-center ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-80">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold mb-4">New Application</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Company *"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Role *"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="input-field"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="input-field"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                className="input-field"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <input
                type="text"
                placeholder="Salary (optional)"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="input-field"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="input-field"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Job Description URL/Text"
                value={formData.jdText}
                onChange={(e) => setFormData({...formData, jdText: e.target.value})}
                className="input-field"
              />
            </div>
            <button type="submit" className="mt-4 btn-primary">
              <Check className="w-4 h-4 inline mr-2" />
              Save Application
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-white/40" />
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            filter === 'All' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              filter === status ? statusColors[status] : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredApps.map((app, index) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{app.company}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {app.role}
                    </span>
                    {app.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.location}
                      </span>
                    )}
                    {app.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {app.salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </span>
                  </div>
                  {app.notes && (
                    <p className="mt-2 text-sm text-white/40">{app.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="input-field py-2 text-sm w-40"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteApplication(app._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No applications found. Start tracking your job search!</p>
          </div>
        )}
      </div>
    </div>
  );
}