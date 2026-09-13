import { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/authContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setSubmitting(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-auspost-gray-light">
      {/* Header bar with AusPost logo */}
      <div className="bg-auspost-red px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <img src="/images/AusPost_Full_Logo.webp" alt="Australia Post" className="h-8 w-auto" />
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <img
          src="/images/photo-business-customer-van-collection-pickup-home-carport-lots-of-parcels.jpeg"
          alt="Parcel delivery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-auspost-red/30 to-auspost-charcoal/60" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <h1 className="text-white text-2xl font-display font-bold leading-tight">
            Parcel Log Pro
          </h1>
          <p className="text-white/90 text-sm">Delivery Manifest &amp; Pay Tracking</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-8 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-auspost-charcoal mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-auspost-gray mb-6">
              {mode === 'signin'
                ? 'Sign in to track your deliveries and manage invoices'
                : 'Sign up to start logging your daily parcel deliveries'}
            </p>

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-auspost-gray-light rounded-auspost mb-6">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex-1 py-2 rounded-[6px] text-sm font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-auspost-red shadow-sm'
                    : 'text-auspost-gray'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2 rounded-[6px] text-sm font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-auspost-red shadow-sm'
                    : 'text-auspost-gray'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-auspost-charcoal mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-auspost-gray" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="John Smith"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-auspost-charcoal mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-auspost-gray" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="driver@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-auspost-charcoal mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-auspost-gray" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-auspost-gray hover:text-auspost-charcoal"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-auspost bg-auspost-red-light text-sm text-auspost-red animate-fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-base"
              >
                {submitting
                  ? 'Please wait...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-auspost-gray mt-6">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="text-auspost-red font-semibold hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-xs text-auspost-gray">
          Parcel Log Pro — Delivery Manifest & Pay Tracking
        </p>
      </div>
    </div>
  );
}
