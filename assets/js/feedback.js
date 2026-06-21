const feedbackData = [
{
    id:1,
    date:"21-06-2026",
    patient_name:"أحمد",
    file_number:"10025",
    reporter_name:"محمد",
    phone:"99999999",
    feedback_type:"شكوى",
    notes:"تم استقبال الشكوى وتحويلها للجهة المختصة",
    departments:[]
},
{
    id:2,
    date:"22-06-2026",
    patient_name:"سالم",
    file_number:"10026",
    reporter_name:"فاطمة",
    phone:"98888888",
    feedback_type:"اقتراح",
    notes:"اقتراح لتطوير الخدمات",
    departments:[]
}
];

let selectedRow = null;

renderTable();

function renderTable(){

    const tbody =
    document.getElementById("feedbackTableBody");

    tbody.innerHTML="";

    feedbackData.forEach((row,index)=>{

        tbody.innerHTML += `

        <tr>

            <td>${row.id}</td>
            <td>${row.date}</td>
            <td>${row.patient_name}</td>
            <td>${row.file_number}</td>
            <td>${row.reporter_name}</td>
            <td>${row.phone}</td>
            <td>${row.feedback_type}</td>

            <td>
                <button class="assign-btn"
                onclick="openAssign(${index})">
                تحويل
                </button>
            </td>

            <td>
                <button class="details-btn"
                onclick="toggleDetails(${index})">
                عرض
                </button>
            </td>

            <td>
                <button class="print-btn"
                onclick="printCase(${index})">
                طباعة
                </button>
            </td>

        </tr>

        <tr id="details-${index}"
        class="details-row">

            <td colspan="10"
            class="details-cell">

                <strong>الأقسام المحول إليها:</strong>

                ${
                    row.departments.length
                    ? row.departments.join(" , ")
                    : "لم يتم التحويل بعد"
                }

                <br><br>

                <strong>الملاحظات:</strong>

                ${row.notes}

            </td>

        </tr>

        `;
    });

}

function toggleDetails(index){

    const row =
    document.getElementById(`details-${index}`);

    row.style.display =
    row.style.display === "table-row"
    ? "none"
    : "table-row";
}

function openAssign(index){

    selectedRow = index;

    document.getElementById("assignModal")
    .style.display="block";
}

function closeModal(){

    document.getElementById("assignModal")
    .style.display="none";
}

function saveAssignment(){

    const checked =
    document.querySelectorAll(
    ".departments-list input:checked"
    );

    feedbackData[selectedRow].departments =
    [...checked].map(x=>x.parentElement.innerText);

    closeModal();

    renderTable();

    alert("تم حفظ التحويل");
}

function printCase(index){

    const row = feedbackData[index];

    const win =
    window.open("","","width=800,height=700");

    win.document.write(`
    <h2>بيانات الحالة</h2>
    <hr>
    <p>اسم المريض: ${row.patient_name}</p>
    <p>رقم الملف: ${row.file_number}</p>
    <p>اسم المبلغ: ${row.reporter_name}</p>
    <p>نوع الحالة: ${row.feedback_type}</p>
    <p>الملاحظات: ${row.notes}</p>
    `);

    win.print();
}