// assets/js/daily-events.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("dailyEventForm");
    
    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault(); // منع الصفحة من إعادة التحميل
            console.log("تم الضغط على زر الحفظ...");

            // 1. جمع البيانات
            const formData = {
                period: document.getElementById("period").value,
                registration_time: document.getElementById("registration_time").value,
                incident_time: document.getElementById("incident_time").value,
                patient_name: document.getElementById("patient_name").value,
                file_number: document.getElementById("file_number").value,
                phone_number: document.getElementById("phone_number").value,
                police_officer_name: document.getElementById("police_officer_name").value,
                report_time: document.getElementById("report_time").value,
                case_type: document.getElementById("case_type").value,
                notes: document.getElementById("notes").value
            };

            console.log("البيانات الجاهزة للإرسال:", formData);

            // 2. الإرسال إلى Supabase
            try {
                const { error } = await window.supabaseClient
                    .from('daily_events')
                    .insert([formData]);

                if (error) {
                    console.error("خطأ من Supabase:", error);
                    alert("خطأ أثناء الحفظ: " + error.message);
                } else {
                    // 3. رسالة النجاح
                    alert("تم حفظ الحدث بنجاح!");
                    form.reset(); // مسح الحقول بعد الحفظ
                    console.log("تم الحفظ بنجاح وتصفير الفورم.");
                }
            } catch (err) {
                console.error("خطأ غير متوقع:", err);
                alert("حدث خطأ غير متوقع، راجعي Console.");
            }
        });
    } else {
        console.error("لم يتم العثور على العنصر dailyEventForm");
    }
});