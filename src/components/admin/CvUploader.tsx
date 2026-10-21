import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, errorMessage } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'
import { aboutFallback } from '@/data/fallback'
import { Button, Card, Input, useToast } from './ui'

const BUCKET = 'cv'
const CV_PATH = 'resume.pdf'
const MAX_MB = 10

/**
 * Uploads a PDF to the public `cv` bucket and points the about section's
 * cv_url at it. The whole about row is preserved; only cv_url changes.
 */
export default function CvUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [fromDb, setFromDb] = useState(false)
  const toast = useToast()
  const qc = useQueryClient()

  const refresh = async () => {
    const { data } = await supabase.from('site_content').select('content').eq('section', 'about').maybeSingle()
    const url = (data?.content as { cv_url?: string } | null)?.cv_url
    setCurrentUrl(url || aboutFallback.cv_url)
    setFromDb(Boolean(url))
  }
  useEffect(() => {
    void refresh()
  }, [])

  const upload = async () => {
    if (!file) return
    if (file.type !== 'application/pdf') return toast({ title: 'PDF only', tone: 'error' })
    if (file.size > MAX_MB * 1024 * 1024) return toast({ title: `Keep it under ${MAX_MB} MB`, tone: 'error' })
    setUploading(true)
    try {
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(CV_PATH, file, { upsert: true, contentType: 'application/pdf' })
      if (upErr) throw upErr
      const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(CV_PATH).data
      // Cache-bust so a replaced file is picked up immediately.
      const url = `${publicUrl}?t=${Date.now()}`

      const { data: cur } = await supabase.from('site_content').select('content').eq('section', 'about').maybeSingle()
      const base = (cur?.content as Record<string, Json> | null) ?? (aboutFallback as unknown as Record<string, Json>)
      const { error: rowErr } = await supabase
        .from('site_content')
        .upsert({ section: 'about', content: { ...base, cv_url: url }, updated_at: new Date().toISOString() })
      if (rowErr) throw rowErr

      toast({ title: 'CV uploaded', description: 'The download button now serves the new file.', tone: 'ok' })
      setFile(null)
      qc.invalidateQueries({ queryKey: ['site_content', 'about'] })
      await refresh()
    } catch (err) {
      toast({ title: 'Upload failed', description: errorMessage(err), tone: 'error' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card title="CV">
      <p className="text-sm text-bone-dim">
        Current file:{' '}
        <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="link-line text-bone">
          {fromDb ? 'uploaded CV' : 'bundled site default'}
        </a>
        {!fromDb && <span className="label ml-2">(no upload yet)</span>}
      </p>
      <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="flex items-center gap-3">
        <Button onClick={upload} disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Upload new CV'}
        </Button>
        {file && <span className="label">{file.name}</span>}
      </div>
    </Card>
  )
}
