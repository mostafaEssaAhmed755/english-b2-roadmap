// ─── Speaking Prompts ─────────────────────────────────────

const SPEAKING_TOPICS = [
  // Phase 0 — Simple daily topics
  [
    "صف روتينك اليومي خطوة بخطوة بالإنجليزية",
    "تحدث عن طعامك المفضل — لماذا تحبه؟",
    "صف غرفتك كأنك تشرح لشخص لم يرها",
    "تحدث عن آخر فيلم أو مسلسل شاهدته",
    "ما هي هواياتك؟ وكم من الوقت تقضي فيها؟",
    "صف يوم عطلتك المثالية",
    "تحدث عن مدينتك — ما الجميل فيها؟",
    "صف أفضل وجبة أكلتها في حياتك",
    "تحدث عن شخص تحترمه كثيراً",
    "ما الشيء الذي تريد تعلمه في المستقبل؟",
    "صف طقس اليوم وكيف يؤثر على مزاجك",
    "تحدث عن آخر رحلة قمت بها",
    "ما هو كتابك أو فيلمك المفضل ولماذا؟",
    "صف روتين صباحك خطوة بخطوة",
    "تحدث عن تجربة ممتعة مع الأصدقاء",
    "صف عملك أو دراستك بالتفصيل",
    "ما الاختلاف بين حياتك الآن وقبل 5 سنوات؟",
    "تحدث عن شيء تخطط لشرائه قريباً",
    "صف أجمل مكان زرته في حياتك",
    "تحدث عن هواية جديدة تريد تجربتها"
  ],
  // Phase 1 — Discussion topics
  [
    "ما رأيك في استخدام الذكاء الاصطناعي في التعليم؟",
    "ناقش إيجابيات وسلبيات العمل من المنزل",
    "ما هو الفرق بين الذكاء والنجاح في حياتك؟",
    "كيف تؤثر وسائل التواصل الاجتماعي على الشباب؟",
    "هل يجب على الجميع تعلم لغة ثانية؟ ولماذا؟",
    "ما رأيك في الأفلام العربية مقارنة بالأجنبية؟",
    "كيف تحافظ على صحتك النفسية في ظل ضغوط الحياة؟",
    "ناقش أهمية القراءة في تطوير الشخصية",
    "ما الفرق بين العيش في المدينة والريف؟",
    "كيف يمكن للتكنولوجيا أن تحسن التعليم؟",
    "ناقش تأثير الألعاب الإلكترونية على الأطفال",
    "هل الجامعة ضرورية للنجاح المهني؟",
    "ما رأيك في السياحة الداخلية مقابل الخارجية؟",
    "كيف تختار أصدقاءك؟ ما المعايير المهمة؟",
    "ناقش أهمية الرياضة في الحياة اليومية",
    "ما الذي يجعل شخصاً ما قائداً ناجحاً؟",
    "هل المال هو المحرك الأساسي للسعادة؟",
    "كيف تتعامل مع الفشل والإحباط؟",
    "ناقش أثر العولمة على الثقافة العربية",
    "ما هي أهم المهارات للقرن الحادي والعشرين؟"
  ],
  // Phase 2 — Complex / argumentative topics
  [
    "هل يجب أن يكون التعليم العالي مجانياً؟ أذكر حججاً لكلا الجانبين",
    "ناقش العلاقة بين الفقر والجريمة في المجتمعات",
    "هل الشبكات الاجتماعية ضارة بالمجتمع أكثر من نفعها؟",
    "ما هي المسؤولية الأخلاقية للشركات الكبرى تجاه البيئة؟",
    "كيف يجب أن تتعامل الحكومات مع اللاجئين والمهاجرين؟",
    "ناقش مزايا وعيوب الحضارة الرقمية",
    "هل الفن والإبداع ضروريان بقدر العلوم والرياضيات؟",
    "كيف تؤثر التغيرات المناخية على أسلوب حياتنا؟",
    "ما دور الإعلام في تشكيل الرأي العام؟",
    "ناقش أخلاقيات الذكاء الاصطناعي وحدوده",
    "هل يجب تنظيم الإنترنت بقوانين صارمة؟",
    "كيف يمكن تحقيق التوازن بين التقدم والقيم التقليدية؟",
    "ناقش أثر الاستعمار على الدول النامية حتى اليوم",
    "ما هي أسباب عدم المساواة الاقتصادية وكيف نعالجها؟",
    "هل يجب على الدول الغنية مساعدة الدول الفقيرة؟",
    "ناقش دور المرأة في سوق العمل المعاصر",
    "هل العولمة تهديد أم فرصة للهويات الثقافية؟",
    "كيف يمكن للتعليم أن يقلل من التطرف الفكري؟",
    "ما مستقبل العمل في ظل الأتمتة والروبوتات؟",
    "ناقش أهمية الصحة النفسية في مجتمعاتنا"
  ],
  // Phase 3 — Advanced / formal English
  [
    "Discuss the role of international organisations in resolving global conflicts",
    "Analyse the economic and social effects of urbanisation on developing countries",
    "What are the ethical implications of genetic engineering and cloning?",
    "Discuss the impact of mass media on political processes and democracy",
    "How can countries balance economic growth with environmental sustainability?",
    "Evaluate the effectiveness of international aid programmes",
    "What are the main challenges facing multicultural societies?",
    "Discuss the advantages and disadvantages of globalisation for small economies",
    "How should society balance individual freedoms with public safety?",
    "What role should governments play in regulating technology companies?",
    "Discuss the causes and consequences of income inequality in modern societies",
    "How can education systems better prepare students for the digital economy?",
    "Evaluate the arguments for and against capital punishment",
    "What are the long-term consequences of an ageing population?",
    "Discuss the relationship between language and cultural identity",
    "How can international cooperation address climate change effectively?",
    "What are the ethical responsibilities of artificial intelligence developers?",
    "Discuss the impact of social media on political polarisation",
    "How should healthcare systems adapt to increasing mental health challenges?",
    "What is the future of work in an increasingly automated world?"
  ]
];

function refreshPrompt(phaseIndex) {
  const topics = SPEAKING_TOPICS[phaseIndex] || SPEAKING_TOPICS[0];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const el = document.getElementById('promptText-' + phaseIndex);
  if (el) el.textContent = topic;
}
