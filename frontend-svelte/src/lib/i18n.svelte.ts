export type Language = 'en' | 'hi' | 'gu' | 'mr';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    nav_estimator: 'Estimator',
    nav_quick_calculator: 'Estimator',
    nav_features: 'Features',
    nav_how_it_works: 'How It Works',
    nav_balcony: 'Balcony AI',
    nav_quotes: 'Quote Intelligence',
    nav_pricing: 'Pricing',
    nav_faq: 'FAQ',
    nav_login: 'Login',
    nav_get_started: 'Try Demo Mode',
    hero_badge: 'PM Surya Ghar: Muft Bijli Yojana 2026',
    hero_headline: 'Zero Bullshit Solar for Indian Rooftops & Balconies',
    hero_subhead: 'Independent sizing, neutral quote audits, and direct PM Surya Ghar subsidy calculations. Save up to ₹78,000 on rooftop setups or model your apartment balcony kit in seconds.',
    hero_cta_primary: 'Run Free Solar Sizing',
    hero_cta_secondary: 'Instant Estimator',
    calc_title: 'Instant Svelte 5 Reactive Engine',
    calc_subtitle: 'Calculate system capacity, PM Surya Ghar subsidy, and 25-year returns in 10 milliseconds.',
    calc_monthly_bill: 'Monthly Electricity Bill',
    calc_state: 'State / DISCOM Region',
    calc_capacity: 'Recommended Solar Capacity',
    calc_subsidy: 'PM Surya Ghar Central Subsidy',
    calc_net_cost: 'Net Capital Investment',
    calc_annual_savings: 'Yearly Electricity Savings',
    calc_payback: 'Estimated Payback Period',
    calc_cta: 'Generate Detailed Feasibility Report →',
  },
  hi: {
    nav_estimator: 'कैलकुलेटर',
    nav_quick_calculator: 'कैलकुलेटर',
    nav_features: 'सुविधाएं',
    nav_how_it_works: 'कार्यप्रणाली',
    nav_balcony: 'बालकनी एआई',
    nav_quotes: 'कोटेशन जांच',
    nav_pricing: 'मूल्य',
    nav_faq: 'अक्सर पूछे जाने वाले सवाल',
    nav_login: 'लॉग इन',
    nav_get_started: 'डेमो चलाएं',
    hero_badge: 'पीएम सूर्य घर: मुफ्त बिजली योजना २०२६',
    hero_headline: 'छत और बालकनी पर सोलर, बिना किसी संशय के',
    hero_subhead: 'स्वतंत्र सोलर साइजिंग, सटीक कोटेशन ऑडिट और सीधी पीएम सूर्य घर ₹७८,००० तक की सब्सिडी।',
    hero_cta_primary: 'मुफ्त सोलर साइजिंग करें',
    hero_cta_secondary: 'त्वरित अनुमान देखें',
    calc_title: 'त्वरित स्वेल्ट ५ सोलर इंजन',
    calc_subtitle: 'सिर्फ १० मिलीसेकंड में आवश्यक सोलर क्षमता, सरकारी सब्सिडी और २५ वर्षों की बचत जानें।',
    calc_monthly_bill: 'औसत मासिक बिजली का बिल',
    calc_state: 'राज्य / डिस्कॉम क्षेत्र',
    calc_capacity: 'अनुशंसित सोलर क्षमता',
    calc_subsidy: 'पीएम सूर्य घर केंद्रीय सब्सिडी',
    calc_net_cost: 'कुल शुद्ध निवेश (सब्सिडी बाद)',
    calc_annual_savings: 'वार्षिक बिजली बिल बचत',
    calc_payback: 'निवेश वसूली अवधि',
    calc_cta: 'विस्तृत रिपोर्ट प्राप्त करें →',
  },
  gu: {
    nav_estimator: 'કેલ્ક્યુલેટર',
    nav_quick_calculator: 'કેલ્ક્યુલેટર',
    nav_features: 'વિશેષતાઓ',
    nav_how_it_works: 'કેવી રીતે કામ કરે છે',
    nav_balcony: 'બાલ્કની AI',
    nav_quotes: 'ક્વોટેશન તપાસ',
    nav_pricing: 'કિંમત',
    nav_faq: 'પ્રશ્નોત્તરી',
    nav_login: 'લોગિન',
    nav_get_started: 'ડેમો જુઓ',
    hero_badge: 'પીએમ સૂર્ય ઘર: મફત વીજળી યોજના ૨૦૨૬',
    hero_headline: 'તમારી છત અને બાલ્કની પર સોલાર, કોઈપણ અસમંજસ વગર',
    hero_subhead: 'સ્વતંત્ર સોલાર સાઇઝિંગ, ક્વોટેશનની તુલના અને સીધી પીએમ સૂર્ય ઘર ₹૭૮,૦૦૦ સુધીની સબસિડી.',
    hero_cta_primary: 'મફત સોલાર ગણતરી કરો',
    hero_cta_secondary: 'ઝડપી અંદાજ',
    calc_title: 'ઝડપી સોલાર બચત કેલ્ક્યુલેટર',
    calc_subtitle: '૧૦ મિલીસેકન્ડમાં જરૂરી ક્ષમતા, સરકારી સબસિડી અને ૨૫ વર્ષની બચત મેળવો.',
    calc_monthly_bill: 'સરેરાશ માસિક વીજળી બિલ',
    calc_state: 'રાજ્ય / વીજ વિતરણ કંપની',
    calc_capacity: 'જરૂરી સોલાર ક્ષમતા',
    calc_subsidy: 'પીએમ સૂર્ય ઘર કેન્દ્રીય સબસિડી',
    calc_net_cost: 'ચોખ્ખું રોકાણ (સબસિડી બાદ)',
    calc_annual_savings: 'વાર્ષિક વીજળી બચત',
    calc_payback: 'રોકાણ પરત આવવાનો સમય',
    calc_cta: 'સંપૂર્ણ અહેવાલ ડાઉનલોડ કરો →',
  },
  mr: {
    nav_estimator: 'कॅल्क्युलेटर',
    nav_quick_calculator: 'कॅल्क्युलेटर',
    nav_features: 'वैशिष्ट्ये',
    nav_how_it_works: 'हे कसे कार्य करते',
    nav_balcony: 'बाल्कनी AI',
    nav_quotes: 'कोटेशन पडताळणी',
    nav_pricing: 'दर',
    nav_faq: 'वारंवार विचारले जाणारे प्रश्न',
    nav_login: 'लॉगिन',
    nav_get_started: 'डेमो पहा',
    hero_badge: 'पीएम सूर्य घर: मोफत वीज योजना २०२६',
    hero_headline: 'घराच्या छतावर व बाल्कनीत सोलर, पूर्ण पारदर्शकतेसह',
    hero_subhead: 'स्वतंत्र सोलर सायझिंग, निष्पक्ष कोटेशन तपासणी आणि थेट पीएम सूर्य घर ₹७८,००० पर्यंत सबसिडी.',
    hero_cta_primary: 'मोफत सोलर तपासणी करा',
    hero_cta_secondary: 'त्वरित अंदाज',
    calc_title: 'त्वरित सोलर बचत कॅल्क्युलेटर',
    calc_subtitle: '१० मिलीसेकंदात आवश्यक सोलर क्षमता, सरकारी सबसिडी आणि २५ वर्षांची वीज बचत जाणा.',
    calc_monthly_bill: 'सरासरी मासिक वीज बिल',
    calc_state: 'राज्य / वीज वितरण मंडळ',
    calc_capacity: 'शिफारस केलेली सोलर क्षमता',
    calc_subsidy: 'पीएम सूर्य घर केंद्रीय सबसिડી',
    calc_net_cost: 'एकूण निव्वळ गुंतवणूक',
    calc_annual_savings: 'वार्षिक वीज बचत',
    calc_payback: 'गुंतवणूक परतफेडीचा कालावधी',
    calc_cta: 'तपशीलवार अहवाल मिळवा →',
  },
};

const STORAGE_KEY = 'rooftogrid_language_pref';

class I18nManager {
  current = $state<Language>('en');

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && ['en', 'hi', 'gu', 'mr'].includes(stored)) {
        this.current = stored;
      }
    }
  }

  setLanguage(lang: Language) {
    this.current = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  t(key: string, fallback?: string): string {
    const val = TRANSLATIONS[this.current]?.[key] ?? TRANSLATIONS['en']?.[key];
    if (val !== undefined) return val;
    return fallback ?? key;
  }
}

export const i18n = new I18nManager();
