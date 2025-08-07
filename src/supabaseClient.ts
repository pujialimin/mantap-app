import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://kuzsjdtluabnfkzyffgz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1enNqZHRsdWFibmZrenlmZmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNzI0NTQsImV4cCI6MjA2Njg0ODQ1NH0.D-OhicEqoxnnX8G-mwi2Y4X8_03dgDsy_flNj2YbYVI' // Ganti dengan anon key
);
