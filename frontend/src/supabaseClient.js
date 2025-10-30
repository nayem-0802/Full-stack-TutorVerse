
// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = 'https://jnpyozclftbwkhjkkico.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucHlvemNsZnRid2toamtraWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTE5MjgsImV4cCI6MjA2MzY4NzkyOH0.7ubw7Zz4cdj-fklUdDWGk2ZSceR3a46HinvYkIDKjQg'
// const supabase = createClient(supabaseUrl, supabaseKey)
// export default  supabase



import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase