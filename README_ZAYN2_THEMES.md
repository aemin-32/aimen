# دليل الثيمات (Themes) - التخصيص المتقدم (Animations & Sounds) 🎨🔊

هذا الدليل يشرح كيفية إنشاء وتخصيص الثيمات في النظام، بما في ذلك الألوان، الـ CSS المخصص، وتعديلات الأنيميشن والأصوات (Sound Packs).

## 1. هيكل الثيم (JSON Structure)

يمكنك حقن ثيمات جديدة للنظام باستخدام هيكل الـ JSON التالي:

```json
{
  "themes": [
    {
      "id": "theme_cyberpunk_neon",
      "name": "Cyberpunk Neon",
      "colors": {
        "--color-life-black": "#050510",
        "--color-life-paper": "#0a0a1a",
        "--color-life-gold": "#00ffcc",
        "--color-life-text": "#e0e0ff",
        "--color-life-muted": "#4a4a8a",
        "--color-life-bg-gradient": "linear-gradient(to bottom, #050510, #1a0a2a)"
      },
      "soundPack": "cyberpunk",
      "animationStyle": "fast",
      "customCss": "body { font-family: 'Courier New', monospace; } .rounded-lg { border-radius: 0 !important; border: 1px solid #00ffcc; }"
    }
  ]
}
```

## 2. حزم الأصوات (Sound Packs) 🔊

النظام الآن يدعم حزم أصوات مختلفة تتغير تلقائياً مع الثيم. يمكنك تحديد الـ `soundPack` في ملف الـ JSON:

- **`default`**: الأصوات الافتراضية للنظام (متوازنة).
- **`cyberpunk`**: أصوات إلكترونية، حادة، ومستقبلية (موجات Square و Sawtooth).
- **`fantasy`**: أصوات ناعمة، سحرية، ومريحة (موجات Triangle).
- **`minimal`**: أصوات هادئة جداً، سريعة، وغير مزعجة (موجات Sine بترددات عالية).
- **`retro`**: أصوات ألعاب الـ 8-bit الكلاسيكية.

## 3. أنماط الأنيميشن (Animation Styles) ⚡

يمكنك التحكم في سرعة وشكل الأنيميشن في كامل التطبيق عبر تحديد `animationStyle`:

- **`default`**: الأنيميشن الافتراضي (سلس وطبيعي).
- **`fast`**: سريع جداً (مناسب للإنتاجية العالية والـ Cyberpunk).
- **`bouncy`**: ارتدادي ومرن (يعطي شعوراً مرحاً وحيوياً).
- **`none`**: إيقاف جميع الأنيميشن (للحصول على أداء أقصى أو تقليل التشتت).

## 4. التخصيص المتقدم (Custom CSS) 🖌️

خاصية `customCss` تسمح لك بكتابة كود CSS حقيقي يتم حقنه في النظام عند تفعيل الثيم.
يمكنك استخدامها لـ:
- تغيير الخطوط (Fonts).
- إخفاء عناصر معينة (مثلاً `display: none`).
- إضافة تأثيرات (Glow, Shadows, Borders).
- تغيير شكل الأزرار بالكامل.

**مثال على Custom CSS لثيم كلاسيكي:**
```css
body { font-family: 'Georgia', serif; }
button { border-radius: 0px !important; border: 2px solid #fbbf24; }
.bg-life-black { background-color: #2c2c2c !important; }
```

---
*تم إكمال دليل الثيمات بنجاح بواسطة نظام Zayn2.*
