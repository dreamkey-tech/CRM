'use client'

import React, { useState } from 'react'
import {
  UploadCloud,
  Loader2,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  FileText,
  Film,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { useMediaUpload } from '../../context/MediaUploadContext'

export function GlobalUploadDock() {
  const {
    tasks,
    activities,
    isUploading,
    overallProgress,
    activeCount,
    completedCount,
    totalCount,
    cancelTask,
    retryTask,
    clearCompleted,
    isDockOpen,
    setIsDockOpen,
  } = useMediaUpload()

  const [isMinimized, setIsMinimized] = useState(false)

  if ((totalCount === 0 && activities.length === 0) || !isDockOpen) return null

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VIDEO':
        return <Film className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      case 'BROCHURE':
      case 'FLOOR_PLAN':
      case 'OTHER':
        return <FileText className="w-3.5 h-3.5 text-gold shrink-0" />
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <aside
      aria-label="Media Uploads Monitor"
      className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-surface border border-border shadow-2xl transition-all duration-200"
    >
      {/* Dock Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-secondary border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            {activities.length > 0 ? <Loader2 className="w-4 h-4 text-gold animate-spin" /> : <UploadCloud
              className={`w-4 h-4 ${
                isUploading ? 'text-gold animate-pulse' : 'text-foreground'
              }`}
            />}
            {isUploading && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gold" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground truncate">
              {activities.length > 0 ? activities[0].label : isUploading
                ? `Uploading (${completedCount}/${totalCount})`
                : tasks.some((task) => task.status === 'ERROR') ? 'Some files need attention' : 'Uploads Completed'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {completedCount > 0 && !isUploading && activities.length === 0 && (
            <button
              onClick={clearCompleted}
              className="text-[9px] font-bold uppercase tracking-wider text-muted-text hover:text-foreground px-2 py-0.5 border border-border hover:border-foreground/40 transition-colors"
            >
              Clear
            </button>
          )}

          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-foreground hover:bg-surface transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setIsDockOpen(false)}
            className="w-6 h-6 flex items-center justify-center text-muted-text hover:text-red-400 hover:bg-surface transition-colors"
            title="Close Dock"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar Top Rule */}
      <div className="h-1 w-full bg-border overflow-hidden">
        <div
          className={`h-full bg-gold transition-all duration-300 ease-out ${activities.length ? 'animate-pulse' : ''}`}
          style={{ width: activities.length ? '100%' : `${overallProgress}%` }}
        />
      </div>

      {activities.length > 0 && !isMinimized && <div className="p-3 space-y-2" role="status" aria-live="polite">
        {activities.map((activity) => <div key={activity.id} className="flex items-center gap-2 text-xs text-muted-text">
          <Loader2 className="w-3.5 h-3.5 text-gold animate-spin shrink-0" />{activity.label}
        </div>)}
      </div>}
      {/* Expanded File List */}
      {!isMinimized && (
        <div className="max-h-72 overflow-y-auto divide-y divide-border">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 flex items-center gap-3 hover:bg-surface-secondary/40 transition-colors"
            >
              {/* Thumbnail / Icon */}
              <div className="w-8 h-8 border border-border bg-background flex items-center justify-center shrink-0 overflow-hidden">
                {task.previewUrl ? (
                  <img
                    src={task.previewUrl}
                    alt={task.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getCategoryIcon(task.category)
                )}
              </div>

              {/* Info & Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-[10px] font-bold text-foreground truncate">
                    {task.filename}
                  </p>
                  <span className="text-[9px] font-mono text-muted-text shrink-0">
                    {task.status === 'COMPLETED'
                      ? '100%'
                      : task.status === 'ERROR'
                      ? 'Retry needed'
                      : task.status === 'ATTACHING' ? 'Saving...'
                      : task.status === 'CANCELLED' ? 'Cancelled'
                      : `${task.progress}%`}
                  </span>
                </div>

                {task.errorMessage && <p className="text-[10px] text-red-400 mb-1" role="alert">{task.errorMessage}</p>}
                {/* Progress bar per item */}
                <div className="h-1 w-full bg-border overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all duration-200 ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : task.status === 'ERROR'
                        ? 'bg-red-500'
                        : task.status === 'CANCELLED'
                        ? 'bg-muted-text'
                        : 'bg-gold'
                    }`}
                    style={{
                      width: `${
                        task.status === 'COMPLETED' ? 100 : task.progress
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-muted-text">
                  <span>{formatBytes(task.sizeBytes)}</span>
                  <span className="uppercase tracking-wider">
                    {task.category}
                  </span>
                </div>
              </div>

              {/* Status Action */}
              <div className="shrink-0 flex items-center gap-1">
                {task.status === 'COMPLETED' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {task.status === 'ERROR' && (
                  <button
                    onClick={() => retryTask(task.id)}
                    className="p-1 text-red-400 hover:text-foreground transition-colors"
                    title="Retry Upload"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                {(['UPLOADING', 'QUEUED', 'ERROR'].includes(task.status)) && (
                  <button
                    onClick={() => cancelTask(task.id)}
                    className="p-1 text-muted-text hover:text-red-400 transition-colors"
                    title={task.uploaded ? 'Discard uploaded file' : 'Cancel upload'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dock Footer */}
      <div className="px-3.5 py-2 bg-surface-secondary/70 border-t border-border flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-text">
        <span>Media uploads</span>
        <span className="text-foreground">{activities.length ? 'Working...' : `${overallProgress}% Total`}</span>
      </div>
    </aside>
  )
}
