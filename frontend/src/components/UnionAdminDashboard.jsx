import { useState, useEffect } from 'react';
import { useLanguage } from '../context';
import { trainingService, memberService, hierarchyService, authService } from '../services';
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
  Trash2
} from 'lucide-react';

const UnionAdminDashboard = ({ activeTab, stats, refreshStats }) => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
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

  const [hierarchy, setHierarchy] = useState({ fields: [], districts: [], localChurches: [] });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    fetchHierarchy();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'courses') {
        const { data } = await trainingService.getCourses();
        setCourses(data);
      }
      if (activeTab === 'users') {
        // We will fetch list of users
        const { data } = await authService.getUsers();
        setUsers(data);
      }
      if (activeTab === 'recommendations') {
        const { data } = await trainingService.getRecommendations();
        setRecommendations(data);
      }
      if (activeTab === 'notifications') {
        const { data } = await trainingService.getNotifications();
        setNotifications(data);
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
      setMessage('User account created successfully!');
      setUserForm({
        name: '', email: '', password: '', role: 'FIELD_SECRETARY', phone: '',
        unionId: 'd3b07384-d113-4ec6-a5b6-7123456789ab', fieldId: '', districtId: '', localChurchId: ''
      });
      setShowUserForm(false);
      fetchData();
      refreshStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t('totalElders')}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalMembers}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t('activeCourses')}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalCourses}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t('statsOverview')}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {stats.metrics.completedEnrollments} / {stats.metrics.totalEnrollments}
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{t('courses')}</h3>
                <button 
                  onClick={() => setShowCourseForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <Plus size={14} /> {t('scheduleCourse')}
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
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-full text-[10px] uppercase font-bold">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Actions panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800">{t('actions')}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Role,Church\n" + 
                      users.map(u => `"${u.id}","${u.firstName || u.name}","${u.email}","${u.role || 'Member'}","Gitwe Local Church"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "system_wide_records_export.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all"
                >
                  <span className="text-xs font-semibold text-slate-700">{t('exportData')}</span>
                  <Download size={16} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">System Users Directory</h3>
              <p className="text-xs text-slate-400">Manage church leaders and elder accounts across all levels.</p>
            </div>
            <button
              onClick={() => setShowUserForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10"
            >
              <Plus size={16} /> Add Leader Account
            </button>
          </div>

          {/* User list */}
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
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{u.firstName || u.name} {u.lastName}</td>
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

      {/* Tab: Courses Management */}
      {activeTab === 'courses' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Training Programs</h3>
              <p className="text-xs text-slate-400">Design, schedule, and manage curriculum materials for elders.</p>
            </div>
            <button
              onClick={() => setShowCourseForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Plus size={16} /> Schedule Program
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

                <div className="flex items-center gap-2 pt-2">
                  <div className="text-xs text-slate-400">
                    {c._count.enrollments} Registered Elders | {c._count.sessions} Class Sessions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Elder Recommendations</h3>
            <p className="text-xs text-slate-400">Pastoral recommendations for upcoming trainings.</p>
          </div>

          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No recommendations submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {recommendations.map(r => (
                <div key={r.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] uppercase font-bold">
                      {r.courseName}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">Recommend Elder: {r.elder?.name}</h4>
                    <p className="text-xs text-slate-500">Submitted by: Pastor {r.pastor?.name} | Notes: "{r.notes || 'None'}"</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await trainingService.registerElder({ courseId: courses[0]?.id || '', elderId: r.elderId });
                        setMessage('Elder successfully enrolled from recommendation!');
                        fetchData();
                      } catch (err) {
                        setError('Ensure you have courses created first before enrolling.');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shrink-0"
                  >
                    Enroll Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Notifications Log */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Notifications History</h3>
            <p className="text-xs text-slate-400 font-medium">Verify automated alert dispatches to church leadership.</p>
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

      {/* MODAL: Course Form */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Schedule New Course</h3>
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

      {/* MODAL: User account Form */}
      {showUserForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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
