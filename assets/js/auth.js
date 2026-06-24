// auth.js — ضعه في assets/js/ واستدعه في كل صفحة محمية
// يجب تحميله قبل أي سكريبت آخر

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    } catch {
        return null;
    }
}

// للصفحات التي تتطلب admin فقط (العلاقات العامة)
function requireAdmin() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (user.role !== 'admin') { window.location.href = 'department-home.html'; return null; }
    return user;
}

// للصفحات التي تتطلب department فقط
function requireDepartment() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (user.role === 'admin') { window.location.href = 'home.html'; return null; }
    return user;
}

// لأي صفحة محمية (admin أو department)
function requireLogin() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    return user;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}