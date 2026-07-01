import { useState, useEffect } from 'react';
import { useLanguage, useAuth } from '../context';
import { toast } from '../utils/toast';
import { generateEldersReportPDF, generateEnrollmentReportPDF } from '../utils/pdfReports';
import { trainingService, memberService, authService } from '../services';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Calendar, 
  UserPlus, 
  Plus, 
  Check, 
  Download,
  FileText,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';

const FieldSecretaryDashboard = ({ activeTab, stats, refreshStats }) => {
  const { user } = useAuth();
  const [elders, setElders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Forms
  const [registerForm, setRegisterForm] = useState({
    courseId: '',
    elderId: ''
  });
  
  const [sessionForm, setSessionForm] = useState({
    date: '',
    topic: ''
  });
  const [showSessionForm, setShowSessionForm] = useState(false);

  const [loading, setLoading] = useState(false);

  // Selected session for attendance
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceSheet, setAttendanceSheet] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard' || activeTab === 'registrations' || activeTab === 'users') {
        const { data } = await authService.getUsers({ role: 'ELDER' });
        setElders(data);
      }

      if (activeTab === 'users') {
        // Load all scoped users (Elders + Pastors) for user management
        const [elderRes, pastorRes] = await Promise.all([
          authService.getUsers({ role: 'ELDER' }),
          authService.getUsers({ role: 'PASTOR' }),
        ]);
        setAllUsers([...elderRes.data, ...pastorRes.data]);
      }
      
      const { data: coursesData } = await trainingService.getCourses();
      setCourses(coursesData);

      if (activeTab === 'notifications') {
        const { data } = await trainingService.getNotifications();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await trainingService.registerElder(registerForm);
      toast.success('Elder registered for course successfully!');
      setRegisterForm({ courseId: '', elderId: '' });
      setShowRegisterForm(false);
      fetchData();
      refreshStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await trainingService.createSession(activeCourse.id, sessionForm);
      toast.success('Class session created!');
      setSessionForm({ date: '', topic: '' });
      setShowSessionForm(false);
      
      // Refresh course view
      const { data } = await trainingService.getCourseById(activeCourse.id);
      setActiveCourse(data);
      setSessions(data.sessions);
    } catch (err) {
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseDetails = async (courseId) => {
    try {
      const { data } = await trainingService.getCourseById(courseId);
      setActiveCourse(data);
      setSessions(data.sessions);
      setSelectedSession(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startAttendance = (session) => {
    setSelectedSession(session);
    // Pre-populate sheet based on enrollment list
    const sheet = activeCourse.enrollments.map(enr => {
      const existing = session.attendance?.find(a => a.elderId === enr.elderId);
      return {
        elderId: enr.elderId,
        name: enr.elder.name,
        isPresent: existing ? existing.isPresent : true
      };
    });
    setAttendanceSheet(sheet);
  };

  const handleToggleAttendance = (elderId) => {
    setAttendanceSheet(prev => 
      prev.map(item => item.elderId === elderId ? { ...item, isPresent: !item.isPresent } : item)
    );
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await authService.updateUser(userId, { isActive: !currentStatus });
      toast.success(`User ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      await trainingService.markAttendance(selectedSession.id, {
        attendance: attendanceSheet.map(item => ({ elderId: item.elderId, isPresent: item.isPresent }))
      });
      toast.success('Attendance sheet updated successfully!');
      loadCourseDetails(activeCourse.id);
    } catch (err) {
      toast.error('Failed to save attendance');
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
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Field Elders</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalElders}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Trainings</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalCourses}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <FileCheck size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Field Completions</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {stats.metrics.completedEnrollments} / {stats.metrics.totalEnrollments}
                </h3>
              </div>
            </div>
          </div>

          {/* Scoped Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Field Registration Actions</h3>
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  <UserPlus size={14} /> Register Elder
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
              <h3 className="font-bold text-slate-800">Reports Export</h3>
              <button
                onClick={() => generateEldersReportPDF(elders)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-left text-xs font-semibold text-slate-700 transition-all group"
              >
                <span className="flex items-center gap-2 group-hover:text-blue-700">
                  <FileText size={14} className="text-blue-600" />
                  Export Elders List (PDF)
                </span>
                <Download size={14} className="text-slate-400 group-hover:text-blue-600" />
              </button>
              <button
                onClick={() => generateEnrollmentReportPDF(courses)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left text-xs font-semibold text-slate-700 transition-all group"
              >
                <span className="flex items-center gap-2 group-hover:text-emerald-700">
                  <FileText size={14} className="text-emerald-600" />
                  Export Enrollment Report (PDF)
                </span>
                <Download size={14} className="text-slate-400 group-hover:text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Enrollments / Registrations */}
      {activeTab === 'registrations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Elder Enrollments Panel</h3>
              <p className="text-xs text-slate-400">Register field-scoped elders to available training programs.</p>
            </div>
            <button
              onClick={() => setShowRegisterForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <UserPlus size={16} /> Register Elder
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {elders.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{e.name || e.firstName}</td>
                    <td className="py-3 px-4 text-slate-500">{e.email || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-500">{e.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-xs font-semibold">
                        Registered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Scoped Courses (Mark Attendance) */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800">Select Training Program</h3>
            <div className="space-y-2">
              {courses.map(c => (
                <button
                  key={c.id}
                  onClick={() => loadCourseDetails(c.id)}
                  className={`w-full text-left p-4 border rounded-xl transition-all ${
                    activeCourse?.id === c.id 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <h4 className="font-semibold text-slate-800 text-sm">{c.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{c.duration}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {activeCourse ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{activeCourse.title}</h3>
                    <p className="text-xs text-slate-400">Mark session attendance for registered elders.</p>
                  </div>
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                  >
                    <Plus size={14} /> Add Class Session
                  </button>
                </div>

                {/* Class sessions list */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wide">Sessions Attendance Sheet</h4>
                  
                  {sessions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">No class sessions created yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessions.map(s => (
                        <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(s.date).toLocaleDateString()}</span>
                            <h5 className="font-semibold text-slate-800 text-sm mt-0.5">{s.topic || 'General Lecture'}</h5>
                          </div>
                          <button
                            onClick={() => startAttendance(s)}
                            className="w-full text-center py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all"
                          >
                            Mark Attendance
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Session Attendance Overlay Panel */}
                {selectedSession && (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Attendance List - {selectedSession.topic || 'General Lecture'}</h4>
                        <p className="text-[11px] text-slate-400">Click checkboxes to mark presence.</p>
                      </div>
                      <button
                        onClick={saveAttendance}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md transition-all"
                      >
                        Save Sheet
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {attendanceSheet.map(item => (
                        <div key={item.elderId} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/50 rounded-lg text-xs">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <button
                            onClick={() => handleToggleAttendance(item.elderId)}
                            className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                              item.isPresent 
                                ? 'bg-emerald-600 border-emerald-700 text-white' 
                                : 'border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {item.isPresent && <Check size={14} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                Select a course from the left to manage attendance sessions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">User Management</h3>
              <p className="text-xs text-slate-400">Manage elders and pastors within your field scope.</p>
            </div>
            <button
              onClick={() => generateEldersReportPDF(allUsers)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>

          {allUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No users found in your field scope.</p>
              <p className="text-xs mt-1">Elders and Pastors assigned to your field will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{u.name}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          u.role === 'ELDER'
                            ? 'bg-blue-50 text-blue-800 border-blue-100'
                            : 'bg-purple-50 text-purple-800 border-purple-100'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{u.phone || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                          title={u.isActive ? 'Disable user' : 'Enable user'}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            u.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                          }`}
                        >
                          {u.isActive
                            ? <><ShieldOff size={12} /> Disable</>
                            : <><ShieldCheck size={12} /> Enable</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Notifications Log */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Notifications Log</h3>
            <p className="text-xs text-slate-400 font-medium">Verify system alerts and course scheduling notices.</p>
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

      {/* MODAL: Register Elder to Course */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Register Elder for Training</h3>
              <button onClick={() => setShowRegisterForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Training Program</label>
                <select
                  required
                  value={registerForm.courseId}
                  onChange={(e) => setRegisterForm({ ...registerForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Church Elder</label>
                <select
                  required
                  value={registerForm.elderId}
                  onChange={(e) => setRegisterForm({ ...registerForm, elderId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">-- Select Elder --</option>
                  {elders.map(el => (
                    <option key={el.id} value={el.id}>{el.name || el.firstName}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? 'Processing...' : 'Register Elder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Class Session */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Add Class Session</h3>
              <button onClick={() => setShowSessionForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Lecture Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  placeholder="Sabbath Stewardship Models"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Lecture Date</label>
                <input
                  type="date"
                  required
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSecretaryDashboard;
