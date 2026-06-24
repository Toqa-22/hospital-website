// department-feedback.js — صفحة الأقسام: عرض الحالات المحوّلة + التعليقات

document.addEventListener('DOMContentLoaded', () => {
    const user = requireDepartment();
    if (!user) return;

    document.getElementById('headerDept').textContent = user.display_name;
    document.getElementById('headerUser').textContent = user.username;

    const supabase = window.supabaseClient;
    let notifications = [];
    let currentFeedbackId = null;

    // تشغيل أول مرة
    fetchNotifications();
    // تحديث تلقائي كل دقيقة
    setInterval(fetchNotifications, 60000);

    // =============================================
    // جلب الحالات المحوّلة لهذا القسم
    // =============================================
    window.fetchNotifications = async function () {
        const tbody = document.getElementById('deptTableBody');
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:28px;color:#999;">جاري التحميل...</td></tr>`;

        const { data, error } = await supabase
            .from('department_notifications')
            .select(`
                id,
                feedback_id,
                assigned_at,
                is_read,
                feedback (
                    id, report_date, patient_name, file_number,
                    reporter_name, phone_number, feedback_type, notes
                )
            `)
            .eq('department_code', user.department_code)
            .order('assigned_at', { ascending: false });

        if (error) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:28px;color:#e53e3e;">خطأ في تحميل البيانات: ${error.message}</td></tr>`;
            return;
        }

        notifications = data || [];
        updateBadge();
        renderTable();
    };

    // =============================================
    // رسم الجدول
    // =============================================
    function renderTable() {
        const tbody = document.getElementById('deptTableBody');

        if (!notifications.length) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:48px;color:#aaa;">
                <div style="font-size:44px;margin-bottom:12px;">📭</div>
                لا توجد حالات محوّلة لقسمك حتى الآن
            </td></tr>`;
            return;
        }

        tbody.innerHTML = notifications.map((notif, idx) => {
            const fb     = notif.feedback;
            const isNew  = !notif.is_read;
            const rowCls = isNew ? 'row-unread' : '';
            const newBadge = isNew ? '<span class="badge-new">جديد</span>' : '';
            const receivedIcon = !isNew ? '<span class="received-icon">✓ مستلم</span>' : '';

            const assignDate = new Date(notif.assigned_at).toLocaleDateString('ar-SA');

            return `
                <tr class="${rowCls}">
                    <td>${fb.id} ${newBadge}</td>
                    <td>${fb.report_date}</td>
                    <td>${fb.patient_name}</td>
                    <td>${fb.file_number}</td>
                    <td>${fb.reporter_name}</td>
                    <td>${fb.phone_number || '—'}</td>
                    <td><span class="type-badge type-${fb.feedback_type}">${fb.feedback_type}</span></td>
                    <td>${assignDate}</td>
                    <td>
                        ${isNew
                            ? `<button class="btn-read" onclick="markRead(${notif.id})">تأكيد الاستلام</button>`
                            : receivedIcon}
                    </td>
                    <td>
                        <button class="btn-view"    onclick="toggleDetails(${idx})">تفاصيل</button>
                        <button class="btn-comment" onclick="openCommentModal(${fb.id})">💬 تعليق</button>
                        <button class="btn-print"   onclick="printCase(${idx})">طباعة</button>
                    </td>
                </tr>
                <tr id="det-${idx}" style="display:none;background:#f0f7ff;">
                    <td colspan="10" style="padding:16px 22px;font-size:14px;line-height:2.1;direction:rtl;">
                        <b>نوع الحالة:</b> ${fb.feedback_type}<br>
                        <b>ملاحظات العلاقات العامة:</b> ${fb.notes || '—'}<br>
                        <b>تاريخ التحويل:</b> ${new Date(notif.assigned_at).toLocaleString('ar-SA')}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // =============================================
    // تفاصيل + قراءة + كل / طباعة
    // =============================================
    window.toggleDetails = (idx) => {
        const row = document.getElementById(`det-${idx}`);
        if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    };

    window.markRead = async (notifId) => {
        const { error } = await supabase
            .from('department_notifications')
            .update({ is_read: true })
            .eq('id', notifId);
        if (error) { alert('خطأ: ' + error.message); return; }
        fetchNotifications();
    };

    window.markAllRead = async () => {
        const { error } = await supabase
            .from('department_notifications')
            .update({ is_read: true })
            .eq('department_code', user.department_code)
            .eq('is_read', false);
        if (error) { alert('خطأ: ' + error.message); return; }
        fetchNotifications();
    };

    function updateBadge() {
        const unread = notifications.filter(n => !n.is_read).length;
        const badge  = document.getElementById('unreadBadge');
        badge.textContent     = unread;
        badge.style.display   = unread > 0 ? 'inline-block' : 'none';
    }

    window.printCase = (idx) => {
        const notif = notifications[idx];
        const fb    = notif.feedback;
        const win   = window.open('', '_blank');
        win.document.write(`
            <html dir="rtl">
            <head><title>طباعة الحالة #${fb.id}</title>
            <style>
                body { font-family:Arial,sans-serif; padding:30px; direction:rtl; }
                h2 { color:#0a2540; border-bottom:2px solid #0a2540; padding-bottom:10px; }
                .r { margin:12px 0; font-size:15px; }
                b { color:#444; }
                .dept-box { background:#e8f4fd; padding:12px; border-radius:8px; margin:16px 0; }
            </style>
            </head>
            <body>
                <h2>🏥 مستشفى ابراء — حالة محوّلة</h2>
                <div class="dept-box"><b>القسم:</b> ${user.display_name}</div>
                <div class="r"><b>رقم الحالة:</b> ${fb.id}</div>
                <div class="r"><b>التاريخ:</b> ${fb.report_date}</div>
                <div class="r"><b>المريض:</b> ${fb.patient_name}</div>
                <div class="r"><b>رقم الملف:</b> ${fb.file_number}</div>
                <div class="r"><b>المبلّغ:</b> ${fb.reporter_name}</div>
                <div class="r"><b>الهاتف:</b> ${fb.phone_number || '—'}</div>
                <div class="r"><b>نوع الحالة:</b> ${fb.feedback_type}</div>
                <div class="r"><b>الملاحظات:</b> ${fb.notes || '—'}</div>
                <div class="r"><b>تاريخ التحويل:</b> ${new Date(notif.assigned_at).toLocaleString('ar-SA')}</div>
                <br><p style="font-size:11px;color:#aaa;">طُبع بتاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
            </body></html>
        `);
        win.print();
    };

    // =============================================
    // مودال التعليقات
    // =============================================
    window.openCommentModal = async (feedbackId) => {
        currentFeedbackId = feedbackId;
        document.getElementById('modalCaseId').textContent = `#${feedbackId}`;
        document.getElementById('commentText').value = '';
        document.getElementById('commentModal').classList.add('open');
        await loadComments(feedbackId);
    };

    window.closeCommentModal = () => {
        document.getElementById('commentModal').classList.remove('open');
        currentFeedbackId = null;
    };

    async function loadComments(feedbackId) {
        const hist = document.getElementById('commentHistory');
        hist.innerHTML = '<div class="empty">جاري التحميل...</div>';

        const { data, error } = await supabase
            .from('department_comments')
            .select('comment_text, created_at')
            .eq('feedback_id', feedbackId)
            .eq('department_code', user.department_code)
            .order('created_at', { ascending: true });

        if (error) { hist.innerHTML = `<div class="empty">خطأ: ${error.message}</div>`; return; }

        if (!data || data.length === 0) {
            hist.innerHTML = '<div class="empty">لا توجد تعليقات بعد</div>';
            return;
        }

        hist.innerHTML = data.map(c => `
            <div class="c-item">
                <div>${c.comment_text}</div>
                <div class="c-date">${new Date(c.created_at).toLocaleString('ar-SA')}</div>
            </div>
        `).join('');
        hist.scrollTop = hist.scrollHeight;
    }

    window.saveComment = async () => {
        const text = document.getElementById('commentText').value.trim();
        if (!text) { alert('يرجى كتابة تعليق أولاً'); return; }

        const btn = document.getElementById('saveCommentBtn');
        btn.disabled = true; btn.textContent = 'جاري الإرسال...';

        const { error } = await supabase
            .from('department_comments')
            .insert({
                feedback_id:     currentFeedbackId,
                department_code: user.department_code,
                comment_text:    text
            });

        btn.disabled = false; btn.textContent = 'إرسال التعليق';

        if (error) { alert('خطأ: ' + error.message); return; }

        document.getElementById('commentText').value = '';
        await loadComments(currentFeedbackId);
    };

    // إغلاق المودال بالضغط خارجه
    document.getElementById('commentModal').addEventListener('click', function(e) {
        if (e.target === this) closeCommentModal();
    });
});