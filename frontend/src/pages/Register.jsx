import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';
import { Church, Mail, Lock, User, Phone, CheckCircle, Shield } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = Details, 2 = Verify Code
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ELDER',
    unionId: '',
    fieldId: '',
    districtId: '',
    localChurchId: ''
  });

  const [hierarchy, setHierarchy] = useState({
    unions: [],
    fields: [],
    districts: [],
    localChurches: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const { data } = await api.get('/hierarchy');
        setHierarchy(data);
      } catch (err) {
        console.error('Error fetching hierarchy data:', err);
      }
    };
    fetchHierarchy();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({
      ...formData,
      role: newRole,
      unionId: '',
      fieldId: '',
      districtId: '',
      localChurchId: ''
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-validation to match scopes
    if (formData.role === 'UNION_ADMIN' && !formData.unionId) {
      setError('Please select a Union');
      setLoading(false);
      return;
    }
    if (formData.role === 'FIELD_SECRETARY' && !formData.fieldId) {
      setError('Please select a Field');
      setLoading(false);
      return;
    }
    if (formData.role === 'PASTOR' && !formData.districtId) {
      setError('Please select a District');
      setLoading(false);
      return;
    }
    if (formData.role === 'ELDER' && !formData.localChurchId) {
      setError('Please select a Local Church');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/register', formData);
      setVerifiedEmail(data.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify', { email: verifiedEmail, code: otpCode });
      setStep(3); // Success Screen
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists based on hierarchy selection
  const filteredFields = hierarchy.fields.filter(f => f.unionId === formData.unionId);
  const filteredDistricts = hierarchy.districts.filter(d => d.fieldId === formData.fieldId);
  const filteredChurches = hierarchy.localChurches.filter(c => c.districtId === formData.districtId);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 relative overflow-hidden">
      {/* Background design */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-10"></div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
        <div className="church-gradient p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2 backdrop-blur-md">
            <Church size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold">{t('createAccount')}</h1>
          <p className="text-white/70 text-xs mt-0.5">{t('appName')}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">{t('fullName')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Gatete Silas"
                      className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">{t('email')}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="silas@gmail.com"
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">{t('password')}</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">{t('phone')}</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0788123456"
                    className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">{t('role')}</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                >
                  <option value="ELDER">{t('ELDER')}</option>
                  <option value="PASTOR">{t('PASTOR')}</option>
                  <option value="FIELD_SECRETARY">{t('FIELD_SECRETARY')}</option>
                  <option value="UNION_ADMIN">{t('UNION_ADMIN')}</option>
                </select>
              </div>

              {/* Dynamic Scoped Hierarchy Dropdowns */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ecclesiastical Location</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">{t('selectUnion')}</label>
                    <select
                      name="unionId"
                      value={formData.unionId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    >
                      <option value="">-- {t('selectUnion')} --</option>
                      {hierarchy.unions.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  {['FIELD_SECRETARY', 'PASTOR', 'ELDER'].includes(formData.role) && (
                    <div className="space-y-1.5 animate-in fade-in duration-300">
                      <label className="text-xs font-semibold text-slate-600">{t('selectField')}</label>
                      <select
                        name="fieldId"
                        disabled={!formData.unionId}
                        value={formData.fieldId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
                      >
                        <option value="">-- {t('selectField')} --</option>
                        {filteredFields.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {['PASTOR', 'ELDER'].includes(formData.role) && (
                    <div className="space-y-1.5 animate-in fade-in duration-300">
                      <label className="text-xs font-semibold text-slate-600">{t('selectDistrict')}</label>
                      <select
                        name="districtId"
                        disabled={!formData.fieldId}
                        value={formData.districtId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
                      >
                        <option value="">-- {t('selectDistrict')} --</option>
                        {filteredDistricts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.role === 'ELDER' && (
                    <div className="space-y-1.5 animate-in fade-in duration-300">
                      <label className="text-xs font-semibold text-slate-600">{t('selectChurch')}</label>
                      <select
                        name="localChurchId"
                        disabled={!formData.districtId}
                        value={formData.localChurchId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
                      >
                        <option value="">-- {t('selectChurch')} --</option>
                        {filteredChurches.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-75"
              >
                {loading ? t('loading') : t('createAccount')}
              </button>

              <div className="text-center text-xs text-slate-500 mt-4">
                Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">{t('signIn')}</Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-5 text-center">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs text-left">
                <strong>Simulated SMTP/SMS Verification:</strong> Check the developer console log or backend server terminal to copy the verification token.
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-600">Enter verification code sent to</p>
                <p className="text-sm font-bold text-slate-800">{verifiedEmail}</p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="000000"
                className="w-40 text-center tracking-widest text-lg font-bold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? t('loading') : t('verifyAndActivate')}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Verification Successful</h2>
              <p className="text-sm text-slate-500">Your email has been verified. You can now access your dashboard.</p>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 church-gradient text-white text-sm font-semibold rounded-lg hover:shadow-lg active:scale-[0.98] transition-all"
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

export default Register;
