'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginApi } from '../../api/auth'
import { useAuthStore } from '../../store/useAuthStore'
import { handleFormApiError } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import { loginSchema, type LoginFormData } from '../../zod/auth'

export function AuthCard() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // React Hook Form for Sign In
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const isSubmitting = loginForm.formState.isSubmitting

  const handleLogin = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const response = await loginApi(data)
      setUser(response.user)
      toast.success('Welcome back!', `Signed in as ${response.user.email}`)
      router.push('/dashboard')
    } catch (err: unknown) {
      handleFormApiError<LoginFormData>(err, {
        setError: loginForm.setError,
        setBannerError: setServerError,
        toastTitle: 'Sign in failed',
      })
    }
  }

  /*
   * ─────────────────────────────────────────────────────────────
   * Registration is commented out:
   * In DreamKey CRM, all employee accounts are provisioned
   * internally by the Super Admin via the Team Management Portal.
   * ─────────────────────────────────────────────────────────────
   *
   * const handleRegister = async (data: RegisterFormData) => {
   *   // ...
   * }
   */

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 sm:p-8 rounded-2xl bg-[#171717]/90 backdrop-blur-xl border border-[#262626] shadow-2xl shadow-black/80 transition-all">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#111111] border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10 mb-2">
          {/* Key Icon */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8F8F6]">
          DreamKey <span className="text-[#D4AF37]">CRM</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF]">
          Enterprise Real Estate & Deals Workspace
        </p>
      </div>

      {/* Server Inline Error Banner */}
      {serverError && (
        <div className="p-3.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-2.5 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-relaxed">{serverError}</span>
        </div>
      )}

      {/* Sign In Form */}
      <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
        <div>
          <label className="block text-xs font-semibold text-[#F8F8F6] mb-1.5 tracking-wide">
            Work Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              {...loginForm.register('email')}
              placeholder="agent@dreamkey.io"
              className="w-full px-3.5 py-3 bg-[#0B0B0B] border border-[#262626] focus:border-[#D4AF37] rounded-xl text-sm text-[#F8F8F6] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
          {loginForm.formState.errors.email && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {loginForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#F8F8F6] tracking-wide">
              Password
            </label>
            <span className="text-[11px] text-[#6B7280]">
              CRM Protected
            </span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...loginForm.register('password')}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 pr-10 bg-[#0B0B0B] border border-[#262626] focus:border-[#D4AF37] rounded-xl text-sm text-[#F8F8F6] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F8F8F6] transition p-1"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {loginForm.formState.errors.password && (
            <p className="mt-1.5 text-xs text-rose-400 font-medium">
              {loginForm.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button with Gold Accent */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-[#0B0B0B] bg-gradient-to-r from-[#D4AF37] to-[#E6C75A] hover:brightness-110 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-50 transition-all shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2 text-[#0B0B0B]">
              <svg className="animate-spin h-4 w-4 text-[#0B0B0B]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Authenticating...
            </span>
          ) : (
            'Sign In to CRM'
          )}
        </button>
      </form>

      {/* Admin Help Footer */}
      <div className="pt-2 text-center border-t border-[#262626]">
        <p className="text-xs text-[#6B7280]">
          Need account access or password reset?
        </p>
        <p className="text-xs font-medium text-[#D4AF37] mt-0.5">
          Contact your Super Administrator
        </p>
      </div>
    </div>
  )
}
