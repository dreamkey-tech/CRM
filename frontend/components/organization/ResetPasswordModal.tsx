'use client'

import React, { useState } from 'react'
import { X, Lock, Sparkles, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { generateStrongPassword } from '../../utils/password'
import { toast } from '../../utils/toast'
import { resetEmployeePasswordApi } from '../../api/organization'
import type { Employee } from '../../types/organization'

interface ResetPasswordModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
}

export function ResetPasswordModal({ employee, isOpen, onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !employee) return null

  const handleGenerate = () => {
    const pwd = generateStrongPassword(14)
    setPassword(pwd)
    setShowPassword(true)
    toast.info('Strong Password Generated', 'A secure 14-character password has been generated.')
  }

  const handleCopy = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied', 'Password copied to clipboard.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Validation Error', 'Password must be at least 6 characters.')
      return
    }

    try {
      setSubmitting(true)
      const res = await resetEmployeePasswordApi(employee.id, password)
      toast.success('Password Reset', res.message || 'Password has been updated.')
      onClose()
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to reset password.'
      toast.error('Reset Failed', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-surface border border-border w-full max-w-md flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Reset Password
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-text hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-muted-text">
            Setting a new password for <span className="font-bold text-foreground">{employee.name || employee.email}</span> ({employee.email}). Previous sessions will be invalidated.
          </p>

          <div className="space-y-2 p-4 bg-surface-secondary border border-border">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-text">
                New Password *
              </label>
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-gold hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                Generate
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter or generate password"
                  className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-background border border-border text-foreground focus:outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                type="button"
                disabled={!password}
                onClick={handleCopy}
                className="px-3 py-2 bg-background border border-border text-foreground hover:bg-surface text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground border border-border bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !password}
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-wider bg-foreground text-background hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50 font-bold"
            >
              {submitting ? 'Updating...' : 'Set New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
