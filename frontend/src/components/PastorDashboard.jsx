import { useState, useEffect } from 'react';
import { useAuth, useWebSocket } from '../context';
import { toast } from '../utils/toast';
import { trainingService, authService, availabilityService, hierarchyService } from '../services';
import { 
  Users, 
  ThumbsUp, 
  Award, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  UserPlus,
  Send,
  MessageSquare,
  Plus,
  Bell
} from 'lucide-react';

const PastorDashboard = ({ activeTab, stats, refreshStats }) => {
  const { user } = useAuth();
  const { chatMessages, sendChatMessage } = useWebSocket();
  const [chatInput, setChatInput] = useState('');
  const [elders, setElders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [localChurches, setLocalChurches] = useState([]);

  // Form states
  const [showRecForm, setShowRecForm] = useState(false);
  const [recForm, setRecForm] = useState({
    courseName: '', elderId: '', notes: ''
  });

  const [availForm, setAvailForm] = useState({
    date: '', status: 'AVAILABLE', notes: ''
  });
  const [showAvailForm, setShowAvailForm] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', phone: '', localChurchId: ''
  });
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const { data: membersData } = await authService.getUsers({ role: 'ELDER' });
      setElders(membersData);

      const { data: coursesData } = await trainingService.getCourses();
      setCourses(coursesData);

      if (activeTab === 'dashboard' || activeTab === 'registrations') {
        const { data: recsData } = await trainingService.getRecommendations();
        setRecommendations(recsData);
      }

      if (activeTab === 'availability') {
        const { data } = await availabilityService.getAvailability();
        setAvailabilities(data);
      }

      if (activeTab === 'register_elder') {
        const { data } = await hierarchyService.getHierarchy();
        // Filter churches that belong to this pastor's districtId
        const districtChurches = data.localChurches.filter(c => c.districtId === user?.districtId);
        setLocalChurches(districtChurches);
      }

      if (activeTab === 'communication') {
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
    try {
      await trainingService.recommendElder(recForm);
      toast.success('Elder recommended successfully! Field Secretary has been notified.');
      setRecForm({ courseName: '', elderId: '', notes: '' });
      setShowRecForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await availabilityService.setAvailability(availForm);
      toast.success('Availability calendar record logged successfully!');
      setAvailForm({ date: '', status: 'AVAILABLE', notes: '' });
      setShowAvailForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log availability');
    } finally {
      setLoading(false);
    }
  };
  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };
  const handleElderRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register({
        ...registerForm,
        role: 'ELDER',
        districtId: user?.districtId,
        isVerified: true
      });
      toast.success('Elder registered successfully!');
      setRegisterForm({ name: '', email: '', password: '', phone: '', localChurchId: '' });
      setShowRegisterForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register elder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

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
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{recommendations.length} Active</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Programs</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalCourses} Scheduled</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Supervised Elders Directory</h3>
                <button
                  onClick={() => setShowRecForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Recommend for Training
                </button>
              </div>

              {elders.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No elders registered in your district.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {elders.map(e => (
                        <tr key={e.id}>
                          <td className="py-2 px-3 font-medium text-slate-800">{e.name}</td>
                          <td className="py-2 px-3 text-slate-500">{e.email}</td>
                          <td className="py-2 px-3 text-slate-500">{e.phone || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Availability Check */}
      {activeTab === 'availability' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Availability Check Calendar</h3>
              <p className="text-xs text-slate-400">Manage and schedule availability windows for elder reviews.</p>
            </div>
            <button
              onClick={() => setShowAvailForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus size={16} /> Log Availability
            </button>
          </div>

          {availabilities.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No availability records scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availabilities.map(av => (
                <div key={av.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">{new Date(av.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      av.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {av.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">Pastor Availability Slot</p>
                  {av.notes && <p className="text-xs text-slate-500">"{av.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Register Elder */}
      {activeTab === 'register_elder' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left max-w-lg">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Register Local Church Elder</h3>
            <p className="text-xs text-slate-400">Configure a new elder system login within your district care scope.</p>
          </div>

          <form onSubmit={handleElderRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Full Name</label>
              <input 
                type="text"
                required
                value={registerForm.name}
                onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Elder Habimana Silas"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Email</label>
                <input 
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="elder@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Password</label>
                <input 
                  type="password"
                  required
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Phone</label>
                <input 
                  type="text"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="0788123456"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Scoped Local Church</label>
                <select 
                  required
                  value={registerForm.localChurchId}
                  onChange={e => setRegisterForm({ ...registerForm, localChurchId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">-- Select Local Church --</option>
                  {localChurches.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              {loading ? 'Registering...' : 'Register Elder'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: My Registrations */}
      {activeTab === 'registrations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My District Registrations</h3>
            <p className="text-xs text-slate-400">Audit course registration recommendations made within your pastoral care.</p>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No recommendations submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {recommendations.map(r => (
                <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Recommended Elder: {r.elder?.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Program: {r.courseName} | Notes: "{r.notes || 'None'}"</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-[10px] uppercase font-bold">
                    RECOMMENDED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Communication Page */}
      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Notification logs list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">System Alerts Logs</h3>
              <p className="text-xs text-slate-400">Past administrative broadcasts log files.</p>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl">No logs recorded.</p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex items-start gap-2 text-xs">
                    <Bell size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-800">{n.title}</h4>
                      <p className="text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Group Chat */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 flex flex-col justify-between h-[450px]">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Live Staff chatroom</h3>
                <p className="text-xs text-slate-400">Instant messaging between active conference pastors and staff.</p>
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
              {chatMessages.length === 0 ? (
                <p className="text-slate-400 text-center py-10">No messages in chat yet. Start the conversation!</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col max-w-[70%] ${msg.senderName === user?.name ? 'ml-auto items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 font-semibold mb-0.5">{msg.senderName}</span>
                    <div className={`p-3 rounded-2xl ${
                      msg.senderName === user?.name 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleChatSend} className="flex gap-2 border-t border-slate-100 pt-3">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Account Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-left space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
              P
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-400">Pastor | Gitwe District Care Level</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="font-semibold text-slate-500">Email:</span>
              <span className="text-slate-800 font-medium">{user?.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="font-semibold text-slate-500">District ID:</span>
              <span className="text-slate-800 font-medium truncate max-w-[200px]">{user?.districtId || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Recommendation Form */}
      {showRecForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Recommend Elder</h3>
              <button onClick={() => setShowRecForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleRecommend} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Program Course</label>
                <select
                  required
                  value={recForm.courseName}
                  onChange={(e) => setRecForm({ ...recForm, courseName: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">-- Select Program --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Elder</label>
                <select
                  required
                  value={recForm.elderId}
                  onChange={(e) => setRecForm({ ...recForm, elderId: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">-- Select Elder --</option>
                  {elders.map(el => (
                    <option key={el.id} value={el.id}>{el.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Pastor Recommendation Notes</label>
                <textarea
                  value={recForm.notes}
                  onChange={(e) => setRecForm({ ...recForm, notes: e.target.value })}
                  placeholder="Notes about suitability, completed preparatory studies..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Recommendation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Availability Form */}
      {showAvailForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Log Availability Slot</h3>
              <button onClick={() => setShowAvailForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleAvailSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Date</label>
                <input
                  type="datetime-local"
                  required
                  value={availForm.date}
                  onChange={(e) => setAvailForm({ ...availForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <select
                  value={availForm.status}
                  onChange={(e) => setAvailForm({ ...availForm, status: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BUSY">BUSY</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Availability notes</label>
                <input
                  type="text"
                  value={availForm.notes}
                  onChange={(e) => setAvailForm({ ...availForm, notes: e.target.value })}
                  placeholder="Prepare reviews materials"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Submitting...' : 'Log Availability'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastorDashboard;
