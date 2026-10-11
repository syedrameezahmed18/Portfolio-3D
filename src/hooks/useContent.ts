import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'
import {
  localImageFor,
  projectsFallback,
  skillsFallback,
  type Project,
  type Skill,
} from '@/data/fallback'

/**
 * A `site_content` row merged over its local fallback. Any failure, missing
 * config or missing row yields the fallback untouched.
 */
export function useSiteContent<T extends object>(section: string, fallback: T): T {
  const { data, isError } = useQuery({
    queryKey: ['site_content', section],
    enabled: isSupabaseConfigured,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section', section)
        .maybeSingle()
      if (error) throw error
      return (data?.content ?? null) as Partial<T> | null
    },
  })
  if (isError || !data) return fallback
  return { ...fallback, ...data }
}

export function useProjects(): Project[] {
  const { data, isError } = useQuery({
    queryKey: ['projects'],
    enabled: isSupabaseConfigured,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from('projects').select('*').order('sort_order')
      if (error) throw error
      return (data ?? []).map((p: Tables<'projects'>) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image_url || localImageFor(p.title),
        tags: p.tags ?? [],
        liveUrl: p.live_url,
        githubUrl: p.github_url,
        isContribution: p.is_contribution,
      }))
    },
  })
  if (isError || !data || data.length === 0) return projectsFallback
  return data
}

export function useSkills(): Skill[] {
  const { data, isError } = useQuery({
    queryKey: ['skills'],
    enabled: isSupabaseConfigured,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category')
        .order('sort_order')
      if (error) throw error
      return (data ?? []).map((s: Tables<'skills'>) => ({
        name: s.name,
        percentage: s.percentage,
        category: s.category,
      }))
    },
  })
  if (isError || !data || data.length === 0) return skillsFallback
  return data
}
