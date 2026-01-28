/**
 * Focus Clinical Admin Portal - Core JavaScript
 * Handles authentication, data management, and exports
 */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    adminEmail: 'helpdesk@focusdiagnostics.co.ke',
    defaultPassword: 'Focus2024!',
    sessionKey: 'focusAdminSession',
    dataKeys: {
        appointments: 'focusAppointments',
        contacts: 'focusContacts',
        adminPassword: 'focusAdminPassword'
    }
};

// ============================================
// Authentication Functions
// ============================================

function getStoredPassword() {
    return localStorage.getItem(CONFIG.dataKeys.adminPassword) || CONFIG.defaultPassword;
}

function adminLogin(email, password) {
    if (email === CONFIG.adminEmail && password === getStoredPassword()) {
        const session = {
            email: email,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        localStorage.setItem(CONFIG.sessionKey, JSON.stringify(session));
        return true;
    }
    return false;
}

function adminLogout() {
    localStorage.removeItem(CONFIG.sessionKey);
    window.location.href = 'login.html';
}

function isAdminLoggedIn() {
    const session = localStorage.getItem(CONFIG.sessionKey);
    if (!session) return false;

    try {
        const parsed = JSON.parse(session);
        const expiresAt = new Date(parsed.expiresAt);
        if (expiresAt < new Date()) {
            localStorage.removeItem(CONFIG.sessionKey);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

function requireAuth() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function changePassword(currentPassword, newPassword) {
    if (currentPassword !== getStoredPassword()) {
        return { success: false, message: 'Current password is incorrect' };
    }
    if (newPassword.length < 8) {
        return { success: false, message: 'New password must be at least 8 characters' };
    }
    localStorage.setItem(CONFIG.dataKeys.adminPassword, newPassword);
    return { success: true, message: 'Password changed successfully' };
}

// ============================================
// Data Management Functions
// ============================================

function getAppointments() {
    const data = localStorage.getItem(CONFIG.dataKeys.appointments);
    return data ? JSON.parse(data) : [];
}

function saveAppointment(appointment) {
    const appointments = getAppointments();
    appointment.id = Date.now().toString();
    appointment.createdAt = new Date().toISOString();
    appointment.status = 'pending';
    appointments.push(appointment);
    localStorage.setItem(CONFIG.dataKeys.appointments, JSON.stringify(appointments));
    return appointment;
}

function updateAppointmentStatus(id, status) {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
        appointments[index].status = status;
        appointments[index].updatedAt = new Date().toISOString();
        localStorage.setItem(CONFIG.dataKeys.appointments, JSON.stringify(appointments));
        return true;
    }
    return false;
}

function deleteAppointment(id) {
    const appointments = getAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    localStorage.setItem(CONFIG.dataKeys.appointments, JSON.stringify(filtered));
}

function getContacts() {
    const data = localStorage.getItem(CONFIG.dataKeys.contacts);
    return data ? JSON.parse(data) : [];
}

function saveContact(contact) {
    const contacts = getContacts();
    contact.id = Date.now().toString();
    contact.createdAt = new Date().toISOString();
    contact.status = 'unread';
    contacts.push(contact);
    localStorage.setItem(CONFIG.dataKeys.contacts, JSON.stringify(contacts));
    return contact;
}

function updateContactStatus(id, status) {
    const contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) {
        contacts[index].status = status;
        contacts[index].updatedAt = new Date().toISOString();
        localStorage.setItem(CONFIG.dataKeys.contacts, JSON.stringify(contacts));
        return true;
    }
    return false;
}

function deleteContact(id) {
    const contacts = getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem(CONFIG.dataKeys.contacts, JSON.stringify(filtered));
}

// ============================================
// Export Functions
// ============================================

function exportToCSV(data, filename) {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            let cell = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            cell = String(cell).replace(/"/g, '""');
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                cell = `"${cell}"`;
            }
            return cell;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function exportToPDF(data, title, filename) {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create a simple HTML table for PDF
    const headers = Object.keys(data[0]);
    let tableHTML = `
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #7AC143; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { background: #7AC143; color: white; padding: 10px; text-align: left; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background: #f9f9f9; }
                .footer { margin-top: 20px; font-size: 10px; color: #666; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>${headers.map(h => `<th>${h.toUpperCase()}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => `<tr>${headers.map(h => `<td>${row[h] || '-'}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
            <div class="footer">
                <p>Focus Clinical and Diagnostics Centre Ltd | helpdesk@focusdiagnostics.co.ke</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// ============================================
// Dashboard Statistics
// ============================================

function getDashboardStats() {
    const appointments = getAppointments();
    const contacts = getContacts();

    const today = new Date().toISOString().split('T')[0];

    return {
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
        todayAppointments: appointments.filter(a => a.date === today).length,
        totalContacts: contacts.length,
        unreadContacts: contacts.filter(c => c.status === 'unread').length,
        repliedContacts: contacts.filter(c => c.status === 'replied').length
    };
}

// ============================================
// Utility Functions
// ============================================

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-warning">Pending</span>',
        confirmed: '<span class="badge badge-success">Confirmed</span>',
        cancelled: '<span class="badge badge-danger">Cancelled</span>',
        completed: '<span class="badge badge-info">Completed</span>',
        unread: '<span class="badge badge-warning">Unread</span>',
        read: '<span class="badge badge-info">Read</span>',
        replied: '<span class="badge badge-success">Replied</span>'
    };
    return badges[status] || `<span class="badge">${status}</span>`;
}

// ============================================
// Demo Data Seeding (for testing)
// ============================================

function seedDemoData() {
    // Only seed if no data exists
    if (getAppointments().length === 0) {
        const demoAppointments = [
            {
                id: '1',
                service: 'Outpatient',
                date: '2026-01-28',
                time: 'Morning',
                fullname: 'Jane Wanjiku',
                phone: '+254 712 345 678',
                email: 'jane@example.com',
                dob: '1990-05-15',
                idNumber: '12345678',
                branch: 'muranga',
                reason: 'Severe headache and fever',
                firstVisit: true,
                insuranceProvider: 'NHIF',
                policyNumber: 'NHIF-123456',
                smsReminders: true,
                notes: 'Prefers female doctor if possible',
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                service: 'Ultrasound',
                date: '2026-01-29',
                time: 'Afternoon',
                fullname: 'Peter Kamau',
                phone: '+254 723 456 789',
                email: 'peter@example.com',
                dob: '1985-03-22',
                idNumber: '23456789',
                branch: 'kerugoya',
                reason: 'Routine checkup for partner',
                firstVisit: false,
                insuranceProvider: 'AAR',
                policyNumber: 'AAR-789012',
                smsReminders: true,
                notes: 'Coming with spouse',
                status: 'confirmed',
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        localStorage.setItem(CONFIG.dataKeys.appointments, JSON.stringify(demoAppointments));
    }

    if (getContacts().length === 0) {
        const demoContacts = [
            {
                id: '1',
                name: 'Mary Njeri',
                email: 'mary@example.com',
                phone: '+254 734 567 890',
                subject: 'Service Inquiry',
                message: 'I would like to know more about your maternal health services.',
                status: 'unread',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'John Mwangi',
                email: 'john@example.com',
                phone: '+254 745 678 901',
                subject: 'Appointment Follow-up',
                message: 'Following up on my recent appointment. Need lab results.',
                status: 'replied',
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        localStorage.setItem(CONFIG.dataKeys.contacts, JSON.stringify(demoContacts));
    }
}

// Initialize demo data
seedDemoData();
