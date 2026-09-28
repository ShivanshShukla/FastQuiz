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

/**
 * Universal clipboard copy supporting both modern secure contexts and HTTP fallbacks.
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to legacy execCommand
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand('copy');
    textArea.remove();
    return ok;
  } catch {
    return false;
  }
};

/**
 * Normalizes SVG strings from the backend to ensure a responsive viewBox
 * and removes hardcoded width/height constraints that cause clipping.
 */
function normalizeSvg(svg: string): string {
  if (!svg) return '';
  let res = svg.trim();
  const widthMatch = res.match(/width="(\d+)"/i);
  const heightMatch = res.match(/height="(\d+)"/i);

  if (!res.includes('viewBox') && widthMatch && heightMatch) {
    res = res.replace(
      /<svg/i,
      `<svg viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}" preserveAspectRatio="xMidYMid meet"`
    );
  } else if (!res.includes('preserveAspectRatio')) {
    res = res.replace(/<svg/i, '<svg preserveAspectRatio="xMidYMid meet"');
  }

  // Remove fixed dimensions so CSS parent dimensions control the rendering
  res = res.replace(/\s+(width|height)="[^"]*"/gi, '');
  return res;
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;

    if (isEnrollment) {
      await onConfirmEnrollment(cleanCode);
    } else {
      await onVerify(cleanCode);
    }
  };

  const handleCopySecret = async () => {
    if ('secret' in challenge && challenge.secret) {
      const ok = await copyToClipboard(challenge.secret);
      if (ok) {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      }
    }
  };

  const handleCopyRecoveryCodes = async () => {
    if ('recovery_codes' in challenge && challenge.recovery_codes) {
      const ok = await copyToClipboard(challenge.recovery_codes.join('\n'));
      if (ok) {
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 flex flex-col gap-5">
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
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              {/* Responsive, unclipped QR Code Box */}
              <div className="w-36 h-36 bg-white p-2 rounded-lg border border-zinc-200 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:block"
                  dangerouslySetInnerHTML={{ __html: normalizeSvg(challenge.qr_code_svg) }}
                />
              </div>

              {/* Instructions & Secret Key */}
              <div className="space-y-2.5 flex-1 min-w-0 w-full">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    Scan with Authenticator App
                  </span>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Open Google Authenticator, 1Password, or Apple Passwords and scan the QR code.
                  </p>
                </div>

                {/* Full Manual Entry Secret */}
                <div className="pt-1.5 border-t border-zinc-200/70">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                      Manual Entry Key
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedSecret ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] bg-white border border-zinc-200 px-2 py-1 rounded text-zinc-800 select-all tracking-wider font-semibold break-all">
                    {challenge.secret}
                  </div>
                </div>
              </div>
            </div>

            {/* One-Time Backup Recovery Codes */}
            {'recovery_codes' in challenge && (
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    One-Time Recovery Codes (Save in Safe Place)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRecoveryCodes}
                    className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-amber-950">
                  {challenge.recovery_codes.map((rc, i) => (
                    <div key={i} className="bg-white/90 px-2 py-1 rounded border border-amber-200/60 font-semibold tracking-wider text-center">
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
                  className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
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
              inputMode={useRecoveryCode ? 'text' : 'numeric'}
              autoComplete="one-time-code"
              maxLength={useRecoveryCode ? 15 : 7}
              value={code}
              onChange={(e) => {
                const val = e.target.value;
                if (!useRecoveryCode) {
                  const digits = val.replace(/\D/g, '').slice(0, 6);
                  setCode(digits);
                  if (digits.length === 6 && !isLoading) {
                    if (isEnrollment) {
                      onConfirmEnrollment(digits);
                    } else {
                      onVerify(digits);
                    }
                  }
                } else {
                  setCode(val.toUpperCase());
                }
              }}
              placeholder={useRecoveryCode ? '01E6E-64FCC' : '••••••'}
              className="w-full text-center text-2xl font-mono tracking-[0.3em] py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
