document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // Supabase instance (SAFE)
    // =========================
    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("❌ Supabase not initialized!");
        return;
    }

    // =========================
    // 1. Load departments
    // =========================
    async function loadDepartments() {

        const select = document.getElementById('department_select');
        if (!select) return;

        const { data, error } = await supabase
            .from('departments')
            .select('code, department_name')
            .order('department_name', { ascending: true });

        if (error) {
            console.error("❌ departments error:", error);
            return;
        }

        select.innerHTML = '<option value="" disabled selected>اختر القسم...</option>';

        data.forEach(dept => {
            const opt = document.createElement('option');
            opt.value = dept.code;
            opt.textContent = dept.department_name;
            select.appendChild(opt);
        });
    }

    // =========================
    // 2. Submit form
    // =========================
    const form = document.getElementById('feedbackForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectedType = document.querySelector('input[name="feedback_type"]:checked');

            if (!selectedType) {
                alert('يرجى اختيار نوع الحالة');
                return;
            }

            const dept = document.getElementById('department_select')?.value;

            const formData = {
                report_date: new Date().toISOString().split('T')[0],
                patient_name: document.getElementById('patient_name').value.trim(),
                file_number: document.getElementById('file_number').value.trim(),
                reporter_name: document.getElementById('reporter_name').value.trim(),
                phone_number: document.getElementById('phone_number').value.trim(),
                feedback_type: selectedType.value,
                assigned_departments: dept ? [dept] : [],
                notes: document.getElementById('notes').value.trim()
            };

            console.log("📦 Sending:", formData);

            const { error } = await supabase
                .from('feedback')
                .insert([formData]);

            if (error) {
                console.error("❌ insert error:", error);
                alert("خطأ: " + error.message);
                return;
            }

            alert("تم التسجيل بنجاح!");
            form.reset();
        });
    }

    // =========================
    // 3. radio UI effect
    // =========================
    document.querySelectorAll('input[name="feedback_type"]').forEach(radio => {
        radio.addEventListener('change', function () {

            document.querySelectorAll('.radio-label').forEach(label => {
                label.style.opacity = "0.6";
            });

            this.closest('.radio-label').style.opacity = "1";
        });
    });

    // =========================
    // 4. init
    // =========================
    loadDepartments();

});