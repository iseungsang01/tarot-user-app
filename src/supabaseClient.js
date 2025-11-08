import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gvoedaagemotwuzmfxfe.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2b2VkYWFnZW1vdHd1em1meGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMjE2NTgsImV4cCI6MjA3NTg5NzY1OH0.l7x-VhmnuvXhVtReXrT5TtkxHUFFJXkk90fZ3P5UyCk' // 여기에 API Key 입력

export const supabase = createClient(supabaseUrl, supabaseAnonKey)