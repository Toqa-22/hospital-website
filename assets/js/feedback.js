// assets/js/feedback.js

// مصفوفة لتخزين البيانات محلياً، ومتغير لتحديد الصف المراد تحويله
let feedbackData = []; 
let selectedRowId = null;

// تشغيل الوظائف الأساسية عند تحميل الصفحة
window.onload = () => {
    fetchFeedbackData(); // جلب البيانات من قاعدة البيانات
    
    // ربط حدث الإرسال (Submit) للفورم إذا كان موجوداً في الصفحة
    const form = document.getElementById("feedbackForm");
    if (form) {
        form.addEventListener("submit", submitFeedback);
    }
};

/**
 * دالة لجلب الشكاوى من Supabase
 */
async function fetchFeedbackData() {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false }); // ترتيب حسب الأحدث

    if (error) {
        console.error("خطأ في جلب البيانات:", error);
    } else {
        feedbackData = data;
        renderTable(); // تحديث واجهة الجدول بعد جلب البيانات
    }
}

/**
 * دالة لإضافة شكوى جديدة إلى قاعدة البيانات
 */
async function submitFeedback(event) {
    event.preventDefault(); // منع إعادة تحميل الصفحة التقليدي

    // جمع القيم من مدخلات الـ HTML
    const formData = {
        report_date: document.getElementById("report_date").value,
        patient_name: document.getElementById("patient_name").value,
        file_number: document.getElementById("file_number").value,
        reporter_name: document.getElementById("reporter_name").value,
        phone_number: document.getElementById("phone_number").value,
        feedback_type: document.getElementById("feedback_type").value,
        notes: document.getElementById("notes").value,
        assigned_departments: [] // الأقسام تكون فارغة عند الإضافة لأول مرة
    };

    // الإرسال إلى Supabase
    const { error } = await supabase
        .from('feedback')
        .insert([formData]);

    if (error) {
        alert("خطأ في الحفظ: " + error.message);
    } else {
        alert("تم حفظ البيانات بنجاح!");
        document.getElementById("feedbackForm").reset(); // تفريغ الفورم
        fetchFeedbackData(); // إعادة تحميل الجدول
    }
}

/**
 * عرض البيانات في الجدول (توليد الـ HTML ديناميكياً)
 */
function renderTable() {
    const tbody = document.getElementById("feedbackTableBody");
    if (!tbody) return;
    tbody.innerHTML = ""; // مسح الجدول الحالي

    feedbackData.forEach((row, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${row.id}</td>
            <td>${row.report_date}</td>
            <td>${row.patient_name}</td>
            <td>${row.file_number}</td>
            <td>${row.reporter_name}</td>
            <td>${row.phone_number}</td>
            <td>${row.feedback_type}</td>
            <td><button class="assign-btn" onclick="openAssign(${row.id})">تحويل</button></td>
            <td><button class="details-btn" onclick="toggleDetails(${index})">عرض</button></td>
            <td><button class="print-btn" onclick="printCase(${index})">طباعة</button></td>
        </tr>
        <tr id="details-${index}" class="details-row" style="display:none;">
            <td colspan="10" class="details-cell">
                <strong>الأقسام المحول إليها:</strong> ${row.assigned_departments.length > 0 ? row.assigned_departments.join(" ، ") : "لا يوجد"}<br>
                <strong>الملاحظات:</strong> ${row.notes || 'لا توجد'}
            </td>
        </tr>
        `;
    });
}

/**
 * إظهار/إخفاء تفاصيل الشكوى
 */
function toggleDetails(index) {
    const row = document.getElementById(`details-${index}`);
    row.style.display = (row.style.display === "none") ? "table-row" : "none";
}

/**
 * فتح نافذة التحويل للأقسام
 */
function openAssign(id) {
    selectedRowId = id;
    document.getElementById("assignModal").style.display = "block";
}

/**
 * إغلاق نافذة التحويل
 */
function closeModal() {
    document.getElementById("assignModal").style.display = "none";
}

/**
 * حفظ الأقسام المختارة في قاعدة البيانات
 */
async function saveAssignment() {
    const checked = document.querySelectorAll(".departments-list input:checked");
    const selectedDepts = Array.from(checked).map(x => x.value); // تحويل المختار إلى مصفوفة

    const { error } = await supabase
        .from('feedback')
        .update({ assigned_departments: selectedDepts })
        .eq('id', selectedRowId);

    if (error) {
        alert("حدث خطأ أثناء الحفظ");
    } else {
        alert("تم حفظ التحويل بنجاح");
        closeModal();
        fetchFeedbackData(); // تحديث البيانات
    }
}

/**
 * طباعة تقرير مفصل للحالة
 */
function printCase(index) {
    const row = feedbackData[index];
    const win = window.open("", "_blank");
    win.document.write(`
        <html dir="rtl">
        <head><title>تقرير الحالة</title></head>
        <body style="font-family: Arial; padding: 20px;">
            <h2>تقرير حالة: ${row.patient_name}</h2>
            <hr>
            <p><strong>التاريخ:</strong> ${row.report_date}</p>
            <p><strong>نوع الحالة:</strong> ${row.feedback_type}</p>
            <p><strong>الملاحظات:</strong> ${row.notes}</p>
        </body>
        </html>
    `);
    win.document.close();
    win.print();
}