import { useState, useEffect } from 'react';
import { trainingService, memberService } from '../services';
import { 
  Users, 
  ThumbsUp, 
  Award, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const PastorDashboard = ({ activeTab, stats, refreshStats }) => {
  const [elders, setElders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [showRecForm, setShowRecForm] = useState(false);
  const [recForm, setRecForm] = useState({
    courseName: '',
    elderId: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const { data: membersData } = await memberService.getMembers();
      // Pastor sees elders under their local church / district scope
      setElders(membersData.filter(m => m.role === 'ELDER' || !m.role));

      const { data: coursesData } = await trainingService.getCourses();
      setCourses(coursesData);

      if (activeTab === 'recommend' || activeTab === 'dashboard') {
        const { data: recsData } = await trainingService.getRecommendations();
        setRecommendations(recsData);
      }

      if (activeTab === 'notifications') {
        const { data } = await trainingService.getNotifications();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await trainingService.recommendElder(recForm);
      setMessage('Elder recommended successfully! Field Secretary has been notified.');
      setRecForm({ courseName: '', elderId: '', notes: '' });
      setShowRecForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab: Dashboard stats */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Supervised Elders</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalElders}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <ThumbsUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Recommendations</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{recommendations.length}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Elders Certified</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.completedEnrollments}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Supervised Elders</h3>
                <button
                  onClick={() => setShowRecForm(true)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  <ThumbsUp size={14} /> Recommend Elder
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                      <th className="py-2.5">Elder Name</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {elders.slice(0, 3).map(el => (
                      <tr key={el.id}>
                        <td className="py-3 font-semibold">{el.name || el.firstName}</td>
                        <td className="py-3 text-slate-500">{el.email || 'N/A'}</td>
                        <td className="py-3 text-slate-500">{el.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Recent Recommendations</h3>
              {recommendations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">No active recommendations.</p>
              ) : (
                <div className="space-y-2">
                  {recommendations.slice(0, 3).map(r => (
                    <div key={r.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl text-xs">
                      <div className="font-semibold text-slate-800">Elder: {r.elder?.name}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">Course: {r.courseName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Elders List */}
      {activeTab === 'elders' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Elders Registry</h3>
            <p className="text-xs text-slate-400">View profiles and training details of elders under your pastoral care.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {elders.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.name || e.firstName}</td>
                    <td className="py-3 px-4 text-slate-500">{e.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-500">{e.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setRecForm({ ...recForm, elderId: e.id });
                          setShowRecForm(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Recommend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Recommend Elder */}
      {activeTab === 'recommend' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Elder Recommendations Panel</h3>
              <p className="text-xs text-slate-400 font-medium">Recommending your local elders to Union-wide programs.</p>
            </div>
            <button
              onClick={() => setShowRecForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <ThumbsUp size={16} /> Recommend Elder
            </button>
          </div>

          <div className="space-y-4">
            {recommendations.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center gap-4 text-sm">
                <div>
                  <h4 className="font-bold text-slate-800">{r.elder?.name}</h4>
                  <p className="text-xs text-slate-500">Program: {r.courseName} | Notes: "{r.notes || 'None'}"</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-100 rounded text-xs font-semibold">
                  Submitted
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Notifications Log</h3>
            <p className="text-xs text-slate-400 font-medium">Verify system alerts and course recommendations feed.</p>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No system notifications found.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    <p className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-200/50 text-slate-600 rounded text-[9px] uppercase font-bold">
                    {n.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Recommend Elder */}
      {showRecForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Recommend Elder for Course</h3>
              <button onClick={() => setShowRecForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleRecommend} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Church Elder</label>
                <select
                  required
                  value={recForm.elderId}
                  onChange={(e) => setRecForm({ ...recForm, elderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">-- Select Elder --</option>
                  {elders.map(el => (
                    <option key={el.id} value={el.id}>{el.name || el.firstName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Course Program</label>
                <select
                  required
                  value={recForm.courseName}
                  onChange={(e) => setRecForm({ ...recForm, courseName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Recommendation Notes</label>
                <textarea
                  value={recForm.notes}
                  onChange={(e) => setRecForm({ ...recForm, notes: e.target.value })}
                  placeholder="Reasons for recommendation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Recommendation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastorDashboard;
