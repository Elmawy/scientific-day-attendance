// نقل المتغيرات العامة إلى config.js
// حذف تعريف currentLoginMethod من هنا

// وظيفة تبديل طريقة تسجيل الدخول
function switchLoginMethod(method) {
    window.currentLoginMethod = method; // استخدام window للمتغير العام
    const codeLogin = document.getElementById('codeLogin');
    const credentialsLogin = document.getElementById('credentialsLogin');
    const options = document.querySelectorAll('.login-option');
    
    options.forEach(option => option.classList.remove('active'));
    
    if (method === 'code') {
        codeLogin.style.display = 'block';
        credentialsLogin.style.display = 'none';
        options[0].classList.add('active');
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
    } else {
        codeLogin.style.display = 'none';
        credentialsLogin.style.display = 'block';
        options[1].classList.add('active');
        document.getElementById('attendanceCode').value = '';
    }
}

// دالة للتحقق من صحة المدخلات
function validateInputs(params) {
    if (window.currentLoginMethod === 'code') {
        if (!params.attendanceCode) {
            throw new Error('الرجاء إدخال رمز الحضور');
        }
    } else {
        if (!params.email) {
            throw new Error('الرجاء إدخال البريد الإلكتروني');
        }
        if (!params.phone) {
            throw new Error('الرجاء إدخال رقم الجوال');
        }
    }
    return true;
}

// دالة الاتصال بالخادم
async function fetchData(params) {
    try {
        const url = new URL(API_URL);
        
        // تأكد من إضافة action في المعلمات
        if (!params.action) {
            params.action = 'verifyUser';
        }
        
        // إضافة المعلمات إلى URL
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        console.log('URL الطلب:', url.toString()); // للتأكد من URL

        const response = await fetch(url.toString(), {
            method: 'GET',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('فشل في الاتصال بالخادم');
        }

        const data = await response.json();
        console.log('الاستجابة:', data); // للتأكد من الاستجابة

        if (!data.success) {
            throw new Error(data.message || 'حدث خطأ غير معروف');
        }

        return data;
    } catch (error) {
        console.error('خطأ:', error);
        throw error;
    }
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');

        try {
            errorMessage.style.display = 'none';
            submitButton.disabled = true;
            loadingMessage.style.display = 'block';
            loadingMessage.textContent = 'جاري التحقق...';

            const params = {
                action: 'verifyUser'
            };

            if (window.currentLoginMethod === 'code') {
                const code = document.getElementById('attendanceCode').value.trim();
                if (!code) {
                    throw new Error('الرجاء إدخال رمز الحضور');
                }
                params.attendanceCode = code;
            } else {
                const email = document.getElementById('email').value.trim();
                const phone = document.getElementById('phone').value.trim();
                if (!email) {
                    throw new Error('الرجاء إدخال البريد الإلكتروني');
                }
                if (!phone) {
                    throw new Error('الرجاء إدخال رقم الجوال');
                }
                params.email = email;
                params.phone = phone;
            }

            const response = await fetchData(params);

            if (response.success) {
                // تخزين بيانات المستخدم
                localStorage.setItem('userData', JSON.stringify(response.data));
                // تخزين البريد الإلكتروني ورقم الهاتف بشكل منفصل
                localStorage.setItem('userEmail', response.data.email);
                localStorage.setItem('userPhone', response.data.phone);
                window.location.href = 'profile.html';
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            console.error('Error:', error);
        } finally {
            submitButton.disabled = false;
            loadingMessage.style.display = 'none';
        }
    });
});
