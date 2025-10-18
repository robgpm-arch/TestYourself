import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';

interface PhoneFormProps {
  onSend: (phone: string) => Promise<void>;
  onConfirm: (code: string) => Promise<void>;
  error: string;
}

const PhoneForm: React.FC<PhoneFormProps> = ({ onSend, onConfirm, error }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.startsWith('+')) {
      alert('Phone number must include country code (e.g., +91)');
      return;
    }
    setLoading(true);
    try {
      await onSend(phone);
      setStep('otp');
    } catch (err: any) {
      alert(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (otp.length !== 6) {
      alert('Please enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(otp);
    } catch (err: any) {
      alert(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <Input
            type="tel"
            placeholder="+91 Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
          />
          <Button
            onClick={handleSendOtp}
            loading={loading}
            fullWidth
          >
            Send OTP
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            OTP sent to {phone}
          </p>
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full text-center text-2xl tracking-widest"
          />
          <div className="flex space-x-2">
            <Button
              onClick={() => setStep('phone')}
              variant="outline"
              className="flex-1"
            >
              Change Number
            </Button>
            <Button
              onClick={handleConfirmOtp}
              loading={loading}
              className="flex-1"
            >
              Verify OTP
            </Button>
          </div>
        </>
      )}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
};

export default PhoneForm;