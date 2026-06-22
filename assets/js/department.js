// department.js - صفحة القسم (تعرض فقط الحالات المحوّلة لهذا القسم)
document.addEventListener("DOMContentLoaded", async () => {

    // --- حماية الصفحة ---
    const user = requireDepartment();
    if (!user) return;

    // عرض اسم القسم
    document.getElementById('deptTitle').textContent = user.display_name;
    document.getElementById('currentUserName').textContent = user.display_name;

    const supabase = window.supabaseClient;
    if (!supabase) { console.error("Supabase not loaded!"); return; }

    let notifications = [];

    await fetchNotifications();

    // --- جلب الحالات المحوّلة لهذا القسم ---
    async function fetchNotifications() {
        const tbody = document.getElementById("deptTableBody");
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:#999;">جاري التحميل...</td></tr>`;

        // جلب الإشعارات مع بيانات الحالة (JOIN)
        const { data, error } = await supabase
            .from('department_notifications')
            .select(`
                id,
                feedback_id,
                assigned_at,
                is_read,
                feedback (
                    id,
                    report_date,
                    patient_name,
                    file_number,
                    reporter_name,
                    phone_number,
                    feedback_type,
                    notes
                )
            `)
            .eq('department_code', user.department_code)
            .order('assigned_at', { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:30px;color:#e53e3e;">خطأ في تحميل البيانات</td></tr>`;
            return;
        }

        notifications = data;
        updateUnreadCount();
        renderTable();
    }

    // --- عرض الجدول ---
    function renderTable() {
        const tbody = document.getElementById("deptTableBody");

        if (notifications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:#999;">
                <div style="font-size:40px;margin-bottom:10px;">📭</div>
                لا توجد حالات محوّلة لهذا القسم حتى الآن
            </td></tr>`;
            return;
        }

        tbody.innerHTML = notifications.map((notif, index) => {
            const fb = notif.feedback;
            if (!fb) return '';

            const isNew = !notif.is_read;
            const rowClass = isNew ? 'row-unread' : '';
            const newBadge = isNew ? '<span class="badge-new">جديد</span>' : '';

            return `
                <tr class="${rowClass}" id="notif-row-${notif.id}">
                    <td>${fb.id} ${newBadge}</td>
                    <td>${fb.report_date}</td>
                    <td>${fb.patient_name}</td>
                    <td>${fb.file_number}</td>
                    <td>${fb.reporter_name}</td>
                    <td>${fb.phone_number || '-'}</td>
                    <td><span class="type-badge type-${fb.feedback_type}">${fb.feedback_type}</span></td>
                    <td>${new Date(notif.assigned_at).toLocaleDateString('ar-SA')}</td>
                    <td>
                        <button class="btn-view" onclick="viewDetails(${index})">عرض</button>
                        <button class="btn-print" onclick="printCase(${index})">طباعة</button>
                        ${isNew ? `<button class="btn-read" onclick="markRead(${notif.id})">تأكيد الاستلام</button>` : '<span style="color:#38a169;font-size:13px;">✓ مستلم</span>'}
                    </td>
                </tr>
                <tr id="detail-row-${index}" style="display:none; background:#f0f7ff;">
                    <td colspan="9" style="padding:16px 24px; font-size:14px; line-height:2.2; direction:rtl;">
                        <strong>📋 تفاصيل الحالة:</strong><br>
                        <b>نوع الحالة:</b> ${fb.feedback_type}<br>
                        <b>الملاحظات:</b> ${fb.notes || "لا توجد ملاحظات"}<br>
                        <b>تاريخ التحويل:</b> ${new Date(notif.assigned_at).toLocaleString('ar-SA')}
                    </td>
                </tr>
            `;
        }).join("");
    }

    // --- عرض/إخفاء التفاصيل ---
    window.viewDetails = (index) => {
        const row = document.getElementById(`detail-row-${index}`);
        if (row) {
            row.style.display = row.style.display === "none" ? "table-row" : "none";
        }
    };

    // --- تأكيد الاستلام (تحديث is_read) ---
    window.markRead = async (notifId) => {
        const { error } = await supabase
            .from('department_notifications')
            .update({ is_read: true })
            .eq('id', notifId);

        if (error) { alert("خطأ: " + error.message); return; }
        await fetchNotifications();
    };

    // --- تأكيد استلام الكل ---
    window.markAllRead = async () => {
        const { error } = await supabase
            .from('department_notifications')
            .update({ is_read: true })
            .eq('department_code', user.department_code)
            .eq('is_read', false);

        if (error) { alert("خطأ: " + error.message); return; }
        await fetchNotifications();
    };

    // --- عدد الحالات غير المقروءة ---
    function updateUnreadCount() {
        const unread = notifications.filter(n => !n.is_read).length;
        const badge = document.getElementById('unreadBadge');
        const total = document.getElementById('totalCount');
        const unreadCount = document.getElementById('unreadCount');

        if (badge) badge.textContent = unread > 0 ? unread : '';
        if (badge) badge.style.display = unread > 0 ? 'inline-block' : 'none';
        if (total) total.textContent = notifications.length;
        if (unreadCount) unreadCount.textContent = unread;
    }

    // --- طباعة ---
    window.printCase = (index) => {
        const notif = notifications[index];
        const fb = notif.feedback;

        const win = window.open("", "_blank");
        win.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة الحالة #${fb.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; direction: rtl; }
                    h2 { color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 10px; }
                    .row { margin: 12px 0; font-size: 15px; }
                    .label { font-weight: bold; color: #555; }
                    .dept-box { background: #e8f4fd; padding: 12px; border-radius: 8px; margin-top: 16px; }
                </style>
            </head>
            <body>
                <h2>🏥 مستشفى ابراء - حالة محوّلة</h2>
                <div class="dept-box"><b>القسم:</b> ${user.display_name}</div>
                <div class="row"><span class="label">رقم الحالة:</span> ${fb.id}</div>
                <div class="row"><span class="label">التاريخ:</span> ${fb.report_date}</div>
                <div class="row"><span class="label">اسم المريض:</span> ${fb.patient_name}</div>
                <div class="row"><span class="label">رقم الملف:</span> ${fb.file_number}</div>
                <div class="row"><span class="label">المبلّغ/المشتكي:</span> ${fb.reporter_name}</div>
                <div class="row"><span class="label">رقم الهاتف:</span> ${fb.phone_number || '-'}</div>
                <div class="row"><span class="label">نوع الحالة:</span> ${fb.feedback_type}</div>
                <div class="row"><span class="label">الملاحظات:</span> ${fb.notes || '-'}</div>
                <div class="row"><span class="label">تاريخ التحويل:</span> ${new Date(notif.assigned_at).toLocaleString('ar-SA')}</div>
                <br><br>
                <p style="font-size:12px; color:#999;">طُبع بتاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
            </body>
            </html>
        `);
        win.print();
    };

    // --- تحديث تلقائي كل 60 ثانية ---
    setInterval(fetchNotifications, 60000);
});