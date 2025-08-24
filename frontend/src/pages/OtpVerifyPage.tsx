import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react'; // Optional: Install lucide-react for icons

const OtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('OTP verified successfully!');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid OTP');
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      toast.error('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 via-gray-900 to-emerald-900 p-6 animate-background">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl max-w-md w-full p-10 text-white relative overflow-hidden">
        {/* Animated Lock Icon */}
        <div className="flex justify-center mb-6">
          <Lock className="w-12 h-12 text-cyan-400 animate-pulse" />
        </div>

        <h2 className="font-bold text-3xl sm:text-4xl text-center mb-3">
          Secure OTP Verification
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-300 mb-8">
          Enter the code sent to <br />
          <span className="underline font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              inputMode="numeric"
              pattern="\d{6}"
              className="w-full text-center text-xl tracking-widest text-white placeholder-gray-400 px-5 py-4 rounded-xl border border-white/30 bg-white/5 backdrop-blur-md outline-none peer transition-all"
            />
            {/* Animated underline */}
            <span className="block h-[2px] w-0 bg-cyan-400 absolute bottom-0 left-0 transition-all duration-300 peer-focus:w-full" />
          </div>

          {error && (
            <p className="text-red-400 text-center font-medium animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-lg font-semibold rounded-xl transition duration-300 ${
              loading
                ? 'bg-cyan-300 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-700 active:scale-95'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-background {
          background-size: 200% 200%;
          animation: gradientBG 12s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default OtpPage;
