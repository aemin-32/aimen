# دليل الثيمات (Themes) - الجزء الأول: محرك الثيمات والتخصيص 🎨

هذا الدليل يشرح كيفية عمل محرك الثيمات في LifeOS وكيفية إنشاء ثيمات مخصصة بالكامل تشمل الألوان، الأنماط (CSS)، الأصوات، والأنيميشن.

## 1. هيكل الثيم (Theme JSON Structure)

كل ثيم في النظام عبارة عن كائن JSON يحتوي على الخصائص التالية:

```json
{
  "id": "theme_pubg",
  "name": "PUBG Mobile",
  "colors": {
    "--color-life-bg": "#1a1a1a",
    "--color-life-black": "#2a2a2a",
    "--color-life-paper": "#333333",
    "--color-life-text": "#f3f4f6",
    "--color-life-muted": "#9ca3af",
    "--color-life-gold": "#f59e0b",
    "--color-life-easy": "#10b981",
    "--color-life-hard": "#ef4444"
  },
  "soundPack": "pubg",
  "animationStyle": "bouncy",
  "customCss": "body[data-theme='theme_pubg'] button { border-radius: 0; text-transform: uppercase; font-family: 'Impact', sans-serif; }",
  "customSounds": {
    "click": "https://example.com/sounds/pubg_click.mp3",
    "success": "https://example.com/sounds/pubg_win.mp3",
    "level-up": "https://example.com/sounds/pubg_levelup.mp3"
  }
}
```

## 2. تخصيص الألوان (Colors)
يتم حقن الألوان كمتغيرات CSS (`CSS Variables`) في جذر المستند (`:root`). يمكنك تغيير أي لون في النظام عبر تعديل هذه المتغيرات.
- `--color-life-bg`: لون الخلفية الرئيسي.
- `--color-life-gold`: اللون المميز (Accent Color) المستخدم في الأزرار والتنبيهات.
- `--color-life-paper`: لون البطاقات والعناصر البارزة.

## 3. تخصيص الأنيميشن (Animations)
يمكنك التحكم في الأنيميشن بطريقتين:
1. **عبر `animationStyle`**: يمكنك اختيار أحد الأنماط الجاهزة (`default`, `fast`, `bouncy`, `none`).
2. **عبر `customCss`**: يمكنك كتابة كود CSS مخصص لإضافة حركات جديدة. مثال:
   ```css
   body[data-theme='theme_pubg'] button:active {
       transform: scale(0.95);
       transition: transform 0.1s;
   }
   ```

## 4. تخصيص الأصوات (Sounds)
محرك الصوت في LifeOS يدعم الأصوات المولدة برمجياً (Synthesizer) والأصوات المخصصة (Custom Audio Files).

### أ. حزم الأصوات الجاهزة (Sound Packs)
يمكنك اختيار حزمة أصوات جاهزة عبر خاصية `soundPack`:
- `default`: الأصوات الافتراضية.
- `cyberpunk`: أصوات إلكترونية حادة.
- `fantasy`: أصوات سحرية وهادئة.
- `retro`: أصوات ألعاب 8-bit.
- `pubg`: أصوات مستوحاة من ألعاب البقاء (تمت إضافتها حديثاً).

### ب. الأصوات المخصصة (Custom Sounds)
إذا أردت استخدام أصواتك الخاصة، يمكنك إضافة روابط لملفات صوتية (MP3/WAV) في خاصية `customSounds`.
الأحداث المدعومة:
- `click`: عند الضغط على زر.
- `success`: عند إكمال مهمة.
- `level-up`: عند رفع مستوى مهارة.
- `crit`: عند إكمال مهمة صعبة جداً أو Raid.
- `error`: عند حدوث خطأ.
- `delete`: عند حذف عنصر.

**ملاحظة:** يمكنك رفع الأصوات على منصات مثل GitHub Pages أو أي استضافة ملفات مباشرة، ثم وضع الرابط المباشر للملف الصوتي في الـ JSON.

---
*تم إعداد هذا الدليل بواسطة نظام Zayn2.*
