# إضافة ProDent MediaStore Plugin في مشروع Capacitor (أندرويد)

هذه الإضافة تتيح حفظ ملفات النسخ الاحتياطي JSON مباشرة وبشكل آمن داخل مجلد:
`Downloads/ProDent/ProDent_YYYY-MM-DD_HH-mm-ss.json`
باستخدام واجهة برمجة تطبيقات Android MediaStore الرسمية المتوافقة مع Scoped Storage (أندرويد 10 فما فوق) دون الحاجة لأذونات معقدة.

---

### طريقة التركيب في مشروع Capacitor:

1. انسخ ملف `ProDentMediaStorePlugin.java` إلى المسار التالي داخل مجلد مشروع الأندرويد:
   `android/app/src/main/java/com/prodent/app/plugins/ProDentMediaStorePlugin.java`
   *(تأكد من تعديل اسم الحزمة package إذا كان معرف تطبيقك مختلفاً)*.

2. في ملف `MainActivity.java` الموجود في:
   `android/app/src/main/java/<your/package>/MainActivity.java`

   أضف استدعاء التسجيل التالي:
   ```java
   import com.prodent.app.plugins.ProDentMediaStorePlugin;

   public class MainActivity extends BridgeActivity {
       @Override
       public void onCreate(Bundle savedInstanceState) {
           registerPlugin(ProDentMediaStorePlugin.class);
           super.onCreate(savedInstanceState);
       }
   }
   ```

3. عند تشغيل التطبيق في المتصفح أو كتطبيق PWA أو في Capacitor، يتعرف الكود البرمجي تلقائياً على البيئة:
   - في بيئة الويب / PWA: يقوم بتنزيل الملف عبر Blob أو File System Access API.
   - في بيئة تطبيق أندرويد Capacitor: يقوم بحفظ الملف فوراً في `Downloads/ProDent` دون فتح نافذة المشاركة، مع إظهار إشعار النجاح فقط بعد اكتمال الحفظ الفعلي.
