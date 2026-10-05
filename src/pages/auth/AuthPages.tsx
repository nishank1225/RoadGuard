import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, KeyRound, CheckCircle2, Loader2, ArrowLeft, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function GoogleButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 rounded-xl border border-base surface-1 font-semibold text-sm flex items-center justify-center gap-3 hover:surface-2 transition disabled:opacity-60"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-[rgb(var(--border))]" />
      <span className="text-xs text-muted font-medium">or</span>
      <div className="flex-1 h-px bg-[rgb(var(--border))]" />
    </div>
  );
}

function RoadAtmosphereVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#070d17]">
      {/* Dynamic atmospheric SVG scene */}
      <svg
        className="absolute inset-0 w-full h-full object-cover rg-visual-sky-anim"
        viewBox="0 0 1000 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* Deep atmospheric sky gradient */}
          <linearGradient id="rgSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#060c16" />
            <stop offset="28%" stopColor="#091422" />
            <stop offset="55%" stopColor="#0d1f30" />
            <stop offset="78%" stopColor="#122c42" />
            <stop offset="100%" stopColor="#15364e" />
          </linearGradient>

          {/* Horizon atmospheric haze */}
          <radialGradient id="rgHorizonGlow" cx="50%" cy="100%" r="65%">
            <stop offset="0%" stopColor="#0081c0" stopOpacity="0.28" />
            <stop offset="35%" stopColor="#41a1cf" stopOpacity="0.14" />
            <stop offset="70%" stopColor="#122c42" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#070d17" stopOpacity="0" />
          </radialGradient>

          {/* Lunar radial corona */}
          <radialGradient id="rgMoonCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3f9ff" stopOpacity="0.9" />
            <stop offset="18%" stopColor="#bde2fa" stopOpacity="0.35" />
            <stop offset="48%" stopColor="#41a1cf" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#091422" stopOpacity="0" />
          </radialGradient>

          {/* Road ribbon asphalt gradient */}
          <linearGradient id="rgRoadSurface" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#181c22" />
            <stop offset="30%" stopColor="#1a2027" />
            <stop offset="70%" stopColor="#131920" />
            <stop offset="100%" stopColor="#0e141a" />
          </linearGradient>

          {/* Soft fog bank horizontal gradients */}
          <linearGradient id="rgFogGradA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#102334" stopOpacity="0" />
            <stop offset="20%" stopColor="#41a1cf" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#b4dbee" stopOpacity="0.14" />
            <stop offset="80%" stopColor="#41a1cf" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#102334" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="rgFogGradB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0b1724" stopOpacity="0" />
            <stop offset="25%" stopColor="#67b2d8" stopOpacity="0.09" />
            <stop offset="55%" stopColor="#9ccde7" stopOpacity="0.12" />
            <stop offset="85%" stopColor="#41a1cf" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0b1724" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Sky backdrop */}
        <rect x="0" y="0" width="1000" height="900" fill="url(#rgSkyGrad)" />

        {/* 2. Soft celestial ambient pinpoints */}
        <g opacity="0.45">
          <circle cx="120" cy="80" r="0.9" fill="#cde6f7" />
          <circle cx="280" cy="110" r="1.1" fill="#eaf4fc" />
          <circle cx="440" cy="70" r="0.8" fill="#cde6f7" />
          <circle cx="610" cy="95" r="1" fill="#ffffff" />
          <circle cx="890" cy="130" r="0.9" fill="#d2ebfc" />
          <circle cx="190" cy="180" r="0.7" fill="#ffffff" />
          <circle cx="360" cy="210" r="1.2" fill="#cde6f7" opacity="0.6" />
          <circle cx="820" cy="70" r="0.8" fill="#eaf4fc" />
          <circle cx="530" cy="160" r="0.9" fill="#ffffff" />
        </g>

        {/* 3. Subtle Moon / Luminary Source */}
        <g transform="translate(730, 160)">
          {/* Outer halo */}
          <circle cx="0" cy="0" r="120" fill="url(#rgMoonCorona)" className="rg-moon-glow-anim" />
          {/* Inner luminous disc */}
          <circle cx="0" cy="0" r="13" fill="#f4f9fd" opacity="0.92" />
          {/* Subtle crater shadow */}
          <circle cx="3" cy="-2" r="11" fill="#e2edf5" opacity="0.3" />
        </g>

        {/* 4. Distant Mountain Silhouette 1 (Deep horizon ridge) */}
        <path
          d="M 0 520 Q 180 475 420 500 T 780 495 Q 890 510 1000 515 L 1000 630 L 0 630 Z"
          fill="#09141f"
        />

        {/* 5. Horizon Atmospheric Glow Band */}
        <rect x="0" y="465" width="1000" height="85" fill="url(#rgHorizonGlow)" />

        {/* 6. Distant Mountain Silhouette 2 (Mid-ground foothills) */}
        <path
          d="M 0 540 Q 240 510 500 535 T 1000 528 L 1000 660 L 0 660 Z"
          fill="#0c1926"
        />

        {/* 7. Distant City / Roadway Lights along Horizon */}
        <g opacity="0.85">
          {/* Traffic group 1 */}
          <g className="rg-traffic-1">
            <circle cx="360" cy="518" r="1.4" fill="#ffd480" />
            <circle cx="372" cy="519" r="1.2" fill="#ffb84d" />
            <circle cx="495" cy="528" r="1.3" fill="#ffd480" />
            <circle cx="585" cy="524" r="1.5" fill="#cde6ff" />
            <circle cx="640" cy="520" r="1.2" fill="#ffd480" />
          </g>
          {/* Traffic group 2 */}
          <g className="rg-traffic-2">
            <circle cx="340" cy="520" r="1.3" fill="#ffffff" />
            <circle cx="410" cy="523" r="1.5" fill="#41a1cf" />
            <circle cx="512" cy="529" r="1.2" fill="#ff9966" />
            <circle cx="605" cy="522" r="1.3" fill="#ffd480" />
            <circle cx="710" cy="516" r="1.4" fill="#d2e8ff" />
          </g>
          {/* Traffic group 3 */}
          <g className="rg-traffic-3">
            <circle cx="388" cy="521" r="1.2" fill="#41a1cf" />
            <circle cx="470" cy="527" r="1.4" fill="#ffe299" />
            <circle cx="530" cy="527" r="1.2" fill="#cde6ff" />
            <circle cx="665" cy="518" r="1.5" fill="#ffae52" />
          </g>
        </g>

        {/* 8. Layer 1 Horizon Fog */}
        <ellipse cx="500" cy="525" rx="550" ry="36" fill="url(#rgFogGradA)" className="rg-fog-layer-1" />

        {/* 9. Terrain & Roadside Verges */}
        <path
          d="M 0 540 L 0 900 L 260 900 C 290 790, 410 710, 395 625 C 385 570, 465 545, 475 528 L 0 540 Z"
          fill="#09121a"
        />
        <path
          d="M 1000 530 L 1000 900 L 580 900 C 585 790, 520 710, 485 625 C 460 570, 495 545, 485 528 L 1000 530 Z"
          fill="#0b151f"
        />

        {/* 10. The Winding Road Group (Perspective Animation) */}
        <g className="rg-visual-road-anim">
          {/* Road Asphalt Bed */}
          <path
            d="M 260 900 C 290 790, 410 710, 395 625 C 385 570, 465 545, 475 528 L 485 528 C 495 545, 460 570, 485 625 C 520 710, 585 790, 580 900 Z"
            fill="url(#rgRoadSurface)"
          />

          {/* Left Road Shoulder Line */}
          <path
            d="M 260 900 C 290 790, 410 710, 395 625 C 385 570, 465 545, 475 528"
            fill="none"
            stroke="#1f3244"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Right Road Shoulder Line */}
          <path
            d="M 580 900 C 585 790, 520 710, 485 625 C 460 570, 495 545, 485 528"
            fill="none"
            stroke="#1f3244"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Center Dashed Lane Divider */}
          <path
            d="M 420 900 C 438 790, 465 710, 440 625 C 422 570, 480 545, 480 528"
            fill="none"
            stroke="#dee2de"
            strokeWidth="1.8"
            strokeDasharray="14 20"
            opacity="0.55"
          />
        </g>

        {/* 11. Mid-level Atmospheric Fog */}
        <ellipse cx="440" cy="615" rx="460" ry="34" fill="url(#rgFogGradB)" className="rg-fog-layer-2" />

        {/* 12. Minimal Roadside Vegetation Silhouettes */}
        <g fill="#070e15" opacity="0.9">
          {/* Left roadside grasses & wild shrubs */}
          <path d="M 245 890 Q 248 855 252 830 Q 256 860 262 885 Z" />
          <path d="M 230 895 Q 235 845 240 815 Q 244 855 250 892 Z" />
          <path d="M 270 880 Q 275 840 282 810 Q 286 850 290 878 Z" />
          <path d="M 330 750 Q 333 720 338 700 Q 341 725 345 748 Z" />
          <path d="M 370 655 Q 373 635 377 620 Q 380 638 384 655 Z" />
          {/* Sparse slender pines on horizon ridge */}
          <path d="M 160 528 L 163 510 L 166 528 Z" opacity="0.6" />
          <path d="M 172 530 L 175 514 L 178 530 Z" opacity="0.5" />
          <path d="M 760 524 L 762 508 L 765 524 Z" opacity="0.5" />
          <path d="M 770 525 L 773 512 L 776 525 Z" opacity="0.4" />
        </g>

        {/* 13. Roadside Posts / Minimal Reflectors */}
        <g opacity="0.7">
          <circle cx="288" cy="800" r="1.5" fill="#41a1cf" opacity="0.8" />
          <line x1="288" y1="800" x2="288" y2="812" stroke="#1c2d3c" strokeWidth="1.2" />

          <circle cx="566" cy="790" r="1.5" fill="#ffd480" opacity="0.7" />
          <line x1="566" y1="790" x2="566" y2="802" stroke="#1c2d3c" strokeWidth="1.2" />

          <circle cx="374" cy="670" r="1.2" fill="#41a1cf" opacity="0.6" />
          <line x1="374" y1="670" x2="374" y2="678" stroke="#1c2d3c" strokeWidth="1" />
        </g>

        {/* 14. Foreground Soft Fog Veil */}
        <ellipse cx="480" cy="745" rx="520" ry="42" fill="url(#rgFogGradA)" className="rg-fog-layer-3" />

        {/* 15. RoadGuard Location / Geospatial Monitoring Markers */}
        {/* Node 1: Horizon Convergence (480, 528) */}
        <g transform="translate(480, 528)">
          <circle cx="0" cy="0" r="6" stroke="#41a1cf" strokeWidth="0.8" fill="none" className="rg-marker-radar" />
          <circle cx="0" cy="0" r="2.2" fill="#41a1cf" />
        </g>

        {/* Node 2: Mid-curve Road Telemetry (440, 625) */}
        <g transform="translate(440, 625)">
          <circle cx="0" cy="0" r="11" stroke="#41a1cf" strokeWidth="1" fill="none" className="rg-marker-radar" />
          <circle cx="0" cy="0" r="3.2" fill="#41a1cf" />
          <circle cx="0" cy="0" r="5" stroke="#41a1cf" strokeWidth="0.5" fill="none" opacity="0.5" />
          {/* Subtle sensor node beacon line */}
          <line x1="0" y1="-12" x2="0" y2="-4" stroke="#41a1cf" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Node 3: Foreground Verifying Beacon (370, 725) */}
        <g transform="translate(370, 725)">
          <circle cx="0" cy="0" r="14" stroke="#41a1cf" strokeWidth="1" fill="none" className="rg-marker-radar" />
          <circle cx="0" cy="0" r="3.8" fill="#41a1cf" />
          <circle cx="0" cy="0" r="7" stroke="#41a1cf" strokeWidth="0.6" fill="none" opacity="0.4" />
        </g>
      </svg>

      {/* Top Overlay: Minimal RoadGuard Telemetry Tag */}
      <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between text-white/80 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ffffff]/10 backdrop-blur-md border border-[#ffffff]/15 flex items-center justify-center text-[#ffffff]">
            <ShieldCheck size={16} className="text-[#41a1cf]" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-white/90 font-semibold">
              ROADGUARD
            </div>
            <div className="text-[9px] font-mono tracking-[0.12em] text-[#41a1cf]/90">
              GEOSPATIAL ROAD TELEMETRY
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#000000]/30 backdrop-blur-md border border-[#ffffff]/10 text-[10px] font-mono text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#41a1cf] animate-pulse" />
          <span>LIVE SENSORS ACTIVE</span>
        </div>
      </div>

      {/* Bottom Editorial Statement Overlay */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 rg-anim-editorial pointer-events-none">
        <div className="max-w-md">
          <p
            className="font-serif text-2xl sm:text-3xl lg:text-[34px] text-[#ffffff] font-normal leading-[1.15] tracking-[-0.02em] drop-shadow-sm mb-2"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            See the road differently.
          </p>
          <p className="text-xs sm:text-sm text-[#ffffff]/70 tracking-[0.08em] uppercase font-sans font-medium">
            Detect. Locate. Respond.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Login({ onSwitch, onForgot }: { onSwitch: () => void; onForgot: () => void }) {
  const { signIn, sendOtp, verifyOtpAndSignIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true);
    try { await signInWithGoogle(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Google sign-in failed'); }
    finally { setGoogleLoading(false); }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);

      // Password is correct — now send OTP
      await sendOtp(email);

      setOtpSent(true);
      setMode('otp');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';

      setError(
        msg.includes('Invalid login')
          ? 'Invalid email or password.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await sendOtp(email); setOtpSent(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to send code'); }
    finally { setLoading(false); }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await verifyOtpAndSignIn(email, token); }
    catch (err) { setError(err instanceof Error ? err.message : 'Verification failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row rg-login-page">
      {/* Left Column: Atmospheric Animated RoadGuard Visual */}
      <div className="w-full lg:w-[58%] h-[32vh] sm:h-[36vh] lg:h-auto lg:min-h-screen relative overflow-hidden bg-[#070d17]">
        <RoadAtmosphereVisual />
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="w-full lg:w-[42%] min-h-[68vh] lg:min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-14">
        <div className="w-full max-w-[440px] rg-login-card p-6 sm:p-9">
          {/* Small RoadGuard Logo / Title */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[#1f1f29] text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={13} className="text-[#41a1cf]" />
            </div>
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#41a1cf]">
              ROADGUARD
            </span>
          </div>

          {/* Heading */}
          <h1
            className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#171717] leading-[1.1] tracking-[-0.02em] rg-anim-heading"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Welcome back.
          </h1>

          {/* Subheading */}
          <p className="text-sm text-[#646464] mt-2 mb-6 font-normal">
            Sign in to continue monitoring roads with RoadGuard.
          </p>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-[48px] rounded-lg border border-[#dee2de] bg-[#ffffff] text-[#171717] font-medium text-sm flex items-center justify-center gap-3 hover:bg-[#f9faf7] transition-colors duration-150 disabled:opacity-60 shadow-sm"
          >
            {googleLoading ? <Loader2 size={16} className="animate-spin text-[#646464]" /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#dee2de]" />
            <span className="text-xs text-[#646464] font-medium">or</span>
            <div className="flex-1 h-px bg-[#dee2de]" />
          </div>


          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3 mb-4 animate-fade-in" role="alert">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#dc2626]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          {mode === 'password' ? (
            <form onSubmit={submitPassword} className="space-y-4">
              <div className="rg-anim-email">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#444141] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#646464]">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rg-editorial-input w-full pl-10 pr-4 text-sm"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="rg-anim-password">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#444141]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onForgot}
                    className="text-xs text-[#41a1cf] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#646464]">
                    <Lock size={16} />
                  </span>
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rg-editorial-input w-full pl-10 pr-10 text-sm"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#646464] hover:text-[#171717] transition-colors p-1"
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="rg-anim-action pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rg-editorial-btn group w-full font-medium text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} className="rg-btn-arrow transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : !otpSent ? (
            <form onSubmit={sendCode} className="space-y-4">
              <div className="rg-anim-email">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#444141] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#646464]">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rg-editorial-input w-full pl-10 pr-4 text-sm"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="rg-anim-action pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rg-editorial-btn group w-full font-medium text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending code…</span>
                    </>
                  ) : (
                    <>
                      <span>Send code</span>
                      <KeyRound size={16} className="rg-btn-arrow transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>Code sent to <span className="font-semibold">{email}</span></span>
              </div>

              <div className="rg-anim-password">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#444141] mb-1.5">
                  One-time code
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#646464]">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="rg-editorial-input w-full pl-10 pr-4 tracking-[0.4em] font-mono font-bold text-center text-sm"
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                </div>
              </div>

              <div className="rg-anim-action pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rg-editorial-btn group w-full font-medium text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; sign in</span>
                      <ArrowRight size={16} className="rg-btn-arrow transition-transform duration-200" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full py-2.5 text-xs font-medium text-[#646464] hover:text-[#171717] transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          {/* Footer: Create Account Switch */}
          <p className="text-center text-xs sm:text-sm text-[#646464] mt-6">
            No account?{' '}
            <button
              type="button"
              onClick={onSwitch}
              className="text-[#41a1cf] font-medium hover:underline ml-1"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register({ onSwitch }: { onSwitch: () => void }) {
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true);
    try { await signInWithGoogle(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Google sign-up failed'); }
    finally { setGoogleLoading(false); }
  };

  const captureLocation = () => {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        setLocError('');
      },
      (err) => {
        setLocLoading(false);
        let msg = 'Failed to capture location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser and try again.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable. Please try again.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('A valid email address is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Contact Number is required.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!coords) {
      setError('Current location is required before account creation. Please click "Capture Current Location".');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name.trim(), phone.trim(), coords.lat, coords.lng);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Join RoadGuard to report and monitor road conditions">
      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
      <Divider />
      <form onSubmit={handleCreateAccount} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl p-3 animate-fade-in">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}
        <Field icon={<User size={18} />} label="Full Name">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input pl-11"
            placeholder="Enter your full name"
          />
        </Field>
        <Field icon={<Mail size={18} />} label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input pl-11"
            placeholder="Enter your email"
          />
        </Field>
        <Field icon={<Phone size={18} />} label="Contact Number">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input pl-11"
            placeholder="Enter your phone number"
          />
        </Field>
        <Field icon={<Lock size={18} />} label="Password">
          <input
            type={show ? 'text' : 'password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pl-11 pr-11"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[rgb(var(--text))]"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </Field>

        <div>
          <label className="block text-sm font-medium mb-1.5">Location</label>
          <button
            type="button"
            onClick={captureLocation}
            disabled={locLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-base surface-1 hover:surface-2 font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 mb-2"
          >
            <MapPin size={18} className="text-primary-600" />
            {locLoading ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Capturing Location…</span>
            ) : (
              '📍 Capture Current Location'
            )}
          </button>

          {coords && (
            <div className="surface-2 p-3 rounded-xl border border-emerald-500/30 text-sm space-y-1 animate-fade-in">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircle2 size={15} /> Location captured:
              </div>
              <div className="text-xs text-muted font-mono">Latitude: {coords.lat.toFixed(6)}</div>
              <div className="text-xs text-muted font-mono">Longitude: {coords.lng.toFixed(6)}</div>
            </div>
          )}

          {locError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl p-3 animate-fade-in">
              <AlertCircle size={15} className="shrink-0" />
              <span>{locError}</span>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Creating account…</span>
          ) : (
            <>Create Account <ArrowRight size={18} /></>
          )}
        </button>
      </form>
      <p className="text-center text-sm text-muted mt-6">
        Already have an account? <button onClick={onSwitch} className="text-primary-600 font-semibold hover:underline">Sign in</button>
      </p>
    </AuthShell>
  );
}

export function ForgotPassword({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await resetPassword(email); setSent(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Reset password" subtitle="We'll send you a recovery link">
      {sent ? (
        <div className="text-center py-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-4"><Mail size={26} /></div>
          <p className="text-sm text-muted">Check your email for a reset link.</p>
          <button onClick={onBack} className="btn-ghost mt-5">Back to login</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-xl p-3"><AlertCircle size={16} /> {error}</div>}
          <Field icon={<Mail size={18} />} label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-11" placeholder="you@example.com" />
          </Field>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending…' : 'Send reset link'}</button>
          <button type="button" onClick={onBack} className="btn-ghost w-full">Back to login</button>
        </form>
      )}
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#000000,#171717 40%,#262626)' }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #404040 0%, transparent 50%), radial-gradient(circle at 80% 80%, #171717 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center"><ShieldCheck size={24} /></div>
            <span className="font-display font-bold text-xl">RoadGuard</span>
          </div>
          <div>
            <h2 className="font-display font-extrabold text-4xl leading-tight">Report and track<br />road damage</h2>
            <p className="text-white/70 mt-4 max-w-md">Capture road images, get instant damage analysis, and track repairs in real time across your city.</p>
            <div className="flex gap-6 mt-8">
              {[['6', 'Damage types'], ['Real-time', 'Sync'], ['Live', 'Map']].map(([n, l]) => (
                <div key={l}><div className="text-2xl font-bold">{n}</div><div className="text-white/60 text-sm">{l}</div></div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-sm">Building safer roads together</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 surface">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white"><ShieldCheck size={22} /></div>
            <span className="font-display font-bold text-lg">RoadGuard</span>
          </div>
          <h1 className="font-display font-bold text-2xl">{title}</h1>
          <p className="text-muted mt-1.5 mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        {children}
      </div>
    </div>
  );
}
