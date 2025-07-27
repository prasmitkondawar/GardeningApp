import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xrxswewhornndtjpwmkf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeHN3ZXdob3JubmR0anB3bWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTgzNDMsImV4cCI6MjA2OTE3NDM0M30.SCp6vqDTe5-TNusYp9JSMVWQCfwKg4tI0mxbP8Bir90';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
