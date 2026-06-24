document.addEventListener("DOMContentLoaded", async () => {

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("❌ Supabase not loaded");
        return;
    }

    const tbody = document.getElementById("todayTableBody");

    if (!tbody) {
        console.error("❌ todayTableBody not found");
        return;
    }

    // 🟢 Get local today start/end
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    // 🟢 Convert LOCAL → UTC (IMPORTANT for Supabase)
    const startUTC = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
    const endUTC = new Date(end.getTime() - start.getTimezoneOffset() * 60000).toISOString();

    console.log("📅 Start UTC:", startUTC);
    console.log("📅 End UTC:", endUTC);

    try {

        const { data, error } = await supabase
            .from("daily_events")
            .select("*")
            .gte("registration_time", startUTC)
            .lte("registration_time", endUTC)
            .order("registration_time", { ascending: false });

        if (error) {
            console.error("❌ Supabase error:", error);
            return;
        }

        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">لا توجد بيانات اليوم</td>
                </tr>
            `;
            return;
        }

        data.forEach(row => {

            const time = row.registration_time
                ? new Date(row.registration_time).toLocaleString("ar")
                : "";

            tbody.innerHTML += `
                <tr>
                    <td>${time}</td>
                    <td>${row.patient_name || ""}</td>
                    <td>${row.file_number || ""}</td>
                    <td>${row.phone_number || ""}</td>
                    <td>${row.case_type || ""}</td>
                    <td>${row.notes || ""}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("❌ Unexpected error:", err);
    }
});