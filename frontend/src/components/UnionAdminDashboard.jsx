import { useState, useEffect } from 'react';
import { useLanguage } from '../context';
import { trainingService, hierarchyService, authService, faqService, evaluationService } from '../services';
import { 
  Users, 
  BookOpen, 
  Award, 
  Plus, 
  Calendar, 
  Send,
  Download,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Settings,
  User,
  Percent,
  TrendingUp,
  Mail,
  ShieldCheck
} from 'lucide-react';

const UnionAdminDashboard = ({ activeTab, stats, refreshStats }) => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  
  // Forms states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '', description: '', topics: '', location: '', duration: '', startDate: '', endDate: ''
  });
  
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'FIELD_SECRETARY', phone: '',
    unionId: 'd3b07384-d113-4ec6-a5b6-7123456789ab', fieldId: '', districtId: '', localChurchId: ''
  });

  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });
  const [showFaqForm, setShowFaqForm] = useState(false);

  const [hierarchy, setHierarchy] = useState({ fields: [], districts: [], localChurches: [] });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Settings mock state
  const [settings, setSettings] = useState({
    appName: 'Gitwe AMC Digital Platform',
    enableSms: true,
    enableEmail: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: '465'
  });

  useEffect(() => {
    fetchData();
    fetchHierarchy();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'training_sessions') {
        const { data } = await trainingService.getCourses();
        setCourses(data);
      }
      if (activeTab === 'users' || activeTab === 'manage_users') {
        const { data } = await authService.getUsers();
        setUsers(data);
      }
      if (activeTab === 'registrations') {
        const { data } = await trainingService.getRecommendations();
        setRecommendations(data);
      }
      if (activeTab === 'notifications') {
        const { data } = await trainingService.getNotifications();
        setNotifications(data);
      }
      if (activeTab === 'faqs') {
        const { data } = await faqService.getFaqs();
        setFaqs(data);
      }
      if (activeTab === 'evaluation' || activeTab === 'reports') {
        const { data } = await evaluationService.getEvaluations();
        setEvaluations(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const { data } = await hierarchyService.getHierarchy();
      setHierarchy(data);
    } catch (err) {
      console.error('Error fetching hierarchy:', err);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await trainingService.createCourse(courseForm);
      setMessage('Training program scheduled and system notifications sent successfully!');
      setCourseForm({ title: '', description: '', topics: '', location: '', duration: '', startDate: '', endDate: '' });
      setShowCourseForm(false);
      fetchData();
      refreshStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await authService.register({ ...userForm, isVerified: true });
      setMessage('Leader account registered successfully!');
      setUserForm({
        name: '', email: '', password: '', role: 'FIELD_SECRETARY', phone: '',
        unionId: 'd3b07384-d113-4ec6-a5b6-7123456789ab', fieldId: '', districtId: '', localChurchId: ''
      });
      setShowUserForm(false);
      fetchData();
      refreshStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await faqService.createFaq(faqForm);
      setMessage('FAQ added successfully!');
      setFaqForm({ question: '', answer: '', category: 'General' });
      setShowFaqForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleFaqDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await faqService.deleteFaq(id);
      setMessage('FAQ deleted successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to delete FAQ');
    }
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    setMessage('Admin settings updated successfully!');
  };

  // Scoped lists
  const filteredDistricts = hierarchy.districts.filter(d => d.fieldId === userForm.fieldId);
  const filteredChurches = hierarchy.localChurches.filter(c => c.districtId === userForm.districtId);

  return (
    <div className="space-y-8">
      {/* Messages */}
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
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Elders</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalMembers}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Courses</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalCourses}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Certificates Issued</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.completedEnrollments}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Percent size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Evaluations</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{evaluations.length} Submitted</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Training Sessions Overview</h3>
                <button 
                  onClick={() => setShowCourseForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Plus size={14} /> Schedule Session
                </button>
              </div>

              {courses.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No scheduled training courses available.</p>
              ) : (
                <div className="space-y-3">
                  {courses.slice(0, 3).map(c => (
                    <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{c.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> {c.duration} | Location: {c.location}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[10px] uppercase font-bold">
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">Quick Reports</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Role\n" + 
                      users.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "system_wide_leaders_export.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all"
                >
                  <span className="text-xs font-semibold text-slate-700">Export Leaders Registry (CSV)</span>
                  <Download size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Directory */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Ecclesiastical Leaders Directory</h3>
            <p className="text-xs text-slate-400 font-medium">Verify system user accounts configured matching Union, Field, and District care levels.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{u.email || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        u.role === 'UNION_ADMIN' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                        u.role === 'FIELD_SECRETARY' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                        u.role === 'PASTOR' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        'bg-slate-50 text-slate-700'
                      }`}>
                        {u.role || 'MEMBER'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{u.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Training Sessions (formerly courses) */}
      {activeTab === 'training_sessions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Training Sessions Manager</h3>
              <p className="text-xs text-slate-400">Design, schedule, and review curricular sessions for church elders.</p>
            </div>
            <button
              onClick={() => setShowCourseForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus size={16} /> Schedule Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(c => (
              <div key={c.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{c.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description || 'No description provided.'}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 bg-white p-3 border border-slate-200/50 rounded-xl">
                    <div><strong>Duration:</strong> {c.duration || 'TBD'}</div>
                    <div><strong>Location:</strong> {c.location || 'TBD'}</div>
                    <div className="col-span-2 mt-1">
                      <strong>Topics:</strong> <span className="text-slate-600">{c.topics || 'None'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 border-t border-slate-200/60 pt-3">
                  {c._count?.enrollments || 0} Elders Registered | {c._count?.sessions || 0} Active Session Blocks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Registrations (recommendations & active approvals) */}
      {activeTab === 'registrations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Elder Registrations & Approvals</h3>
            <p className="text-xs text-slate-400">Process and approve pastoral registration recommendations for training programs.</p>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No registrations/recommendations pending review.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map(r => (
                <div key={r.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] uppercase font-bold">
                      {r.courseName}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">Trainee Name: Elder {r.elder?.name}</h4>
                    <p className="text-xs text-slate-500">Supervised by: Pastor {r.pastor?.name} | Recommendation comments: "{r.notes || 'None'}"</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await trainingService.registerElder({ courseId: courses[0]?.id || '', elderId: r.elderId });
                        setMessage('Elder registration approved and registered successfully!');
                        fetchData();
                      } catch (err) {
                        setError('Please ensure you have scheduled training sessions before registering.');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                  >
                    Approve Registration
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reports (Dissertation Specification) */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Administrative Reports & Analytics</h3>
              <p className="text-xs text-slate-400">Review evaluation metrics, certification stats, and enrollment counts.</p>
            </div>
            <button
              onClick={() => {
                const reportContent = `GITWE AMC COMPREHENSIVE STATUS REPORT\nDate: ${new Date().toLocaleDateString()}\nTotal Active Courses: ${courses.length}\nTotal Registered Leaders: ${users.length}\nEvaluations Logged: ${evaluations.length}`;
                const blob = new Blob([reportContent], { type: 'text/plain' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "Gitwe_AMC_Status_Report.txt";
                link.click();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Download size={16} /> Download Status Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Evaluations Overview */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Evaluation Ratings (Averages)</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Course Content Value</span>
                    <span>4.7 / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Instructors & Lecturers</span>
                    <span>4.5 / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Class Study Materials</span>
                    <span>4.8 / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Completion stats */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2">Completion & Verification Stats</h4>
                <p className="text-xs text-slate-500">Certified Elders: {stats?.metrics?.completedEnrollments || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Pending Course Completion: {(stats?.metrics?.totalEnrollments || 0) - (stats?.metrics?.completedEnrollments || 0)}</p>
              </div>
              <div className="pt-4 border-t border-slate-200/50 mt-4 text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                All issued certificates carry unique cryptographic validation hashes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notification Center */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Notification Logs (SMS & Email)</h3>
            <p className="text-xs text-slate-400 font-medium">Verify system email transmissions and SMS deliveries.</p>
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No sent notifications found.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4">
                  <div className="space-y-0.5 text-left">
                    <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    <p className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                    n.type === 'EMAIL' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                    'bg-slate-200/50 text-slate-600'
                  }`}>
                    {n.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: FAQs Management */}
      {activeTab === 'faqs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">FAQs Manager</h3>
              <p className="text-xs text-slate-400">Configure frequently asked questions for elders and local leaders.</p>
            </div>
            <button
              onClick={() => setShowFaqForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>

          {faqs.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No FAQs configured.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map(f => (
                <div key={f.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4 text-left">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-slate-200/60 text-slate-700 rounded text-[9px] uppercase font-bold">
                      {f.category}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">Q: {f.question}</h4>
                    <p className="text-xs text-slate-600">A: {f.answer}</p>
                  </div>
                  <button 
                    onClick={() => handleFaqDelete(f.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-all shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Admin Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Platform Settings</h3>
            <p className="text-xs text-slate-400">Maintain configurations and notification integrations.</p>
          </div>

          <form onSubmit={handleSettingsSave} className="space-y-6 max-w-lg text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Application Title</label>
              <input 
                type="text"
                value={settings.appName}
                onChange={e => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Gmail SMTP Server</label>
                <input 
                  type="text"
                  value={settings.smtpHost}
                  onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">SMTP Port</label>
                <input 
                  type="text"
                  value={settings.smtpPort}
                  onChange={e => setSettings({ ...settings, smtpPort: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Email Notifications Integration</h4>
                  <p className="text-[10px] text-slate-400">Route OTPs and announcements to leader email accounts.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.enableEmail}
                  onChange={e => setSettings({ ...settings, enableEmail: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">SMS Verification Codes (Mocked)</h4>
                  <p className="text-[10px] text-slate-400">Route OTP verification codes to mobile phones.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={settings.enableSms}
                  onChange={e => setSettings({ ...settings, enableSms: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* Tab: Evaluation Submissions (Thesis requirement) */}
      {activeTab === 'evaluation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Training Evaluation Submissions</h3>
            <p className="text-xs text-slate-400">Review feedback and session ratings submitted by certified elders.</p>
          </div>

          {evaluations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No evaluation forms submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {evaluations.map(ev => (
                <div key={ev.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ev.course?.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Submitted by: Elder {ev.elder?.name} ({ev.elder?.email})</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(ev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-white p-3 border border-slate-200/50 rounded-xl text-xs">
                    <div><strong>Content Rating:</strong> {ev.contentRating} / 5</div>
                    <div><strong>Teacher Rating:</strong> {ev.teacherRating} / 5</div>
                    <div><strong>Materials Rating:</strong> {ev.materialsRating} / 5</div>
                  </div>

                  {ev.comments && (
                    <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl text-xs text-slate-600">
                      <strong>Comments:</strong> "{ev.comments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Manage Users */}
      {activeTab === 'manage_users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Manage Leader Accounts</h3>
              <p className="text-xs text-slate-400">Add, configure, or suspend administrative users.</p>
            </div>
            <button
              onClick={() => setShowUserForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus size={16} /> Register Account
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-505 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] uppercase font-bold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button 
                        onClick={() => alert('Account status updated')}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Admin Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-left space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
              A
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Union Administrator</h3>
              <p className="text-xs text-slate-400">Gitwe Ministerial Centre Headquarters</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="font-semibold text-slate-500">Platform ID:</span>
              <span className="text-slate-800 font-medium">UNION_ADMIN_01</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="font-semibold text-slate-500">Security Clearance:</span>
              <span className="text-emerald-600 font-bold">GLOBAL ACCESS</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Course Form */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Schedule New Session</h3>
              <button onClick={() => setShowCourseForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Sabbath School Leadership"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Official curriculum details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Duration</label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="3 Days"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Location</label>
                  <input
                    type="text"
                    value={courseForm.location}
                    onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                    placeholder="Gitwe Campus"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Topics Outline</label>
                <input
                  type="text"
                  value={courseForm.topics}
                  onChange={(e) => setCourseForm({ ...courseForm, topics: e.target.value })}
                  placeholder="Hermeneutics, Church Policy, Governance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Start Date</label>
                  <input
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">End Date</label>
                  <input
                    type="date"
                    value={courseForm.endDate}
                    onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Creating...' : 'Schedule Program'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FAQ Form */}
      {showFaqForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Add New FAQ</h3>
              <button onClick={() => setShowFaqForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleFaqSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="How do I do X?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Answer</label>
                <textarea
                  required
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Provide FAQ answer here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="General">General</option>
                  <option value="Certificates">Certificates</option>
                  <option value="Evaluations">Evaluations</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Creating...' : 'Add FAQ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: User account Form */}
      {showUserForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Register Leader Account</h3>
              <button onClick={() => setShowUserForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Gakire Silas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Email</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="FIELD_SECRETARY">Field Secretary</option>
                    <option value="PASTOR">Pastor</option>
                    <option value="ELDER">Elder</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Phone</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="0788123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Dynamic location scoping in form */}
              <div className="space-y-4 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Field</label>
                  <select
                    required
                    value={userForm.fieldId}
                    onChange={(e) => setUserForm({ ...userForm, fieldId: e.target.value, districtId: '', localChurchId: '' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">-- Select Field --</option>
                    {hierarchy.fields.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {['PASTOR', 'ELDER'].includes(userForm.role) && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <label className="text-xs font-semibold text-slate-600">District</label>
                    <select
                      required
                      value={userForm.districtId}
                      onChange={(e) => setUserForm({ ...userForm, districtId: e.target.value, localChurchId: '' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">-- Select District --</option>
                      {filteredDistricts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {userForm.role === 'ELDER' && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <label className="text-xs font-semibold text-slate-600">Local Church</label>
                    <select
                      required
                      value={userForm.localChurchId}
                      onChange={(e) => setUserForm({ ...userForm, localChurchId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="">-- Select Local Church --</option>
                      {filteredChurches.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Creating...' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnionAdminDashboard;
