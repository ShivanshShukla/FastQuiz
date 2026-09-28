import React, { useState } from 'react';
import {
  type AdminTotpEnrollmentRequiredResponse,
  type AdminTotpRequiredResponse,
} from '@fastquiz/shared';
import { ShieldCheck, Key, Copy, Check, AlertCircle, ArrowRight, X } from 'lucide-react';

export type TotpChallengeState =
  | AdminTotpRequiredResponse
  | AdminTotpEnrollmentRequiredResponse;

interface TotpChallengeModalProps {
  challenge: TotpChallengeState;
  onVerify: (code: string) => Promise<void>;
  onConfirmEnrollment: (code: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const TotpChallengeModal: React.FC<TotpChallengeModalProps> = ({
  challenge,
  onVerify,
  onConfirmEnrollment,
  onCancel,
  isLoading,
  errorMessage,
}) => {
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const isEnrollment = challenge.status === 'totp_enrollment_required';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (isEnrollment) {
      await onConfirmEnrollment(code.trim());
    } else {
      await onVerify(code.trim());
    }
  };

  const handleCopySecret = () => {
    if ('secret' in challenge) {
      navigator.clipboard.writeText(challenge.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyRecoveryCodes = () => {
    if ('recovery_codes' in challenge) {
      navigator.clipboard.writeText(challenge.recovery_codes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                {isEnrollment ? 'Enroll Multi-Factor Authentication (2FA)' : 'Two-Factor Challenge (TOTP)'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {isEnrollment
                  ? 'Mandatory hardware/TOTP setup for internal admin identity'
                  : 'Enter the 6-digit token from your authenticator application'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Enrollment Instructions & QR Code */}
        {isEnrollment && 'qr_code_svg' in challenge && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
              <div
                className="w-28 h-28 bg-white p-1 rounded border border-zinc-200 shrink-0 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: challenge.qr_code_svg }}
              />
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-zinc-700 block">
                  Scan with Authenticator
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Use Google Authenticator, 1Password, or Apple Keychain to scan the QR code.
                </p>
                <div className="pt-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 truncate max-w-[150px]">
                    {challenge.secret}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 text-[10px] flex items-center gap-1"
                    title="Copy Secret"
                  >
                    {copiedSecret ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* One-Time Backup Recovery Codes */}
            {'recovery_codes' in challenge && (
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    One-Time Recovery Codes (Save in Safe Place)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRecoveryCodes}
                    className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                  >
                    {copiedCodes ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-amber-950">
                  {challenge.recovery_codes.map((rc, i) => (
                    <div key={i} className="bg-white/80 px-2 py-0.5 rounded border border-amber-200/50">
                      {rc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-800" htmlFor="totp-input">
                {isEnrollment
                  ? 'Confirm with 6-Digit Code'
                  : useRecoveryCode
                  ? 'Enter 10-Character Recovery Code'
                  : '6-Digit Verification Code'}
              </label>
              {!isEnrollment && (
                <button
                  type="button"
                  onClick={() => {
                    setUseRecoveryCode(!useRecoveryCode);
                    setCode('');
                  }}
                  className="text-[11px] text-indigo-600 hover:underline"
                >
                  {useRecoveryCode ? 'Use 6-digit code' : 'Lost device? Use recovery code'}
                </button>
              )}
            </div>
            <input
              id="totp-input"
              type="text"
              required
              autoFocus
              maxLength={useRecoveryCode ? 15 : 6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={useRecoveryCode ? 'A3F8K-92J1P' : '123456'}
              className="w-full text-center text-lg font-mono tracking-widest py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : isEnrollment ? 'Confirm & Login' : 'Authenticate'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
