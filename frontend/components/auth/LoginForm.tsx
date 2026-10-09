'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from '../../context/NavigationLoaderContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginApi } from '../../api/auth'
import { useAuthStore } from '../../store/useAuthStore'
import { handleFormApiError } from '../../utils/errorHandler'
import { toast } from '../../utils/toast'
import { loginSchema, type LoginFormData } from '../../zod/auth'

export function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [staySignedIn, setStaySignedIn] = useState(true)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
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

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* ── Mobile-Only Centered Brand Logo ── */}
      <div className="lg:hidden flex flex-col items-center justify-center text-center pb-2">
        <div className="relative w-48 h-16 sm:w-56 sm:h-20 mb-1">
          <Image
            src="/logorbg.png"
            alt="DreamKey Logo"
            fill
            priority
            className="object-contain object-center drop-shadow-[0_4px_16px_rgba(212,175,55,0.35)]"
          />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase leading-none">
          DREAM<span className="text-gold">KEY</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1.5 mb-2">
          <span className="h-px w-4 bg-gold/60" />
          <span className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase whitespace-nowrap">
            UNLOCKING DREAMS
          </span>
          <span className="h-px w-4 bg-gold/60" />
        </div>
      </div>

      {/* Portal Access Badge */}
      <div>
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md bg-gold/15 text-dark-gold text-xs font-bold tracking-wider uppercase">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Portal Access</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-3">
          Welcome back
        </h1>
        <p className="text-sm text-muted-text mt-1.5">
          Sign in to your DreamKey CRM workspace.
        </p>
      </div>

      {/* User-friendly Error Alert */}
      {serverError && (
        <div className="p-3.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
          <svg className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-relaxed font-medium">{serverError}</span>
        </div>
      )}

      {/* Login Form */}
      <form
        className="space-y-4"
        action="#"
        method="POST"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          loginForm.handleSubmit(handleLogin)(e)
        }}
      >
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Email address
          </label>
          <div className="relative flex items-center bg-surface-secondary border border-border focus-within:border-gold focus-within:bg-surface focus-within:ring-2 focus-within:ring-gold/20 rounded-xl px-3.5 py-2.5 transition-all">
            <svg
              className="w-4 h-4 text-muted-text shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              {...loginForm.register('email')}
              placeholder="j.vanderbilt@dreamkey.com"
              className="w-full bg-transparent pl-3 text-sm text-foreground placeholder:text-muted-text focus:outline-none"
            />
          </div>
          {loginForm.formState.errors.email && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {loginForm.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toast.info(
                  'Password Reset',
                  'Please contact your Super Administrator (support@dreamkeykol.com) to reset your credentials.'
                )
              }}
              className="py-1 px-1.5 -mr-1.5 text-xs font-semibold text-dark-gold hover:text-gold active:opacity-60 transition cursor-pointer touch-manipulation select-none"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center bg-surface-secondary border border-border focus-within:border-gold focus-within:bg-surface focus-within:ring-2 focus-within:ring-gold/20 rounded-xl px-3.5 py-2.5 transition-all">
            <svg
              className="w-4 h-4 text-muted-text shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...loginForm.register('password')}
              placeholder="••••••••••••••••"
              className="w-full bg-transparent pl-3 pr-10 text-sm text-foreground placeholder:text-muted-text focus:outline-none tracking-wider"
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowPassword((prev) => !prev)
              }}
              onPointerDown={(e) => {
                // Prevent input from blurring and keyboard flickering on mobile
                e.preventDefault()
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 text-muted-text hover:text-foreground active:text-gold transition cursor-pointer touch-manipulation"
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {loginForm.formState.errors.password && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {loginForm.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Remember / Security Row */}
        <div className="flex items-center justify-between text-xs py-1">
          <label className="flex items-center gap-2 text-foreground cursor-pointer select-none font-medium">
            <input
              type="checkbox"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
              className="w-4 h-4 rounded border-border text-gold focus:ring-gold accent-gold cursor-pointer"
            />
            <span className="hidden sm:inline">Remember me</span>
            <span className="sm:hidden">Remember me</span>
          </label>
        </div>

        {/* Gold Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-black bg-gold hover:bg-light-gold active:scale-[0.99] active:bg-dark-gold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50 transition-all shadow-md shadow-gold/20 cursor-pointer touch-manipulation"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing In...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Restricted Enterprise System Notice */}
      <div className="pt-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-foreground tracking-wider uppercase">
          <svg className="w-3.5 h-3.5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Restricted Enterprise System</span>
        </div>
        <p className="text-[11px] text-muted-text leading-relaxed max-w-sm mx-auto">
          Authorized personnel only. For credential allocation or hardware token provisioning, contact internal IT Operations at{' '}
          <a href="mailto:it-support@dreamkey.com" className="text-foreground font-semibold underline underline-offset-1 hover:text-gold">
            support@dreamkeykol.com
          </a>.
        </p>
      </div>
    </div>
  )
}
