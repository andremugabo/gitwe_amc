import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Award, 
  Bell, 
  LogOut,
  ThumbsUp,
  FileCheck
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  if (!user) return null;

  const menuItems = {
    UNION_ADMIN: [
      { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard },
      { id: 'users', name: t('users'), icon: Users },
      { id: 'courses', name: t('courses'), icon: BookOpen },
      { id: 'recommendations', name: t('recommend'), icon: ThumbsUp },
      { id: 'notifications', name: t('notifications'), icon: Bell }
    ],
    FIELD_SECRETARY: [
      { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard },
      { id: 'users', name: t('users'), icon: Users },
      { id: 'registrations', name: t('register_elder'), icon: FileCheck },
      { id: 'courses', name: t('courses'), icon: BookOpen },
      { id: 'notifications', name: t('notifications'), icon: Bell }
    ],
    PASTOR: [
      { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard },
      { id: 'elders', name: t('users'), icon: Users },
      { id: 'recommend', name: t('recommend'), icon: ThumbsUp },
      { id: 'notifications', name: t('notifications'), icon: Bell }
    ],
    ELDER: [
      { id: 'dashboard', name: t('dashboard'), icon: LayoutDashboard },
      { id: 'materials', name: t('elearning'), icon: BookOpen },
      { id: 'certificates', name: t('certificates'), icon: Award },
      { id: 'notifications', name: t('notifications'), icon: Bell }
    ]
  };

  const currentItems = menuItems[user.role] || [];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            G
          </div>
          <div>
            <h2 className="font-bold text-white text-sm tracking-wide">GITWE AMC</h2>
            <p className="text-xs text-slate-400 capitalize">{t(user.role).toLowerCase()}</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {currentItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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
