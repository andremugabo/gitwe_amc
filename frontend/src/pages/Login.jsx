import { useState } from 'react';
import { useAuth, useLanguage } from '../context';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../components/ui';
import { toast } from '../utils/toast';
import { Church, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsUnverified(false);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      toast.error(result.message);
      if (result.unverified) {
        setIsUnverified(true);
        setUnverifiedEmail(result.email || email);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-10"></div>

      <div className="w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="church-gradient p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-md">
            <Church size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold">{t('appName')}</h1>
          <p className="text-white/70 text-sm mt-1">Gitwe Ministerial Centre</p>
        </div>

        <div className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isUnverified && (
              <div className="space-y-2 p-3 text-sm text-amber-800 bg-amber-50 rounded-lg animate-in slide-in-from-top-1 duration-300">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="shrink-0 text-amber-600" />
                  <span className="font-bold">Verification Required</span>
                </div>
                <div className="pt-1.5 border-t border-amber-200/50">
                  <Link
                    to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Click here to enter your verification code and activate your account &rarr;
                  </Link>
                </div>
              </div>
            )}

            <Input
              label={t('email')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder="admin@gitweamc.org"
            />

            <Input
              label={t('password')}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3"
            >
              {t('signIn')}
            </Button>
          </form>

          <div className="flex justify-between items-center text-xs text-slate-500 mt-4 px-1">
            <Link to="/reset-password" className="hover:text-blue-600 hover:underline">{t('forgotPassword')}</Link>
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">{t('createAccount')}</Link>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
