// auth.js - يُضاف لكل صفحة محمية
// يتحقق من الجلسة ويوجّه للصفحة الصحيحة

function getCurrentUser() {
    const data = sessionStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
}

function requireAdmin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../login.html';
        return null;
    }
    if (user.role !== 'admin') {
        window.location.href = 'department.html';
        return null;
    }
    return user;
}

function requireDepartment() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../login.html';
        return null;
    }
    if (user.role === 'admin') {
        window.location.href = 'home.html';
        return null;
    }
    return user;
}

function requireLogin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../login.html';
        return null;
    }
    return user;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../login.html';
}