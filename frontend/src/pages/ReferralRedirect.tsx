import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { referralAPI } from '../lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

const ReferralRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const validate = async () => {
      if (!code) {
        navigate('/', { replace: true });
        return;
      }
      try {
        const { data } = await referralAPI.validate(code);
        if (data.valid) {
          localStorage.setItem('referralCode', code);
          localStorage.setItem('channel', 'referral');
          navigate(`/signup?ref=${code}&next=/onboarding`, { replace: true });
        } else {
          setError('This referral code is invalid.');
        }
      } catch {
        // Invalid code — still redirect to signup
        setError('This referral code could not be verified.');
        setTimeout(() => navigate('/signup', { replace: true }), 2000);
      }
    };
    validate();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <p className="text-white mb-2">{error}</p>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Redirecting to registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-violet-400" />
        <p className="text-white">Validating referral link...</p>
      </div>
    </div>
  );
};

export default ReferralRedirect;
