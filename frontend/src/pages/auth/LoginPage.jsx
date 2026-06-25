import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { loginUser } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const onSubmit = async (payload) => {
    try {
      const response = await loginUser(payload);
      login(response.data.token, response.data.user);
      showToast('Logged in successfully', 'success');
      navigate('/');
    } catch (error) {
      console.error(error);
      showToast('Invalid credentials', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-emerald-700 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/10 p-10 shadow-glass backdrop-blur-xl">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-200">MediWave Access</p>
          <h1 className="text-4xl font-bold">Sign in to continue</h1>
          <p className="text-slate-300">Secure access for admins, staff and managers.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input type="email" {...register('email', { required: true })} className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30" />
          </label>
          <label className="block text-sm font-medium text-slate-200 relative">
            Password
            <input type={showPassword ? 'text' : 'password'} {...register('password', { required: true })} className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-950/70 px-4 py-3 pr-12 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </label>
          <div className="flex items-center justify-between text-sm text-slate-200">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 bg-white text-indigo-600" />
              Remember me
            </label>
            <Link to="/register" className="font-semibold text-indigo-300 hover:text-white">Create account</Link>
          </div>
          <button type="submit" className="w-full rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-400">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
