const express = require('express');
const app = express();
const request = require('request');
const wikip = require('wiki-infobox-parser');

// إعداد الـ view engine على EJS
app.set("view engine", "ejs");

// ---------------------------
// الصفحة الرئيسية
// ---------------------------
app.get('/', (req, res) => {
    res.render('index'); // سيعرض views/index.ejs
});

// ---------------------------
// API للحصول على بيانات شخص
// ---------------------------
app.get('/api/person', (req, response) => {
    const personName = req.query.name;

    if (!personName) {
        return response.status(400).json({ error: "يرجى إدخال اسم الشخص عبر ?name=" });
    }

    let url = "https://en.wikipedia.org/w/api.php";
    let params = {
        action: "opensearch",
        search: personName,
        limit: "1",
        namespace: "0",
        format: "json"
    };

    url = url + "?";
    Object.keys(params).forEach((key) => {
        url += "&" + key + "=" + params[key];
    });

    // إرسال الطلب لويكيبيديا
    request(url, (err, res, body) => {
        if (err) {
            return response.status(500).json({ error: "خطأ في الاتصال بويكيبيديا" });
        }

        const result = JSON.parse(body);

        // إذا لم توجد نتيجة
        if (!result[3] || !result[3][0]) {
            return response.status(404).json({ error: "الشخص غير موجود" });
        }

        let x = result[3][0];
        x = x.substring(30, x.length); // استخراج عنوان الصفحة

        // جلب بيانات infobox
        wikip(x, (err, final) => {
            if (err) {
                return response.status(500).json({ error: "تعذر جلب بيانات infobox" });
            } else {
                response.json(final);
            }
        });
    });
});

// ---------------------------
// تشغيل السيرفر
// ---------------------------
app.listen(3000, () => {
    console.log("🚀 السيرفر شغال على http://localhost:3000");
});
