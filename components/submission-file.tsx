'use client'

import { useEffect, useState } from 'react'
import { getSubmissionFile, getProblemStatement } from '@/lib/teacherService'
import { errorMessage } from '@/lib/api-client'
import { RequestState } from './request-state'

export function SubmissionFile({ id, filename }: { id: string; filename: string }) {
  return <AuthenticatedFile id={id} filename={filename} kind="submission" />
}

export function ProblemStatement({ id }: { id: string }) {
  const [opened, setOpened] = useState(false)
  return opened ? <AuthenticatedFile id={id} filename={`problem-${id}.pdf`} kind="statement" />
    : <button onClick={() => setOpened(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">View problem statement PDF</button>
}

function AuthenticatedFile({ id, filename, kind }: { id: string; filename: string; kind: 'submission' | 'statement' }) {
  const [file, setFile] = useState<{ url: string; type: string } | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    let url: string | undefined
    setFile(null)
    setError('')
    const request = kind === 'statement' ? getProblemStatement(id) : getSubmissionFile(id)
    request.then(blob => {
      if (!active) return
      url = URL.createObjectURL(blob)
      setFile({ url, type: blob.type })
    }).catch(reason => { if (active) setError(errorMessage(reason)) })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [id, kind, attempt])
  return <div className="space-y-4">
    <RequestState loading={!file && !error} error={error} onRetry={() => setAttempt(value => value + 1)} />
    {file && <>
      {['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)
        ? <img src={file.url} alt="Submitted flowchart" className="w-full max-h-[600px] object-contain bg-secondary rounded-lg" />
        : file.type === 'application/pdf'
          ? <iframe src={file.url} title={kind === 'statement' ? 'Problem statement PDF' : 'Submitted flowchart PDF'} className="w-full h-[600px] border border-border rounded-lg" />
          : <p className="text-muted-foreground">Download this file to view the flowchart.</p>}
      <a href={file.url} download={filename} className="inline-block px-4 py-2 border border-border rounded-lg hover:bg-secondary">{kind === 'statement' ? 'Download problem statement' : 'Download flowchart'}</a>
    </>}
  </div>
}
