document.addEventListener("DOMContentLoaded", () => {
    const departmentNames = {
        finance: "دائرة الشؤون المالية",
        it_statistics: "دائرة تقنية المعلومات والإحصاء",
        quality: "دائرة الجودة وسلامة المرضى",
        training: "دائرة التدريب والتطوير المهني",
        public_relations: "قسم العلاقات العامة والإعلام",
        engineering: "قسم الهندسة والصيانة",
        general_services: "قسم الخدمات العامة والنقليات",
        security: "قسم الأمن والسلامة",
        environmental_health: "قسم الصحة البيئية",
        laboratory: "قسم المختبرات الطبية",
        radiology: "قسم الأشعة والتصوير الطبي",
        pharmacy: "قسم الصيدلة",
        physiotherapy: "قسم العلاج الطبيعي",
        clinical_nutrition: "قسم التغذية العلاجية",
        respiratory: "قسم العلاج التنفسي",
        infection_control: "قسم مكافحة العدوى",
        er_nursing: "تمريض الحوادث والطوارئ",
        er_doctors: "أطباء الحوادث والطوارئ",
        internal_medicine: "أطباء الباطنية",
        children_department: "قسم الأطفال",
        pediatric_doctors: "أطباء الأطفال",
        general_surgery: "أطباء الجراحة العامة",
        maternity_nursing: "تمريض النساء والولادة",
        obgyn_doctors: "أطباء النساء والولادة",
        icu_nursing: "تمريض العناية",
        anesthesia_doctors: "أطباء التخدير",
        operation_nursing: "تمريض العمليات",
        outpatient_nursing: "تمريض العيادات الخارجية",
        dermatology_doctors: "أطباء الجلدية",
        ent_doctors: "أطباء الأنف والأذن",
        ophthalmology_doctors: "أطباء العيون",
        mental_health: "قسم الصحة النفسية",
        kidney_nursing: "تمريض أمراض الكلى والغسيل الكلوي",
        kidney_doctors: "أطباء أمراض الكلى والغسيل الكلوي",
        orthopedic_doctors: "أطباء العظام",
        senior_women_nursing: "تمريض النساء كبار",
        nursery_nursing: "تمريض الحضانة",
        delivery_room_nursing: "تمريض صالة الولادة",
        medical_surgical_nursing: "تمريض الباطنية والجراحة"
    };

    const supabase = window.supabaseClient;
    if (!supabase) { console.error("Supabase not loaded!"); return; }

    let feedbackData = [];
    let selectedRowId = null;

    // تشغيل المهام الأساسية
    fetchFeedbackData();
    loadDepartments();

    // --- جلب الأقسام من قاعدة البيانات (ديناميكي) ---
    async function loadDepartments() {
        const container = document.getElementById("departmentsList");
        if (!container) return;

        const { data, error } = await supabase
            .from("departments")
            .select("code, department_name")
            .order("department_name");

        if (error) { console.error("Error loading depts:", error); return; }

        // تحويل البيانات لقائمة اختيار (Checkbox)
        container.innerHTML = data.map(dept => `
            <label style="display:block; padding:5px;">
                <input type="checkbox" value="${dept.code}"> ${dept.department_name}
            </label>
        `).join("");
    }

    // --- جلب البيانات ---
    async function fetchFeedbackData() {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) { console.error("Fetch error:", error); return; }
        feedbackData = data;
        renderTable();
    }

    // --- عرض الجدول ---
    function renderTable() {
        const tbody = document.getElementById("feedbackTableBody");
        if (!tbody) return;

        tbody.innerHTML = feedbackData.map((row, index) => {
            return `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.report_date}</td>
                    <td>${row.patient_name}</td>
                    <td>${row.file_number}</td>
                    <td>${row.reporter_name}</td>
                    <td>${row.phone_number || '-'}</td>
                    <td>${row.feedback_type}</td>
                    <td><button onclick="openAssign(${row.id})">تحويل</button></td>
                    <td><button onclick="toggleDetails(${index})">عرض</button></td>
                    <td><button onclick="printCase(${index})">طباعة</button></td>
                </tr>
            `;
        }).join("");
    }

    // --- وظائف الـ Modal ---
    window.openAssign = (id) => {
        selectedRowId = id;
        document.getElementById("assignModal").style.display = "block";
    };

    window.closeModal = () => {
        document.getElementById("assignModal").style.display = "none";
    };

    window.saveAssignment = async () => {
        const checked = document.querySelectorAll("#departmentsList input:checked");
        const selectedDepts = Array.from(checked).map(x => x.value);

        const { error } = await supabase
            .from('feedback')
            .update({ assigned_departments: selectedDepts })
            .eq('id', selectedRowId);

        if (error) { alert("خطأ: " + error.message); return; }
        alert("تم التحويل بنجاح");
        closeModal();
        fetchFeedbackData();
    };

    // --- الدوال المطلوبة (toggleDetails & printCase) ---
    window.toggleDetails = (index) => {
        const row = document.getElementById(`details-${index}`);
        if (row) {
            row.style.display = row.style.display === "none" ? "table-row" : "none";
        }
    };

    window.printCase = (index) => {
        const row = feedbackData[index];
        const win = window.open("", "_blank");
        win.document.write(`
            <html dir="rtl">
            <head><title>طباعة الحالة</title></head>
            <body>
                <h2>بيانات الحالة: ${row.patient_name}</h2>
                <p><b>التاريخ:</b> ${row.report_date}</p>
                <p><b>نوع الحالة:</b> ${row.feedback_type}</p>
                <p><b>ملاحظات:</b> ${row.notes || '-'}</p>
            </body>
            </html>
        `);
        win.print();
    };

    // --- تحديث دالة loadDepartments لتكون "مرئية دائماً" في المودال ---
    async function loadDepartments() {
        const container = document.getElementById("departmentsList");
        if (!container) return;

        // تنسيق CSS لضمان سهولة التصفح (Up and Down)
        container.style.maxHeight = "300px";
        container.style.overflowY = "auto";
        container.style.border = "1px solid #ccc";
        container.style.padding = "10px";

        const { data, error } = await supabase
            .from("departments")
            .select("code, department_name")
            .order("department_name");

        if (error) { console.error(error); return; }

        container.innerHTML = data.map(dept => `
            <label style="display:block; padding:8px; border-bottom:1px solid #eee; cursor:pointer;">
                <input type="checkbox" value="${dept.code}"> ${dept.department_name}
            </label>
        `).join("");
    }

    function renderTable() {
        const tbody = document.getElementById("feedbackTableBody");
        if (!tbody) return;

        tbody.innerHTML = feedbackData.map((row, index) => {
            const depts = (row.assigned_departments || [])
                .map(code => departmentNames[code] || code)
                .join(" ، ");
            return `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.report_date}</td>
                    <td>${row.patient_name}</td>
                    <td>${row.file_number}</td>
                    <td>${row.reporter_name}</td>
                    <td>${row.phone_number || '-'}</td>
                    <td>${row.feedback_type}</td>
                    <td><button onclick="openAssign(${row.id})">تحويل</button></td>
                    <td><button onclick="toggleDetails(${index})">عرض</button></td>
                    <td><button onclick="printCase(${index})">طباعة</button></td>
                </tr>
                <tr id="details-${index}" style="display:none; background-color:#f9f9f9;">
                    <td colspan="10">
                        <b>الأقسام المحولة:</b> ${depts || "لا يوجد"}<br>
                        <b>الملاحظات:</b> ${row.notes || "-"}
                    </td>
                </tr>
            `;
        }).join("");
    }

});
