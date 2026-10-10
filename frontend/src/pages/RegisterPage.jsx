import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card3D from '../components/common/3D/Card3D';

const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isSeniorEligible = calculatedAge !== null && calculatedAge >= 60;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const isDemo =
        email.toLowerCase().includes('demo') ||
        email.toLowerCase() === 'rahul@example.com' ||
        email.toLowerCase().endsWith('@queueless.gov.in');

      await register({ name, email, mobile, password, dateOfBirth: dateOfBirth || null, isDemo });
      toast.success(
        isSeniorEligible
          ? 'Senior Citizen account registered! You will receive priority tokens.'
          : 'Citizen registration successful! Welcome to QueueLess.'
      );
      navigate('/citizen');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: '#f8f9fc',
    border: '1.5px solid rgba(26,42,94,0.2)',
    color: '#1a2238',
    width: '100%',
    padding: '10px 12px 10px 40px',
    borderRadius: '12px',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#1a2a5e';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,42,94,0.1)';
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(26,42,94,0.2)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f2f8 0%, #e8ecf5 50%, #eef1f8 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(26,42,94,0.08) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg border group-hover:scale-105 transition"
            style={{ background: 'linear-gradient(135deg, #1a2a5e, #c8a227)', borderColor: 'rgba(200,162,39,0.4)' }}
          >
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tight font-heading" style={{ color: '#1a2a5e' }}>
            QueueLess
          </span>
        </Link>
        <h2 className="text-xl font-black font-heading mt-2" style={{ color: '#1a2a5e' }}>
          Citizen Portal Registration
        </h2>
        <p className="text-xs font-mono mt-1 font-bold" style={{ color: '#c8a227' }}>
          Access remote token booking &amp; live queue tracking
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <Card3D maxTilt={6}>
          <div
            className="py-8 px-6 sm:px-8 rounded-3xl shadow-2xl relative"
            style={{ background: 'white', border: '1px solid rgba(26,42,94,0.12)' }}
          >

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold mb-1.5 font-mono" style={{ color: '#1a2a5e' }}>
                  Full Legal Name <span style={{ color: '#c8a227' }}>*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold mb-1.5 font-mono" style={{ color: '#1a2a5e' }}>
                  Email Address <span style={{ color: '#c8a227' }}>*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold mb-1.5 font-mono" style={{ color: '#1a2a5e' }}>
                  Mobile Number{' '}
                  <span className="font-normal text-[11px]" style={{ color: '#64748b' }}>(for SMS &amp; OTP)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="tel"
                    placeholder="+91 98250 12345"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Date of Birth (Verification for Senior Citizen Priority) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold font-mono" style={{ color: '#1a2a5e' }}>
                    Date of Birth
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Age 60+ = Senior Citizen Priority Token
                  </span>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {calculatedAge !== null && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isSeniorEligible
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles
                        className={`w-3.5 h-3.5 ${isSeniorEligible ? 'text-amber-600' : 'text-slate-400'}`}
                      />
                      <span>Age: {calculatedAge} years</span>
                    </div>
                    {isSeniorEligible ? (
                      <span className="text-[10px] font-mono font-extrabold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                        👴 Verified Senior Citizen (Priority Queue Eligible)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">Standard Citizen</span>
                    )}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold mb-1.5 font-mono" style={{ color: '#1a2a5e' }}>
                  Password{' '}
                  <span className="font-normal text-[11px]" style={{ color: '#64748b' }}>(min. 6 characters)</span>{' '}
                  <span style={{ color: '#c8a227' }}>*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1a2a5e' }} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 btn-3d"
                style={{
                  background: 'linear-gradient(135deg, #c8a227 0%, #e8be3a 100%)',
                  color: '#1a2a5e',
                  border: '1px solid rgba(200,162,39,0.5)',
                  boxShadow: '0 4px 15px rgba(200,162,39,0.35)',
                }}
              >
                <span>{loading ? 'Creating Citizen Account...' : 'Complete Citizen Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Terms note */}
            <div
              className="mt-4 flex items-center gap-2 text-[11px] p-3 rounded-xl"
              style={{ background: 'rgba(26,42,94,0.04)', border: '1px solid rgba(26,42,94,0.1)' }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#1a2a5e' }} />
              <span style={{ color: '#64748b' }}>
                Your data is protected under Government of India Digital Security Standards.
              </span>
            </div>

            <div className="mt-5 text-center text-xs" style={{ color: '#64748b' }}>
              <span>Already have an account? </span>
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#1a2a5e' }}>
                Log in here
              </Link>
            </div>
          </div>
        </Card3D>
      </div>
    </div>
  );
};

export default RegisterPage;
