// تحميل بيانات المستخدم عند تحميل الصفحة
window.onload = async function() {
    console.log('🔍 تحميل بيانات المستخدم...');
    
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
        console.log('📡 محاولة جلب البيانات من Google Sheets...');
        await fetchUserDataFromGoogleSheets();
    } else {
        const userData = JSON.parse(userDataString);
        loadUserData(userData);
        
        // تفعيل زر الشهادة إذا كان المستخدم حاضراً
        if (userData.attendance === "حاضر") {
            document.getElementById('certificateBtn').disabled = false;
        }
    }
};

async function fetchUserDataFromGoogleSheets() {
    const email = localStorage.getItem('userEmail');
    const phone = localStorage.getItem('userPhone');

    if (!email || !phone) {
        console.warn('⚠️ بيانات تسجيل الدخول غير متوفرة، إعادة التوجيه...');
        window.location.href = 'login.html';
        return;
    }

    try {
        const url = new URL(API_URL);
        url.searchParams.append('action', 'verifyUser');
        url.searchParams.append('email', email);
        url.searchParams.append('phone', phone);

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            console.log('✅ بيانات المستخدم من Google Sheets:', data.data);
            localStorage.setItem('userData', JSON.stringify(data.data));
            loadUserData(data.data);
        } else {
            console.error('❌ خطأ في جلب البيانات:', data.message);
        }
    } catch (error) {
        console.error('❌ خطأ أثناء جلب البيانات:', error);
    }
}

function loadUserData(userData) {
    console.log('✅ تحميل بيانات المستخدم إلى الصفحة...');
    setElementText('welcomeName', userData.name);
    setElementText('userName', userData.name);
    setElementText('userEmail', userData.email);
    setElementText('userPhone', userData.phone);
    setElementText('userGender', userData.gender);
    setElementText('userType', userData.type);
    setElementText('userCountry', userData.country);
    setElementText('userCode', userData.code || 'غير متوفر');
    
    // تحديث حالة الحضور مع التنسيق
    const attendanceElement = document.getElementById('userAttendance');
    if (attendanceElement) {
        const isPresent = userData.attendance === "حاضر";
        attendanceElement.textContent = isPresent ? "حاضر" : "لم يحضر";
        attendanceElement.className = 'attendance-badge ' + (isPresent ? 'present' : 'absent');
        
        // تحديث حالة الأزرار
        document.getElementById('attendanceBtn').disabled = isPresent;
        document.getElementById('certificateBtn').disabled = !isPresent;
        if (isPresent) {
            document.getElementById('attendanceBtn').textContent = 'تم تسجيل الحضور';
        }
    }
}

function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || 'غير متوفر';
    } else {
        console.error(`❌ العنصر #${id} غير موجود في HTML`);
    }
}

// تسجيل الحضور
async function markAttendance() {
    const email = localStorage.getItem('userEmail');
    const phone = localStorage.getItem('userPhone');

    console.log('بيانات المستخدم:', {
        email: email,
        phone: phone,
        userData: localStorage.getItem('userData')
    });

    if (!email || !phone) {
        alert('الرجاء تسجيل الدخول مرة أخرى');
        window.location.href = 'login.html';
        return;
    }

    try {
        const url = new URL(API_URL);
        url.searchParams.append('action', 'markAttendance');
        url.searchParams.append('email', email);
        url.searchParams.append('phone', phone);

        console.log('URL الطلب:', url.toString());
        
        const response = await fetch(url);
        const data = await response.json();
        console.log('استجابة تسجيل الحضور:', data);

        if (data.success) {
            // تحديث حالة الحضور في التخزين المحلي
            const userData = JSON.parse(localStorage.getItem('userData'));
            userData.attendance = "حاضر";
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // تحديث واجهة المستخدم
            localStorage.setItem('attendanceStatus', 'true');
            document.getElementById('attendanceBtn').disabled = true;
            document.getElementById('attendanceBtn').textContent = 'تم تسجيل الحضور';
            
            // تفعيل زر الشهادة
            document.getElementById('certificateBtn').disabled = false;
            
            alert('تم تسجيل حضورك بنجاح');
        } else {
            alert(data.message || 'حدث خطأ في تسجيل الحضور');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في تسجيل الحضور: ' + error.message);
    }
}

// تحميل الشهادة
async function downloadCertificate() {
    const email = localStorage.getItem('userEmail');
    const phone = localStorage.getItem('userPhone');

    try {
        const url = new URL(API_URL);
        url.searchParams.append('action', 'getCertificate');
        url.searchParams.append('email', email);
        url.searchParams.append('phone', phone);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Response data:', data);

        if (data.success && data.data.certificateUrl) {
            window.open(data.data.certificateUrl, '_blank');
        } else {
            alert(data.message || 'لم يتم العثور على الشهادة');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في تحميل الشهادة: ' + error.message);
    }
}

// إضافة دالة تسجيل الخروج
function logout() {
    // مسح بيانات المستخدم من التخزين المحلي
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('attendanceStatus');
    
    // العودة إلى صفحة تسجيل الدخول
    window.location.href = 'login.html';
}
