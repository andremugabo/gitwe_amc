import { useAuth, useLanguage } from '../context';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Award, 
  Bell, 
  LogOut,
  Calendar,
  UserPlus,
  ClipboardList,
  MessageSquare,
  User,
  FileText,
  HelpCircle,
  Settings,
  GraduationCap,
  Percent
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  if (!user) return null;

  const menuItems = {
    UNION_ADMIN: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'training_sessions', name: 'Training Sessions', icon: GraduationCap },
      { id: 'registrations', name: 'Registrations', icon: ClipboardList },
      { id: 'reports', name: 'Reports', icon: FileText },
      { id: 'users', name: 'Users', icon: Users },
      { id: 'notifications', name: 'Notification Center', icon: Bell },
      { id: 'profile', name: 'Profile', icon: User },
      { id: 'faqs', name: 'FAQs Management', icon: HelpCircle },
      { id: 'settings', name: 'Admin Settings', icon: Settings },
      { id: 'evaluation', name: 'Evaluation', icon: Percent },
      { id: 'manage_users', name: 'Manage Users', icon: Users }
    ],
    FIELD_SECRETARY: [
      { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard },
      { id: 'users', name: t('users'), icon: Users },
      { id: 'registrations', name: t('register_elder'), icon: ClipboardList },
      { id: 'courses', name: t('courses'), icon: BookOpen },
      { id: 'notifications', name: t('notifications'), icon: Bell }
    ],
    PASTOR: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'availability', name: 'Availability Check', icon: Calendar },
      { id: 'register_elder', name: 'Register Elder', icon: UserPlus },
      { id: 'registrations', name: 'My Registrations', icon: ClipboardList },
      { id: 'communication', name: 'Communication Page', icon: MessageSquare },
      { id: 'profile', name: 'Account Profile', icon: User }
    ],
    ELDER: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'materials', name: 'My Materials', icon: BookOpen },
      { id: 'tests', name: 'My Tests', icon: ClipboardList },
      { id: 'certificates', name: 'My Certificate', icon: Award },
      { id: 'evaluation', name: 'Evaluation', icon: Percent },
      { id: 'notifications', name: 'Notifications', icon: Bell }
    ],
    TRAINER: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { id: 'trainer_courses', name: 'Assigned Courses', icon: BookOpen },
      { id: 'attendance', name: 'Attendance Logger', icon: ClipboardList },
      { id: 'prepare_tests', name: 'Prepare Tests', icon: FileText },
      { id: 'evaluations', name: 'Course Evaluations', icon: Percent },
      { id: 'profile', name: 'Profile', icon: User }
    ]
  };

  const currentItems = menuItems[user.role] || [];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center shadow">
            <img src="/favicon.png" alt="Gitwe AMC Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm tracking-wide">GITWE AMC</h2>
            <p className="text-xs text-slate-400 capitalize">{t(user.role).toLowerCase()}</p>
          </div>
        </div>

        <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
          {currentItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-900/30 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut size={16} />
          <span>{t('signOut')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
