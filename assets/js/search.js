document.addEventListener("DOMContentLoaded", () => {

    // ربط نموذج التقرير لضمان عمل مفتاح Enter
    const reportForm = document.getElementById("reportForm");
    if (reportForm) {
        reportForm.addEventListener("submit", (e) => {
            e.preventDefault(); // منع إعادة تحميل الصفحة
            generateReport();
        });
    }

    document.getElementById("feedbackReportBtn").addEventListener("click", generateFeedbackTypeReport);

async function generateFeedbackTypeReport() {

    const selectedTypes = [];

    if (document.getElementById("thanksCheck")?.checked) {
        selectedTypes.push("شكر");
    }

    if (document.getElementById("suggestionCheck")?.checked) {
        selectedTypes.push("إقتراح");
    }

    if (document.getElementById("complaintCheck")?.checked) {
        selectedTypes.push("شكوى");
    }

    if (selectedTypes.length === 0) {
        alert("يرجى اختيار نوع حالة واحد على الأقل");
        return;
    }

    const btn = document.getElementById("feedbackReportBtn");
    btn.disabled = true;
    btn.textContent = "جاري إنشاء التقرير...";

    try {

        const { data, error } = await supabase
            .from("feedback")
            .select("feedback_type")
            .in("feedback_type", selectedTypes);

        if (error) throw error;

        if (!data || data.length === 0) {
            alert("لا توجد بيانات مطابقة.");
            return;
        }

        const summary = {
            "شكر": 0,
            "إقتراح": 0,
            "شكوى": 0
        };

        data.forEach(row => {
            if (summary[row.feedback_type] !== undefined) {
                summary[row.feedback_type]++;
            }
        });

        const total =
            summary["شكر"] +
            summary["إقتراح"] +
            summary["شكوى"];

        const reportHTML = `
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير الشكاوي والاقتراحات</title>
            <style>
                body{
                    font-family:Tahoma,sans-serif;
                    padding:40px;
                    direction:rtl;
                }

                h1{
                    text-align:center;
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                th,td{
                    border:1px solid #000;
                    padding:10px;
                    text-align:center;
                }

                th{
                    background:#f0f0f0;
                }

                .total{
                    margin-top:20px;
                    font-size:20px;
                    font-weight:bold;
                }
            </style>
        </head>
        <body>

            <h1>تقرير الشكاوي والاقتراحات</h1>

            <table>
                <tr>
                    <th>نوع الحالة</th>
                    <th>العدد</th>
                </tr>

                ${selectedTypes.includes("شكر")
                    ? `<tr><td>شكر</td><td>${summary["شكر"]}</td></tr>`
                    : ""}

                ${selectedTypes.includes("إقتراح")
                    ? `<tr><td>إقتراح</td><td>${summary["إقتراح"]}</td></tr>`
                    : ""}

                ${selectedTypes.includes("شكوى")
                    ? `<tr><td>شكوى</td><td>${summary["شكوى"]}</td></tr>`
                    : ""}
            </table>

            <div class="total">
                المجموع الكلي: ${total}
            </div>

        </body>
        </html>
        `;

        const win = window.open("", "_blank", "width=900,height=700");

        if (!win) {
            alert("تم حظر النافذة المنبثقة");
            return;
        }

        win.document.write(reportHTML);
        win.document.close();

        setTimeout(() => {
            win.print();
        }, 500);

    } catch (err) {
        console.error(err);
        alert("خطأ في إنشاء التقرير: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "إنشاء تقرير الشكاوي";
    }
}

    async function generateReport() {
        const fromDate = document.getElementById("fromDate")?.value;
        const toDate = document.getElementById("toDate")?.value;

        if (!fromDate || !toDate) {
            alert("يرجى اختيار التاريخ (من وإلى)");
            return;
        }

        const btn = document.getElementById("generateReportBtn");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "جاري الإنشاء...";
        }

        try {
            // استخدام صيغة ISO المحددة لضمان التوافق مع +00 في القاعدة
            const startISO = `${fromDate}T00:00:00Z`;
            const endISO = `${toDate}T23:59:59Z`;

            const { data, error } = await supabase
                .from('daily_events')
                .select('case_type')
                .gte('incident_time', startISO)
                .lte('incident_time', endISO);

            if (error) throw error;

            if (!data || data.length === 0) {
                alert("لا توجد بيانات للفترة المختارة.");
                return;
            }

            // تجميع البيانات
            const summary = {};
            data.forEach(item => {
                const type = item.case_type || "غير محدد";
                summary[type] = (summary[type] || 0) + 1;
            });

            // بناء محتوى التقرير
            let total = 0;
            let rows = "";
            for (const type in summary) {
                total += summary[type];
                rows += `<tr><td>${type}</td><td>${summary[type]}</td></tr>`;
            }

            const reportHTML = `
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Tahoma, sans-serif; padding: 40px; direction: rtl; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #333; padding: 10px; text-align: center; }
                    th { background: #eee; }
                    .footer-total { margin-top: 20px; font-weight: bold; font-size: 18px; }
                </style>
            </head>
            <body>
                <h1>تقرير الأحداث اليومية</h1>
                <p>الفترة من: ${fromDate} إلى: ${toDate}</p>
                <table>
                    <tr><th>نوع الحالة</th><th>العدد</th></tr>
                    ${rows}
                </table>
                <div class="footer-total">المجموع الكلي: ${total}</div>
            </body>
            </html>`;

            // فتح النافذة
            const win = window.open("", "_blank", "width=800,height=600");
            if (!win) {
                alert("تم حظر النافذة المنبثقة! يرجى السماح بها من إعدادات المتصفح.");
                return;
            }
            win.document.write(reportHTML);
            win.document.close();
            
            // الطباعة
            setTimeout(() => { win.print(); }, 500);

        } catch (err) {
            console.error(err);
            alert("خطأ في إنشاء التقرير: " + err.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = "إنشاء التقرير";
            }
        }
    }

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

    if (!supabase) {
        console.error("❌ Supabase not initialized!");
        return;
    }

    // =========================
    // EVENTS TABLE
    // =========================
    const searchBtn = document.getElementById('searchBtn');
    const showAllBtn = document.getElementById('showAllBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', searchDailyEvents);
    }

    if (showAllBtn) {
        showAllBtn.addEventListener('click', loadAllData);
    }

    loadAllData();

    // =========================
    // LOAD ALL DAILY EVENTS
    // =========================
    async function loadAllData() {

        const resultsBody = document.getElementById('resultsBody');
        if (!resultsBody) return;

        resultsBody.innerHTML = "<tr><td colspan='10'>جاري التحميل...</td></tr>";

        const { data, error } = await supabase
            .from('daily_events')
            .select('*')
            .order('incident_time', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        renderTable(data);
    }

    // =========================
    // SEARCH EVENTS
    // =========================
    async function searchDailyEvents() {
        const searchTerm = document.getElementById('generalSearch')?.value;

        if (!searchTerm) {
            loadAllData();
            return;
        }

        const resultsBody = document.getElementById('resultsBody');
        resultsBody.innerHTML = "<tr><td colspan='10'>جاري البحث...</td></tr>";

        const filterString = `patient_name.ilike.%${searchTerm}%,file_number.ilike.%${searchTerm}%,case_type.ilike.%${searchTerm}%,police_officer_name.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%,period.ilike.%${searchTerm}%`;

        const { data, error } = await supabase
            .from('daily_events')
            .select('*')
            .or(filterString)
            .order('incident_time', { ascending: false });

        if (error) {
            console.error("Search Error:", error);
            resultsBody.innerHTML = "<tr><td colspan='10'>حدث خطأ أثناء البحث</td></tr>";
            return;
        }

        // Check if data is empty or null
        if (!data || data.length === 0) {
            resultsBody.innerHTML = "<tr><td colspan='10' style='text-align:center;'>لا توجد بيانات تطابق بحثك</td></tr>";
            return;
        }

        renderTable(data);
    }

    // =========================
    // RENDER EVENTS TABLE
    // =========================
    function renderTable(data) {

        const resultsBody = document.getElementById('resultsBody');
        if (!resultsBody) return;

        if (!data || data.length === 0) {
            resultsBody.innerHTML = "<tr><td colspan='10'>لا توجد نتائج</td></tr>";
            return;
        }

        resultsBody.innerHTML = "";

        data.forEach(row => {

            const formatDT = (dt) => dt ? new Date(dt).toLocaleString('ar-EG') : '-';

            const periodText =
                row.period === 'morning' ? 'صباحية' :
                row.period === 'evening' ? 'مسائية' : 'ليلية';

            resultsBody.innerHTML += `
                <tr>
                    <td>${periodText}</td>
                    <td>${formatDT(row.registration_time)}</td>
                    <td>${formatDT(row.incident_time)}</td>
                    <td>${row.patient_name}</td>
                    <td>${row.file_number}</td>
                    <td>${row.phone_number || '-'}</td>
                    <td>${row.police_officer_name || '-'}</td>
                    <td>${formatDT(row.report_time)}</td>
                    <td>${row.case_type}</td>
                    <td>${row.notes}</td>
                </tr>
            `;
        });
    }

    // =========================
    // FEEDBACK SECTION
    // =========================

    const feedbackSearchBtn = document.getElementById("feedbackSearchBtn");
    const feedbackShowAllBtn = document.getElementById("feedbackShowAllBtn");

    if (feedbackSearchBtn) {
        feedbackSearchBtn.addEventListener("click", searchFeedback);
    }

    if (feedbackShowAllBtn) {
        feedbackShowAllBtn.addEventListener("click", loadAllFeedback);
    }

    loadAllFeedback();

    // =========================
    // LOAD FEEDBACK
    // =========================
    async function loadAllFeedback() {

        const table = document.getElementById("feedbackResults");
        if (!table) return;

        table.innerHTML = "<tr><td colspan='8'>جاري التحميل...</td></tr>";

        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        renderFeedbackTable(data);
    }

    // =========================
    // SEARCH FEEDBACK
    // =========================
    async function searchFeedback() {
    const term = document.getElementById("feedbackSearch")?.value.trim();
    const date = document.getElementById("feedbackDate")?.value;

    const table = document.getElementById("feedbackResults");
    if (!table) return;

    table.innerHTML = "<tr><td colspan='8'>جاري البحث...</td></tr>";

    let query = supabase
        .from('feedback')
        .select('*');

    // إذا كان هناك نص بحث
    if (term) {
        // نستخدم فلتر مطابق للنص مع تجنب المسافات الزائدة
        const filterString = `patient_name.ilike.%${term}%,file_number.ilike.%${term}%,feedback_type.ilike.%${term}%,reporter_name.ilike.%${term}%`;
        query = query.or(filterString);
    }

    // إذا كان هناك تاريخ محدد
    if (date) {
        query = query.eq("report_date", date);
    }

    const { data, error } = await query.order('id', { ascending: false });

    if (error) {
        console.error("خطأ في البحث:", error);
        table.innerHTML = "<tr><td colspan='8'>حدث خطأ أثناء البحث</td></tr>";
        return;
    }

    // هنا يتم معالجة حالة "لا توجد نتائج"
    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='8' style='text-align:center;'>لا توجد نتائج تطابق بحثك</td></tr>";
        return;
    }

    renderFeedbackTable(data);
}

    // =========================
    // RENDER FEEDBACK
    // =========================
    function renderFeedbackTable(data) {

        const table = document.getElementById("feedbackResults");
        if (!table) return;

        if (!data || data.length === 0) {
            table.innerHTML = "<tr><td colspan='8'>لا توجد نتائج</td></tr>";
            return;
        }

        table.innerHTML = "";

        data.forEach(row => {

            const depts = (row.assigned_departments || [])
                .map(code => departmentNames[code] || code)
                .join(" ، ");

            table.innerHTML += `
                <tr>
                    <td>${row.report_date}</td>
                    <td>${row.patient_name}</td>
                    <td>${row.file_number}</td>
                    <td>${row.reporter_name}</td>
                    <td>${row.phone_number || '-'}</td>
                    <td>${depts}</td>
                    <td>${row.feedback_type}</td>
                    <td>${row.notes || '-'}</td>
                </tr>
            `;
        });
    }

});