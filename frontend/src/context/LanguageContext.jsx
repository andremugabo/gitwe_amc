import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Auth & Generic
    appName: "Gitwe AMC Platform",
    signIn: "Sign In",
    signOut: "Sign Out",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    phone: "Phone Number",
    role: "Select Role",
    forgotPassword: "Forgot Password?",
    createAccount: "Create Account",
    backToLogin: "Back to Login",
    verifyEmail: "Verify Email",
    verificationCode: "Verification Code",
    newPassword: "New Password",
    verifyAndActivate: "Verify & Activate",
    resetPasswordBtn: "Reset Password",
    sendCode: "Send Verification Code",
    loading: "Loading...",
    copyright: "Gitwe AMC Administration. All rights reserved.",

    // Locations
    selectUnion: "Select Union",
    selectField: "Select Field",
    selectDistrict: "Select District",
    selectChurch: "Select Local Church",

    // Roles
    UNION_ADMIN: "Union Administrator",
    FIELD_SECRETARY: "Field Secretary",
    PASTOR: "Pastor",
    ELDER: "Church Elder",

    // Sidebar & Navigation
    dashboard: "Overview Dashboard",
    users: "User Management",
    courses: "Training Courses",
    notifications: "Notifications",
    register_elder: "Elder Registration",
    sessions: "Lecture Sessions",
    attendance: "Attendance Check",
    recommend: "Recommendations",
    elearning: "E-learning Library",
    certificates: "Certificates",

    // Dashboard Hub
    welcome: "Welcome back",
    statsOverview: "System Metrics Overview",
    totalElders: "Total Elders",
    activeCourses: "Active Courses",
    recommendationsCount: "Pending Recommendations",
    totalFields: "Total Fields",
    totalDistricts: "Total Districts",
    totalChurches: "Total Churches",
    actions: "Quick Actions",
    scheduleCourse: "Schedule New Course",
    createNewAccount: "Create Leader Account",
    exportData: "Export Global Data (CSV)",
    enrollElder: "Enroll Elder in Course",
    createSession: "Create Session",
    markAttendance: "Mark Attendance Sheet",
    recommendElder: "Recommend Elder for Course",
    downloadCertificate: "Download Certificate"
  },
  kin: {
    // Auth & Generic
    appName: "Urubuga rwa Gitwe AMC",
    signIn: "Injira",
    signOut: "Sohoka",
    email: "Imeri",
    password: "Ijambo ry'ibanga",
    fullName: "Amazina Yose",
    phone: "Numero ya Telefone",
    role: "Hitamo Inshingano",
    forgotPassword: "Wibagiwe ijambo ry'ibanga?",
    createAccount: "Fungura Konti",
    backToLogin: "Subira Inyuma",
    verifyEmail: "Komeza Imeri",
    verificationCode: "Kode yo Kwemeza",
    newPassword: "Ijambo ry'ibanga Rishya",
    verifyAndActivate: "Emeza Konti",
    resetPasswordBtn: "Hindura Ijambo ry'ibanga",
    sendCode: "Yohereza Kode yo Kwemeza",
    loading: "Biracyatunganywa...",
    copyright: "Ubuyobozi bwa Gitwe AMC. Uburenganzira bwose burabitswe.",

    // Locations
    selectUnion: "Hitamo Union",
    selectField: "Hitamo Field",
    selectDistrict: "Hitamo District",
    selectChurch: "Hitamo Itorero ryawe",

    // Roles
    UNION_ADMIN: "Umuyobozi wa Union",
    FIELD_SECRETARY: "Umunyamabanga wa Field",
    PASTOR: "Pasiteri",
    ELDER: "Umusaza w'Itorero",

    // Sidebar & Navigation
    dashboard: "Ibiro Bikuru",
    users: "Gucunga Abakoresha",
    courses: "Amasomo y'Amahugurwa",
    notifications: "Imenyekanisha",
    register_elder: "Kwandika Abasaza",
    sessions: "Inyigisho",
    attendance: "Kugenzura Abahozeho",
    recommend: "Kugira Inama",
    elearning: "Gusoma Amasomo",
    certificates: "Impamyabushobozi",

    // Dashboard Hub
    welcome: "Murakaza neza",
    statsOverview: "Incamake y'Imibare",
    totalElders: "Abasaza Bose",
    activeCourses: "Amasomo Akora",
    recommendationsCount: "Abasabirwa Amahugurwa",
    totalFields: "Fields Zose",
    totalDistricts: "Districts Zose",
    totalChurches: "Amatorero Yose",
    actions: "Ibikorwa Byihuse",
    scheduleCourse: "Shyiraho Isomo Rishya",
    createNewAccount: "Fungurira Konti Umuyobozi",
    exportData: "Gukura Raporo Hanze (CSV)",
    enrollElder: "Yandika Umusaza mu Isomo",
    createSession: "Canga Inyigisho",
    markAttendance: "Yandika Abitabiriye",
    recommendElder: "Gira Inama y'Umusaza Uhugurwa",
    downloadCertificate: "Kurura Impamyabushobozi"
  },
  fr: {
    // Auth & Generic
    appName: "Plateforme Gitwe AMC",
    signIn: "Se Connecter",
    signOut: "Se Déconnecter",
    email: "Adresse E-mail",
    password: "Mot de Passe",
    fullName: "Nom Complet",
    phone: "Numéro de Téléphone",
    role: "Sélectionner le Rôle",
    forgotPassword: "Mot de passe oublié?",
    createAccount: "Créer un Compte",
    backToLogin: "Retour",
    verifyEmail: "Vérifier l'E-mail",
    verificationCode: "Code de Validation",
    newPassword: "Nouveau Mot de Passe",
    verifyAndActivate: "Valider & Activer",
    resetPasswordBtn: "Réinitialiser",
    sendCode: "Envoyer le Code",
    loading: "Chargement...",
    copyright: "Administration Gitwe AMC. Tous droits réservés.",

    // Locations
    selectUnion: "Sélectionner l'Union",
    selectField: "Sélectionner le Field",
    selectDistrict: "Sélectionner le District",
    selectChurch: "Sélectionner l'Église Locale",

    // Roles
    UNION_ADMIN: "Administrateur de l'Union",
    FIELD_SECRETARY: "Secrétaire de Field",
    PASTOR: "Pasteur",
    ELDER: "Ancien d'Église",

    // Sidebar & Navigation
    dashboard: "Tableau de Bord",
    users: "Gestion Utilisateurs",
    courses: "Cours de Formation",
    notifications: "Notifications",
    register_elder: "Enregistrement Anciens",
    sessions: "Sessions de Cours",
    attendance: "Feuille de Présence",
    recommend: "Recommandations",
    elearning: "Bibliothèque Numérique",
    certificates: "Certificats",

    // Dashboard Hub
    welcome: "Bienvenue",
    statsOverview: "Aperçu des Métriques",
    totalElders: "Total des Anciens",
    activeCourses: "Cours Actifs",
    recommendationsCount: "Recommandations en Attente",
    totalFields: "Total des Fields",
    totalDistricts: "Total des Districts",
    totalChurches: "Total des Églises",
    actions: "Actions Rapides",
    scheduleCourse: "Planifier un Nouveau Cours",
    createNewAccount: "Créer un Compte Leader",
    exportData: "Exporter les Données (CSV)",
    enrollElder: "Inscrire l'Ancien au Cours",
    createSession: "Créer une Session",
    markAttendance: "Marquer la Présence",
    recommendElder: "Recommander un Ancien",
    downloadCertificate: "Télécharger le Certificat"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('gitwe_lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('gitwe_lang', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
