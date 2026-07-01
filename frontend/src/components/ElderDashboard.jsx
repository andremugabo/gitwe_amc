import { useState, useEffect } from 'react';
import { trainingService, evaluationService } from '../services';
import { 
  BookOpen, 
  Award, 
  Download, 
  AlertCircle,
  CheckCircle2,
  Share2,
  Percent,
  Copy,
  Check,
  Bell
} from 'lucide-react';

const ElderDashboard = ({ activeTab, stats, refreshStats }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Selected certificate preview
  const [activeCert, setActiveCert] = useState(null);

  // Evaluation form state
  const [evalForm, setEvalForm] = useState({
    courseId: '',
    contentRating: 5,
    teacherRating: 5,
    materialsRating: 5,
    comments: ''
  });

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
      const { data: materialsData } = await trainingService.getMaterials();
      setMaterials(materialsData.map(m => ({
        id: m.id,
        title: m.title,
        fileType: m.fileType,
        fileUrl: m.fileUrl,
        courseTitle: m.course?.title || 'Unknown Course'
      })));

      if (activeTab === 'notifications') {
        const { data: nots } = await trainingService.getNotifications();
        setNotifications(nots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!evalForm.courseId) {
      setError('Please select a course to evaluate.');
      setLoading(false);
      return;
    }

    try {
      await evaluationService.submitEvaluation(evalForm);
      setMessage('Thank you! Your training evaluation feedback has been submitted successfully.');
      setEvalForm({ courseId: '', contentRating: 5, teacherRating: 5, materialsRating: 5, comments: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (code) => {
    const shareUrl = `${window.location.origin}/verify-certificate?code=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">My Courses</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.totalEnrollments} Registered</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Trainings</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.metrics.completedEnrollments} Verified</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <CheckSquare size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Attendance</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{attendance.length} Sessions Logged</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Active Enrolled Courses</h3>
              {enrollments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">You are not registered in any upcoming training programs.</p>
              ) : (
                <div className="space-y-3">
                  {enrollments.map(e => (
                    <div key={e.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-left">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{e.course.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">Status: {e.status}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        e.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Materials */}
      {activeTab === 'materials' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">E-Learning Curricular Materials</h3>
            <p className="text-xs text-slate-400">Download syllabus documents, lecture notes, and training guides.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materials.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl w-full col-span-2">No learning materials have been uploaded for your enrolled courses yet.</p>
            ) : (
              materials.map(mat => (
                <div key={mat.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center gap-4 animate-in fade-in duration-300">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{mat.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Program: {mat.courseTitle}</p>
                  </div>
                  
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shrink-0 animate-in fade-in"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: My Certificate */}
      {activeTab === 'certificates' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Secure Certificates</h3>
            <p className="text-xs text-slate-400">Review, print, or share your digital completion awards.</p>
          </div>

          {enrollments.filter(e => e.status === 'COMPLETED').length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No completed training programs found.</p>
          ) : (
            <div className="space-y-4">
              {enrollments.filter(e => e.status === 'COMPLETED').map(enr => (
                <div key={enr.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{enr.course.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Issued Date: {new Date(enr.certifiedAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setActiveCert(enr)}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
                  >
                    View & Share Certificate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Evaluation Form (Dissertation requirement) */}
      {activeTab === 'evaluation' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left max-w-lg">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Training Evaluation Form</h3>
            <p className="text-xs text-slate-400">Submit feedback about course content, timing, and instructor quality.</p>
          </div>

          <form onSubmit={handleEvalSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Select Enrolled Program</label>
              <select
                required
                value={evalForm.courseId}
                onChange={e => setEvalForm({ ...evalForm, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="">-- Choose Program --</option>
                {enrollments.map(enr => (
                  <option key={enr.course.id} value={enr.course.id}>{enr.course.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Course Content Value</span>
                <input 
                  type="range" min="1" max="5" 
                  value={evalForm.contentRating}
                  onChange={e => setEvalForm({ ...evalForm, contentRating: e.target.value })}
                  className="w-32 accent-blue-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Instructor Quality</span>
                <input 
                  type="range" min="1" max="5" 
                  value={evalForm.teacherRating}
                  onChange={e => setEvalForm({ ...evalForm, teacherRating: e.target.value })}
                  className="w-32 accent-blue-600"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">Study Materials Usability</span>
                <input 
                  type="range" min="1" max="5" 
                  value={evalForm.materialsRating}
                  onChange={e => setEvalForm({ ...evalForm, materialsRating: e.target.value })}
                  className="w-32 accent-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">Feedback Comments</label>
              <textarea 
                value={evalForm.comments}
                onChange={e => setEvalForm({ ...evalForm, comments: e.target.value })}
                placeholder="What did you like? What can be improved?"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              {loading ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Notifications log */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">My Notification Logs</h3>
            <p className="text-xs text-slate-400 font-medium">Verify system alerts and course notices dispatched to you.</p>
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
                  <h4 className="text-lg font-bold text-blue-900 uppercase font-serif mt-1">{stats?.extraData?.enrollments[0]?.elder?.name || 'Elder'}</h4>
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

              {/* Share & Download Actions */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => handleCopyLink(activeCert.certificateQrCode)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                >
                  {copied ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copied ? 'Copied Link!' : 'Share Certificate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderDashboard;
