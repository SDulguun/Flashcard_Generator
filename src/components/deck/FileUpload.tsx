'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface GeneratedCard {
  front: string
  back: string
}

interface FileUploadProps {
  onCardsGenerated: (cards: GeneratedCard[], title: string, description: string) => void
}

export default function FileUpload({ onCardsGenerated }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = ['.pdf', '.docx', '.doc', '.pptx', '.xlsx', '.txt', '.md', '.rtf', '.csv', '.html', '.htm', '.odt', '.odp']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(fileExtension)) {
      setError('Unsupported file type. Supported: PDF, Word, PowerPoint, Excel, TXT, MD, RTF, CSV, HTML, ODT, ODP')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFileName(file.name)
    setError('')
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards')
      }

      if (data.cards && data.cards.length > 0) {
        onCardsGenerated(data.cards, data.title, data.description)
      } else {
        setError('No flashcards were generated. Try a different file.')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-bold text-[var(--primary-600)] mb-4">
        Generate from File
      </h2>

      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${isDragging ? 'border-[var(--primary-500)] bg-[var(--primary-50)]' : 'border-[var(--border-color)] hover:border-[var(--primary-300)]'}
          ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.pptx,.xlsx,.txt,.md,.rtf,.csv,.html,.htm,.odt,.odp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isLoading ? (
          <div className="py-4">
            <span className="text-4xl block mb-3 animate-bounce">🤖</span>
            <p className="text-[var(--primary-600)] font-semibold">
              Generating flashcards from {fileName}...
            </p>
            <p className="text-[var(--slate-400)] text-sm mt-1">
              This may take a moment
            </p>
          </div>
        ) : (
          <div className="py-4">
            <span className="text-4xl block mb-3">📤</span>
            <p className="text-[var(--primary-600)] font-semibold">
              Drop your file here or click to browse
            </p>
            <p className="text-[var(--slate-400)] text-sm mt-1">
              PDF, Word, PowerPoint, Excel, TXT, CSV, HTML & more (max 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-[var(--error-light)] border border-[var(--error)] rounded-xl">
          <p className="text-[var(--error)] text-sm">{error}</p>
        </div>
      )}

      <p className="text-[var(--slate-400)] text-xs mt-4 text-center">
        ✨ AI will automatically create flashcards from your document
      </p>
    </Card>
  )
}
