export const translations = {
  English: {
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your preferences and notifications.',
    'settings.theme.title': 'Theme',
    'settings.theme.subtitle': 'Choose a visual preset for your workspace',
    'settings.lang.title': 'Language',
    'settings.lang.subtitle': 'Choose your preferred interface language',
    
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.papers': 'My Papers',
    'nav.global': 'Global Research',
    'nav.graph': 'Knowledge Graph',
    'nav.settings': 'Settings',
    'nav.upload': 'Upload Paper',
  },
  Hindi: {
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपनी प्राथमिकताओं और सूचनाओं का प्रबंधन करें।',
    'settings.theme.title': 'थीम',
    'settings.theme.subtitle': 'अपने कार्यक्षेत्र के लिए एक दृश्य प्रीसेट चुनें',
    'settings.lang.title': 'भाषा',
    'settings.lang.subtitle': 'अपनी पसंदीदा इंटरफ़ेस भाषा चुनें',
    
    // Sidebar
    'nav.dashboard': 'डैशबोर्ड',
    'nav.papers': 'मेरे पेपर',
    'nav.global': 'वैश्विक शोध',
    'nav.graph': 'नॉलेज ग्राफ',
    'nav.settings': 'सेटिंग्स',
    'nav.upload': 'पेपर अपलोड करें',
  },
  Telugu: {
    // Settings
    'settings.title': 'సెట్టింగ్‌లు',
    'settings.subtitle': 'మీ ప్రాధాన్యతలను మరియు నోటిఫికేషన్‌లను నిర్వహించండి.',
    'settings.theme.title': 'థీమ్',
    'settings.theme.subtitle': 'మీ వర్క్‌స్పేస్ కోసం విజువల్ ప్రీసెట్‌ను ఎంచుకోండి',
    'settings.lang.title': 'భాష',
    'settings.lang.subtitle': 'మీకు ఇష్టమైన ఇంటర్ఫేస్ భాషను ఎంచుకోండి',
    
    // Sidebar
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.papers': 'నా పత్రాలు',
    'nav.global': 'గ్లోబల్ రీసెర్చ్',
    'nav.graph': 'నాలెడ్జ్ గ్రాఫ్',
    'nav.settings': 'సెట్టింగ్‌లు',
    'nav.upload': 'పేపర్‌ను అప్‌లోడ్ చేయండి',
  }
};

export type Language = 'English' | 'Hindi' | 'Telugu';
export type TranslationKey = keyof typeof translations['English'];
