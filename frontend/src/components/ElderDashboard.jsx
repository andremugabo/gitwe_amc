import { useState, useEffect } from 'react';
import { trainingService } from '../services';
import { 
  BookOpen, 
  Award, 
  Download, 
  CheckSquare,
  Edit
} from 'lucide-react';

const ElderDashboard = ({ activeTab, stats, refreshStats }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Selected certificate preview
  const [activeCert, setActiveCert] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (stats?.extraData?.enrollments) {
        setEnrollments(stats.extraData.enrollments);
      }
      if (stats?.extraData?.recentAttendance) {
        setAttendance(stats.extraData.recentAttendance);
      }

      // Materials loading
      const { data: coursesData } = await trainingService.getCourses();
      const allMaterials = [];
      coursesData.forEach(c => {
        // Mock materials lists if empty
        allMaterials.push({
          id: `mat-${c.id}`,
          title: `Study Material for ${c.title}`,
          fileType: 'PDF',
          courseTitle: c.title
        });
      });
      setMaterials(allMaterials);

      if (activeTab === 'notifications') {
        const { data: nots } = await trainingService.getNotifications();
        setNotifications(nots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const updatedUser = { ...userInfo, name: profileForm.name, phone: profileForm.phone };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setMessage('Profile details updated successfully!');
      setShowProfileForm(false);
      refreshStats();
    } catch (err) {
      setError('Failed to update profile');
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
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Enrolled Courses</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalEnrollments}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Trainings</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.completedEnrollments}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <CheckSquare size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attendance Rate</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.attendanceRate}%</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800">My Registered Courses</h3>
              
              {enrollments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-xl">No active registrations.</p>
              ) : (
                <div className="space-y-3">
                  {enrollments.map(enr => (
                    <div key={enr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-sm">
                      <div>
                        <h4 className="font-semibold text-slate-800">{enr.course.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">Location: {enr.course.location} | Duration: {enr.course.duration}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        enr.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
                      }`}>
                        {enr.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800">My Profile</h3>
                <button
                  onClick={() => {
                    const info = JSON.parse(localStorage.getItem('userInfo'));
                    setProfileForm({ name: info.name, phone: info.phone || '' });
                    setShowProfileForm(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit size={12} /> Edit
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div><strong>Local Church:</strong> Gitwe Local Church</div>
                <div><strong>Registration Scope:</strong> Elder / Trainee</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: E-learning Materials */}
      {activeTab === 'materials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">E-Learning Material Library</h3>
            <p className="text-xs text-slate-400">Access course lecture notes, reading files, and reference content.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.map(mat => (
              <div key={mat.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] uppercase font-bold">
                    {mat.courseTitle}
                  </span>
                  <h4 className="font-semibold text-slate-800 text-sm mt-1">{mat.title}</h4>
                  <p className="text-[10px] text-slate-400 uppercase mt-0.5">{mat.fileType} Document</p>
                </div>
                
                <button
                  onClick={() => {
                    // Simulated download action
                    setMessage(`Downloaded: ${mat.title}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shrink-0"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Certificates */}
      {activeTab === 'certificates' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Certificates</h3>
            <p className="text-xs text-slate-400">Download dynamic certificates verifying completed trainings.</p>
          </div>

          {enrollments.filter(e => e.status === 'COMPLETED').length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No completed courses yet.</p>
          ) : (
            <div className="space-y-4">
              {enrollments.filter(e => e.status === 'COMPLETED').map(enr => (
                <div key={enr.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{enr.course.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Certified Date: {new Date(enr.certifiedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setActiveCert(enr)}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    View Certificate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Notifications</h3>
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

      {/* MODAL: Profile form */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Edit Profile details</h3>
              <button onClick={() => setShowProfileForm(false)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Phone</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Certificate Preview with visual QR code */}
      {activeCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="church-gradient px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Certificate Viewer</h3>
              <button onClick={() => setActiveCert(null)} className="text-white hover:text-slate-200 font-bold text-sm">✕</button>
            </div>
            
            <div className="p-8 space-y-8 flex flex-col items-center">
              {/* Premium Certificate Graphic */}
              <div className="w-full border-8 border-double border-amber-400 p-6 bg-slate-50 text-center space-y-4 rounded-xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-400"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-400"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-400"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-400"></div>

                <h3 className="font-serif text-lg font-bold text-slate-800 uppercase tracking-widest">Gitwe Ministerial Centre</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Seventh-day Adventist Church</p>
                
                <div className="py-2">
                  <p className="text-[10px] text-slate-500 italic">This certifies that Elder</p>
                  <h4 className="text-lg font-bold text-blue-900 uppercase font-serif mt-1">{stats?.extraData?.enrollments[0]?.elder?.name || ' Silase'}</h4>
                </div>

                <div className="py-1">
                  <p className="text-[10px] text-slate-500">has successfully completed the training course</p>
                  <h5 className="text-sm font-bold text-slate-800 mt-1">"{activeCert.course.title}"</h5>
                </div>

                <p className="text-[9px] text-slate-400 max-w-xs mx-auto">
                  Presented upon the authority of the Gitwe Conference Training Committee.
                </p>

                {/* QR Code and verification tag */}
                <div className="pt-4 flex flex-col items-center gap-1">
                  {/* Mock QR Code representation */}
                  <div className="w-16 h-16 bg-white border border-slate-300 p-1 flex flex-col gap-0.5 justify-center items-center">
                    <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 7 === 0 ? 'bg-slate-900' : 'bg-white'}`}></div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-400 font-mono select-all">Code: {activeCert.certificateQrCode || 'VERIFY-123'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
              >
                <Download size={14} /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderDashboard;
