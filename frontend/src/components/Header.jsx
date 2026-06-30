import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Shield, Globe } from 'lucide-react';

const Header = ({ title }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (!user) return null;

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t('appName')}</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Language Selector Selector */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50">
          <Globe size={14} className="text-slate-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="kin">Kinyarwanda (KIN)</option>
            <option value="fr">Français (FR)</option>
          </select>
        </div>

        {/* Scoped location indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
          <MapPin size={14} className="text-blue-600" />
          <span>
            {user.role === 'UNION_ADMIN' && 'Union Level'}
            {user.role === 'FIELD_SECRETARY' && 'Gitwe Field Scoped'}
            {user.role === 'PASTOR' && 'Gitwe District Scoped'}
            {user.role === 'ELDER' && 'Gitwe Local Church'}
          </span>
        </div>

        {/* User Role Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/50 rounded-full text-[10px] uppercase font-bold tracking-wider">
          <Shield size={12} />
          <span>{t(user.role)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
