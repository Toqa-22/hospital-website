// assets/js/supabase-client.js

// 1. استخدام القيم المعرفة
const SUPABASE_URL = 'https://ztrmbwjmlaujzcvvncms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cm1id2ptbGF1anpjdnZuY21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNDIzMjcsImV4cCI6MjA5NzYxODMyN30.LnNBk3tLuX8ZM2iAKxxbnhP-nFhgn-ESJ-3HG84Gwbs';

// 2. تهيئة العميل باستخدام المتغيرات الصحيحة
// نستخدم window.supabaseClient ليصبح متاحاً في كل ملفات المشروع
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);