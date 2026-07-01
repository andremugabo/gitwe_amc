import { useState, useEffect } from 'react';
import { useAuth } from '../context';
import { trainerService } from '../services';
import { 
  Users, 
  BookOpen, 
  Award, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  ClipboardList,
  FileText,
  Plus,
  Percent,
  Check,
  X,
  GraduationCap
} from 'lucide-react';

const TrainerDashboard = ({ activeTab, stats, refreshStats }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [trainees, setTrainees] = useState([]);
  
  // Attendance state
  const [attendanceSessionId, setAttendanceSessionId] = useState('session-1');
  const [attendanceMap, setAttendanceMap] = useState({}); // { elderId: "PRESENT"/"ABSENT" }
  
  // Test builder state
  const [testForm, setTestForm] = useState({ title: '', questions: '', courseId: '' });
  const [testResults, setTestResults] = useState([]);
  
  // Evaluation state
  const [evaluations, setEvaluations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCourseId]);

  const fetchData = async () => {
    try {
      const { data: coursesData } = await trainerService.getCourses();
      setCourses(coursesData);
      
      if (coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0].id);
      }

      if (selectedCourseId) {
        const { data: traineesData } = await trainerService.getTrainees(selectedCourseId);
        setTrainees(traineesData);
        
        // Initialize attendance map
        const initialMap = {};
        traineesData.forEach(t => {
          initialMap[t.id] = 'PRESENT';
        });
        setAttendanceMap(initialMap);
      }

      if (activeTab === 'prepare_tests') {
        const { data: resultsData } = await trainerService.getTestResults();
        setTestResults(resultsData);
      }

      if (activeTab === 'evaluations') {
        const { data: evalsData } = await trainerService.getEvaluations();
        setEvaluations(evalsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const records = Object.keys(attendanceMap).map(elderId => ({
      elderId,
      status: attendanceMap[elderId]
    }));

    try {
      await trainerService.markAttendance({
        courseId: selectedCourseId,
        sessionId: attendanceSessionId,
        attendanceRecords: records
      });
      setMessage('Attendance logs marked and saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await trainerService.createTest(testForm);
      setMessage('Test paper prepared and registered successfully!');
      setTestForm({ title: '', questions: '', courseId: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register test.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = (elderId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [elderId]: status
    }));
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
      {activeTab === 'dashboard' && (
        <div className="space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Assigned Courses</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{courses.length} Active</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Trainees</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{trainees.length} Enrolled</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Percent size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Course Feedbacks</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{evaluations.length} Submitted</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800">My Assigned Courses</h3>
            {courses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">You have no course assignments allocated.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.slice(0, 2).map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-semibold text-slate-800 text-sm">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{c.duration} | Location: {c.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Assigned Courses */}
      {activeTab === 'trainer_courses' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Assigned Courses</h3>
            <p className="text-xs text-slate-400">Review training schedules and course topics allocated to you.</p>
          </div>

          {courses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No course allocations scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(c => (
                <div key={c.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{c.description || 'No description provided.'}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 bg-white p-3 border border-slate-200/50 rounded-xl">
                      <div><strong>Duration:</strong> {c.duration || 'TBD'}</div>
                      <div><strong>Location:</strong> {c.location || 'TBD'}</div>
                      <div className="col-span-2 mt-1">
                        <strong>Topics:</strong> <span className="text-slate-600">{c.topics || 'None'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {c._count?.enrollments || 0} Registered Trainees | {c._count?.tests || 0} Prepared Quizzes
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Attendance Logger */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Trainee Attendance Logger</h3>
              <p className="text-xs text-slate-400">Log daily session attendance status for course trainees.</p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <select
                value={attendanceSessionId}
                onChange={e => setAttendanceSessionId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="session-1">Lecture block 1</option>
                <option value="session-2">Lecture block 2</option>
                <option value="session-3">Lecture block 3</option>
              </select>
            </div>
          </div>

          {trainees.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No trainees enrolled in this course.</p>
          ) : (
            <form onSubmit={handleAttendanceSubmit} className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Trainee Name</th>
                      <th className="py-2.5 px-3 text-center">Mark Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {trainees.map(t => (
                      <tr key={t.id}>
                        <td className="py-3 px-3 font-semibold text-slate-800">{t.name}</td>
                        <td className="py-3 px-3">
                          <div className="flex justify-center gap-4">
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(t.id, 'PRESENT')}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                attendanceMap[t.id] === 'PRESENT' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                                  : 'bg-slate-100 text-slate-400 border border-transparent'
                              }`}
                            >
                              <Check size={14} /> Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAttendance(t.id, 'ABSENT')}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                attendanceMap[t.id] === 'ABSENT' 
                                  ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm' 
                                  : 'bg-slate-100 text-slate-400 border border-transparent'
                              }`}
                            >
                              <X size={14} /> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                {loading ? 'Saving logs...' : 'Save Session Attendance'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab: Prepare Tests */}
      {activeTab === 'prepare_tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Test Creator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Prepare Test</h3>
              <p className="text-xs text-slate-400">Design training review papers and quiz questions.</p>
            </div>

            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Choose Course</label>
                <select
                  required
                  value={testForm.courseId}
                  onChange={e => setTestForm({ ...testForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Test Title</label>
                <input
                  type="text"
                  required
                  value={testForm.title}
                  onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="Midterm Assessment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Questions Outline</label>
                <textarea
                  required
                  value={testForm.questions}
                  onChange={e => setTestForm({ ...testForm, questions: e.target.value })}
                  placeholder="1. Define Hermeneutics...\n2. What is the scope of pastoral care?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm h-32 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                {loading ? 'Submitting...' : 'Register Test Paper'}
              </button>
            </form>
          </div>

          {/* Test results submission overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Trainee Test Scores</h3>
              <p className="text-xs text-slate-400">Review evaluation results and scores submitted by course elders.</p>
            </div>

            {testResults.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No test results submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Elders</th>
                      <th className="py-2.5 px-3">Test Paper</th>
                      <th className="py-2.5 px-3">Graded Score</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {testResults.map(res => (
                      <tr key={res.id}>
                        <td className="py-3 px-3 font-semibold text-slate-800">{res.elder.name}</td>
                        <td className="py-3 px-3 text-slate-500">{res.test.title}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{res.score} / 100</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.status === 'PASSED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Course Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-left">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Trainee Course Feedback</h3>
            <p className="text-xs text-slate-400">Review evaluation feedback and scores submitted by trainees for your courses.</p>
          </div>

          {evaluations.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">No feedback evaluations submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {evaluations.map(ev => (
                <div key={ev.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ev.course?.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Submitted by: Elder {ev.elder?.name}</p>
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

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-left space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
              T
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-400">Official Instructor / Trainer</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="font-semibold text-slate-500">Instructor ID:</span>
              <span className="text-slate-800 font-medium">TRAINER_01</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
              <span className="font-semibold text-slate-500">Email:</span>
              <span className="text-slate-800 font-medium truncate max-w-[200px]">{user?.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
