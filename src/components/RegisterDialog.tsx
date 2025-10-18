import { useEffect, useRef, useState } from 'react'
import {
  getAuth,
  updateProfile,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { ensureUserProfile } from '../lib/ensureUserProfile'

type Tab = 'email' | 'phone'

export default function RegisterDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // email
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // phone
  const [phone, setPhone] = useState('+91')
  const [code, setCode] = useState('')
  const confirmation = useRef<ConfirmationResult | null>(null)
  const recaptcha = useRef<RecaptchaVerifier | null>(null)

  const auth = getAuth()

  useEffect(() => {
    // Reset state when tab/dialog changes
    setError(null)
  }, [tab, open])

  async function ensureRecaptcha() {
    if (!recaptcha.current) {
      recaptcha.current = new RecaptchaVerifier(auth, 'send-otp-btn', {
        size: 'invisible',
        callback: () => {
          // solved automatically in most cases
        },
        'expired-callback': () => {
          recaptcha.current?.clear()
          recaptcha.current = null
        },
      })
    }
    return recaptcha.current
  }

  async function onEmailRegister() {
    try {
      setBusy(true); setError(null)
      if (!fullName.trim()) throw new Error('Please enter your full name')
      if (!email.trim()) throw new Error('Please enter your email')
      if (password.length < 6) throw new Error('Password must be at least 6 characters')
      if (password !== confirm) throw new Error('Passwords do not match')

      await setPersistence(auth, browserLocalPersistence)
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: fullName.trim() })
      await ensureUserProfile()

      // Go to onboarding to collect medium/board|exam/course/subjects
      window.location.href = '/onboarding'
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  async function onSendCode() {
    try {
      setBusy(true); setError(null)
      if (!phone.startsWith('+')) throw new Error('Use E.164 format, e.g. +919876543210')
      const verifier = await ensureRecaptcha()
      confirmation.current = await signInWithPhoneNumber(auth, phone.trim(), verifier)
      alert('OTP sent. Check your phone.')
    } catch (e: any) {
      setError(e?.message || 'Failed to send code')
    } finally {
      setBusy(false)
    }
  }

  async function onVerifyCode() {
    try {
      setBusy(true); setError(null)
      if (!confirmation.current) throw new Error('Send the code first')
      const cred = await confirmation.current.confirm(code.trim() || '')
      // Refresh token to get custom claims
      await cred.user.getIdToken(true)
      // If you want to collect name after OTP, do it on onboarding; set displayName later.
      await ensureUserProfile()
      window.location.href = '/onboarding'
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Invalid code')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create your account</h2>
          <button className="rounded-full p-2 hover:bg-gray-100" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm ${tab === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setTab('email')}
          >
            Email & Password
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm ${tab === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setTab('phone')}
          >
            Phone (OTP)
          </button>
        </div>

        {tab === 'email' ? (
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border p-3"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="w-full rounded-xl border p-3"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl border p-3"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="w-full rounded-xl border p-3"
                placeholder="Confirm password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
              onClick={onEmailRegister}
              disabled={busy}
            >
              {busy ? 'Creating account…' : 'Register'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border p-3"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                id="send-otp-btn"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
                onClick={onSendCode}
                disabled={busy}
              >
                Send OTP
              </button>
              <input
                className="w-40 rounded-xl border p-3"
                placeholder="6-digit OTP"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                className="rounded-xl bg-green-600 px-4 py-3 font-medium text-white disabled:opacity-60"
                onClick={onVerifyCode}
                disabled={busy}
              >
                Verify
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  )
}