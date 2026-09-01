export interface ContentPageData {
  content_ar: string;
  content_en: string;
}

export const MOCK_TERMS_CONTENT: ContentPageData = {
  content_ar: `
<h2>الشروط والأحكام</h2>
<p>أهلاً بكم في منصة أكاديمية أسباير. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>
<ul>
  <li>يجب استخدام المنصة للأغراض التعليمية والأكاديمية المصرح بها فقط.</li>
  <li>الحفاظ على سرية بيانات تسجيل الدخول وعدم مشاركتها مع أي طرف ثالث.</li>
  <li>جميع المواد والدورات التدريبية محمية بموجب حقوق الملكية الفكرية.</li>
  <li>تحتفظ المنصة بالحق في تعديل أو تحديث هذه الشروط في أي وقت.</li>
</ul>
`.trim(),
  content_en: `
<h2>Terms & Conditions</h2>
<p>Welcome to Aspire Academy Dashboard. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions:</p>
<ul>
  <li>The platform must only be used for authorized educational and training purposes.</li>
  <li>Users are responsible for maintaining the confidentiality of their login credentials.</li>
  <li>All course materials and training curricula are protected by intellectual property laws.</li>
  <li>The administration reserves the right to update these terms at any time.</li>
</ul>
`.trim(),
};

export const MOCK_ABOUT_CONTENT: ContentPageData = {
  content_ar: `
<h2>من نحن</h2>
<p>أكاديمية أسباير هي منصة رائدة متخصصة في تقديم الدورات التدريبية الطبية والرعاية الصحية المتطورة.</p>
<p>نسعى إلى تمكين الأطباء والكوادر الصحية من خلال تقديم محتوى تدريبي متميز بإشراف نخبة من كبار المحاضرين والمتخصصين في مختلف المجالات الطبية.</p>
<ul>
  <li><strong>رؤيتنا:</strong> الارتقاء بالتعليم الطبي المستمر في العالم العربي.</li>
  <li><strong>رسالتنا:</strong> توفير بيئة تعليمية مرنة وتفاعلية تضمن أعلى معايير الجودة الأكاديمية.</li>
</ul>
`.trim(),
  content_en: `
<h2>About Us</h2>
<p>Aspire Academy is a leading educational platform specializing in advanced medical and healthcare training courses.</p>
<p>We aim to empower healthcare professionals through high-quality training content delivered by top medical experts and accredited instructors.</p>
<ul>
  <li><strong>Our Vision:</strong> To elevate continuous medical education across the region.</li>
  <li><strong>Our Mission:</strong> To provide flexible, interactive learning adhering to the highest academic standards.</li>
</ul>
`.trim(),
};
