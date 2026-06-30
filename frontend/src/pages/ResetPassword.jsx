import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context';
import { authService } from '../services';
import { Key, ShieldCheck } from 'lucide-react';
import { Input, Button } from '../components/ui';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await authService.forgotPassword(email);
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await authService.resetPassword(email, code, newPassword);
      setMessage(data.message);
      setStep(3); // Success state
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 relative overflow-hidden">
      {/* Background design */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-10"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
        <div className="church-gradient p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2 backdrop-blur-md">
            <Key size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold">{t('resetPasswordBtn')}</h1>
          <p className="text-white/70 text-xs mt-0.5">{t('appName')}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {message && step !== 3 && (
            <div className="mb-4 p-3 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg">
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <Input
                label={t('email')}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {t('sendCode')}
              </Button>

              <div className="text-center text-xs text-slate-500 mt-4">
                {t('backToLogin')} <Link to="/login" className="text-blue-600 font-semibold hover:underline">{t('signIn')}</Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-[11px]">
                <strong>Check logs:</strong> Get the password reset code from the developer console or backend logs.
              </div>

              <Input
                label={t('verificationCode')}
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="text-center tracking-widest font-bold"
              />

              <Input
                label={t('newPassword')}
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {t('resetPasswordBtn')}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Password Reset Successful</h2>
              <p className="text-xs text-slate-500">Your password was successfully updated. You can now login with your new credentials.</p>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all animate-bounce"
              >
                {t('signIn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
