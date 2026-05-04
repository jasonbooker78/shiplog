import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://wwvsfzqqapwfumalluhs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dnNmenFxYXB3ZnVtYWxsdWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzM4MjAsImV4cCI6MjA5MzQwOTgyMH0.oEcVx6V5NHszM6GxrULfSqkPQlElNAiqCJDOYKFjSXU'
)
