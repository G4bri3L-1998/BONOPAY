import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gbwamtrqkrgplrfzrvm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdid2FtdHJ3cWtyZ3BscmZ6cnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzEyMjgsImV4cCI6MjA5NzIwNzIyOH0.YglpXdpbs9c3riqlUjeVhd0jKppAqxHvBuWIn79PkiE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
