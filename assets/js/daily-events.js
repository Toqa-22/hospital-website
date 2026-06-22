document.addEventListener("DOMContentLoaded", () => {

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("❌ Supabase not loaded!");
        return;
    }

    const form = document.getElementById("dailyEventForm");

    if (form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault();

            console.log("تم الضغط على زر الحفظ...");

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

            console.log("📦 formData:", formData);

            try {
                const { data, error } = await supabase
                    .from('daily_events')
                    .insert([formData]);

                if (error) {
                    console.error("❌ Supabase error:", error);
                    alert("خطأ أثناء الحفظ: " + error.message);
                    return;
                }

                alert("تم حفظ الحدث بنجاح!");
                form.reset();

            } catch (err) {
                console.error("❌ Unexpected error:", err);
            }
        });
    } else {
        console.error("❌ dailyEventForm not found");
    }

<<<<<<< HEAD
});
=======
});
>>>>>>> 01ef492fdc1da088c1a6bc007eaaf73362db930f
