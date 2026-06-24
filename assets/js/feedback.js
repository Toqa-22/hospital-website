// feedback.js — صفحة الشكاوى والاقتراحات (قسم العلاقات العامة)

document.addEventListener("DOMContentLoaded", () => {

    const supabase = window.supabaseClient;
    if (!supabase) { console.error("Supabase not loaded!"); return; }

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

    let feedbackData = [];
    let selectedRowId = null;

    // ── تشغيل ──
    fetchFeedbackData();
    loadDepartments();

    // ══════════════════════════════════════════
    // جلب البيانات
    // ══════════════════════════════════════════
    async function fetchFeedbackData() {
        const tbody = document.getElementById("feedbackTableBody");
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:28px;color:#999;">جاري التحميل...</td></tr>`;

        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:28px;color:red;">خطأ في تحميل البيانات</td></tr>`;
            return;
        }

        feedbackData = data || [];
        renderTable();
    }

    // ══════════════════════════════════════════
    // جلب الأقسام في المودال
    // ══════════════════════════════════════════
    async function loadDepartments() {
        const container = document.getElementById("departmentsList");
        if (!container) return;

        container.style.maxHeight = "300px";
        container.style.overflowY = "auto";
        container.style.border = "1px solid #e2e8f0";
        container.style.borderRadius = "8px";
        container.style.padding = "8px";

        const { data, error } = await supabase
            .from("departments")
            .select("code, department_name")
            .order("department_name");

        if (error) { console.error(error); return; }

        container.innerHTML = data.map(dept => `
            <label style="display:block; padding:8px 6px; border-bottom:1px solid #f0f0f0; cursor:pointer;">
                <input type="checkbox" value="${dept.code}"> ${dept.department_name}
            </label>
        `).join("");
    }

    // ══════════════════════════════════════════
    // رسم الجدول
    // ══════════════════════════════════════════
    function renderTable() {
        const tbody = document.getElementById("feedbackTableBody");

        if (feedbackData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:#999;">لا توجد بيانات</td></tr>`;
            return;
        }

        tbody.innerHTML = feedbackData.map((row, index) => {
            const depts = (row.assigned_departments || [])
                .map(code => departmentNames[code] || code)
                .join(" ، ");

            const assignedCount = (row.assigned_departments || []).length;
            const assignLabel = assignedCount > 0
                ? `تحويل <span style="background:#0d5c8a;color:#fff;font-size:11px;border-radius:20px;padding:1px 7px;margin-right:4px;">${assignedCount}</span>`
                : "تحويل";

            return `
                <tr>
                    <td>${row.id}</td>
                    <td>${row.report_date}</td>
                    <td>${row.patient_name}</td>
                    <td>${row.file_number}</td>
                    <td>${row.reporter_name}</td>
                    <td>${row.phone_number || '—'}</td>
                    <td>${row.feedback_type}</td>

                    <!-- عمود تحويل للقسم -->
                    <td>
                        <button class="btn-assign" onclick="openAssign(${row.id})">${assignLabel}</button>
                    </td>

                    <!-- عمود التعليقات (يرى كل تعليقات الأقسام) -->
                    <td>
                        <button class="btn-view" onclick="openComments(${row.id})">عرض التعليقات</button>
                    </td>

                    <td>
                        <button class="btn-view" onclick="toggleDetails(${index})">التفاصيل</button>
                    </td>
                    <td>
                        <button class="btn-print" onclick="printCase(${index})">طباعة</button>
                    </td>
                </tr>
                <tr id="details-${index}" style="display:none; background:#f8fafc;">
                    <td colspan="11" style="padding:14px 20px; font-size:14px; line-height:2; direction:rtl;">
                        <b>الأقسام المحوّلة:</b> ${depts || "لم يتم التحويل بعد"}<br>
                        <b>الملاحظات:</b> ${row.notes || "—"}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ══════════════════════════════════════════
    // مودال التحويل
    // ══════════════════════════════════════════
    window.openAssign = (id) => {
        selectedRowId = id;

        // إعادة تعيين الـ checkboxes
        document.querySelectorAll("#departmentsList input[type=checkbox]").forEach(cb => cb.checked = false);

        // تحديد الأقسام المحوّلة مسبقاً
        const row = feedbackData.find(r => r.id === id);
        if (row && row.assigned_departments) {
            row.assigned_departments.forEach(code => {
                const cb = document.querySelector(`#departmentsList input[value="${code}"]`);
                if (cb) cb.checked = true;
            });
        }

        document.getElementById("assignModal").style.display = "flex";
    };

    window.closeModal = () => {
        document.getElementById("assignModal").style.display = "none";
    };

    window.saveAssignment = async () => {
        const checked = document.querySelectorAll("#departmentsList input:checked");
        const selectedDepts = Array.from(checked).map(x => x.value);

        if (selectedDepts.length === 0) {
            alert("يرجى اختيار قسم واحد على الأقل");
            return;
        }

        try {
            // 1. تحديث جدول feedback
            const { error: updateError } = await supabase
                .from('feedback')
                .update({ assigned_departments: selectedDepts })
                .eq('id', selectedRowId);

            if (updateError) throw updateError;

            // 2. إضافة سجلات في department_notifications
            const notifications = selectedDepts.map(code => ({
                feedback_id: selectedRowId,
                department_code: code,
                is_read: false
            }));

            const { error: notifError } = await supabase
                .from('department_notifications')
                .upsert(notifications, { onConflict: 'feedback_id,department_code' });

            if (notifError) throw notifError;

            alert("✅ تم التحويل بنجاح");
            closeModal();
            fetchFeedbackData();

        } catch (err) {
            alert("خطأ: " + err.message);
        }
    };

    // إغلاق مودال التحويل بالضغط خارجه
    document.getElementById("assignModal").addEventListener("click", function(e) {
        if (e.target === this) closeModal();
    });

    // ══════════════════════════════════════════
    // مودال التعليقات — المدير يرى كل الأقسام
    // ══════════════════════════════════════════
    window.openComments = async (feedbackId) => {
        document.getElementById("commentsCaseId").textContent = `#${feedbackId}`;
        document.getElementById("commentsBody").innerHTML = `<div style="text-align:center;color:#999;padding:20px;">جاري التحميل...</div>`;
        document.getElementById("commentsModal").style.display = "flex";

        const { data, error } = await supabase
            .from('department_comments')
            .select('department_code, comment_text, created_at')
            .eq('feedback_id', feedbackId)
            .order('created_at', { ascending: true });

        const body = document.getElementById("commentsBody");

        if (error) {
            body.innerHTML = `<div style="color:red;">خطأ: ${error.message}</div>`;
            return;
        }

        if (!data || data.length === 0) {
            body.innerHTML = `<div style="text-align:center;color:#aaa;padding:20px;">لا توجد تعليقات من الأقسام بعد</div>`;
            return;
        }

        body.innerHTML = data.map(c => `
            <div style="border-bottom:1px solid #e8edf2; padding:10px 4px; margin-bottom:4px;">
                <div style="font-weight:bold; color:#0d5c8a; font-size:13px;">
                    🏥 ${departmentNames[c.department_code] || c.department_code}
                </div>
                <div style="margin-top:4px;">${c.comment_text}</div>
                <div style="font-size:11px; color:#aaa; margin-top:4px;">
                    ${new Date(c.created_at).toLocaleString('ar-SA')}
                </div>
            </div>
        `).join("");
    };

    window.closeCommentsModal = () => {
        document.getElementById("commentsModal").style.display = "none";
    };

    document.getElementById("commentsModal").addEventListener("click", function(e) {
        if (e.target === this) closeCommentsModal();
    });

    // ══════════════════════════════════════════
    // التفاصيل والطباعة
    // ══════════════════════════════════════════
    window.toggleDetails = (index) => {
        const row = document.getElementById(`details-${index}`);
        if (row) row.style.display = row.style.display === "none" ? "table-row" : "none";
    };

    window.printCase = (index) => {
        const row = feedbackData[index];
        const depts = (row.assigned_departments || [])
            .map(code => departmentNames[code] || code)
            .join(" ، ");

        const win = window.open("", "_blank");
        win.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة الحالة #${row.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; direction: rtl; }
                    h2 { color: #083b85; border-bottom: 2px solid #083b85; padding-bottom: 10px; }
                    .r { margin: 12px 0; font-size: 15px; }
                    b { color: #444; }
                </style>
            </head>
            <body>
                <h2>🏥 مستشفى إبراء — نظام الشكاوى والاقتراحات</h2>
                <div class="r"><b>رقم الحالة:</b> ${row.id}</div>
                <div class="r"><b>التاريخ:</b> ${row.report_date}</div>
                <div class="r"><b>اسم المريض:</b> ${row.patient_name}</div>
                <div class="r"><b>رقم الملف:</b> ${row.file_number}</div>
                <div class="r"><b>المبلّغ / المشتكي:</b> ${row.reporter_name}</div>
                <div class="r"><b>رقم الهاتف:</b> ${row.phone_number || '—'}</div>
                <div class="r"><b>نوع الحالة:</b> ${row.feedback_type}</div>
                <div class="r"><b>الأقسام المحوّلة:</b> ${depts || 'لم يتم التحويل'}</div>
                <div class="r"><b>الملاحظات:</b> ${row.notes || '—'}</div>
                <br>
                <p style="font-size:11px;color:#aaa;">طُبع بتاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
            </body>
            </html>
        `);
        win.print();
    };

});