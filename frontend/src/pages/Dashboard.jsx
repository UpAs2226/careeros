import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Target, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard');
      setData(data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
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

  const applicationData = data?.applications?.byStatus?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const readinessBreakdown = data?.readiness?.breakdown ? [
    { name: 'Resume', score: data.readiness.breakdown.resume },
    { name: 'Skills', score: data.readiness.breakdown.skills },
    { name: 'DSA', score: data.readiness.breakdown.dsa },
    { name: 'Projects', score: data.readiness.breakdown.projects },
    { name: 'Communication', score: data.readiness.breakdown.communication },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/50">Track your career progress at a glance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value={data?.applications?.total || 0}
          subtitle={`${data?.applications?.interview || 0} in interview stage`}
          icon={Briefcase}
          color="primary"
        />
        <StatCard
          title="Interview Score"
          value={`${data?.interviews?.averageScore || 0}%`}
          subtitle={`${data?.interviews?.total || 0} interviews taken`}
                  icon={MessageSquare}
                  color="green"
              />
        <StatCard
          title="Resume Score"
                  value={`${data?.resume?.score || 0}%`}        
                  subtitle={`${data?.resume?.feedbackCount || 0} feedbacks`}
                  icon={FileText}
                  color="yellow"
              />  
              <StatCard title="Career Readiness"
                  value={`${data?.readiness?.score || 0}%`}   
                  subtitle="Overall readiness score"  
                  icon={TrendingUp}
                  color="indigo"      
              />  
          </div>  
          {/* Charts Section */}  
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">     
              <div className="glass-card p-6">    
                  <h2 className="text-xl font-semibold mb-4">Application Status</h2>  
                  <ResponsiveContainer width="100%" height={250}> 
                      <PieChart>  
                            <Pie    data={applicationData}
                                    dataKey="value"
                              nameKey="name"      
                              cx="50%"        
                              cy="50%"    
                              outerRadius={80}    
                              fill="#8884d8"  
                          
                              label={(entry) => `${entry.name}: ${entry.value}`}  
                          >
                              {applicationData.map((entry, index) => (        
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />     
                                  
                              ))} 
                          </Pie>  
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Career Readiness Breakdown</h2>
                  

                  <ResponsiveContainer width="100%" height={250}>     
                      <BarChart data={readinessBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>   
                          <XAxis dataKey="name" stroke="#8884d8" />   
                          <YAxis stroke="#8884d8" />
                          <Tooltip /> 
                          <Bar dataKey="score" fill="#6366f1" barSize={30} /> 
                      </BarChart>
                  </ResponsiveContainer>  
              </div>
          </div>
        </div>
    );
}

