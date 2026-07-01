import { useEffect, useState } from "react";
import useBodyClass from "../hooks/useBodyClass.js";
import useDocumentLanguage from "../hooks/useDocumentLanguage.js";
import useDocumentMeta from "../hooks/useDocumentMeta.js";
import InnerHeader from "../components/InnerHeader.jsx";
import logo from "../../assets/images/logo-20260401.png";
import companyHero from "../../assets/images/entreprise-hero.png";

const translations = {
  fr: {
    dir: "ltr",
    meta: {
      title: "L'entreprise | Aventron Technologies",
      description:
        "Découvrez Aventron Technologies, ses solutions d'eau chaude, de photovoltaïque, d'étude et d'ingénierie pour maisons, entreprises et sites industriels au Maroc.",
    },
    nav: {
      home: "Accueil",
      solutions: "Solutions",
      sectors: "Secteurs",
      projects: "Projets",
      company: "Entreprise",
      contact: "Contact",
      cta: "Demander un devis",
    },
    hero: {
      eyebrow: "L'entreprise",
      title: "Aventron Technologies",
      lead:
        "Aventron Technologies développe une approche claire, premium et sérieuse des solutions d'eau chaude, de photovoltaïque et des services techniques au Maroc. Nous proposons des chauffe-eau solaires, chauffe-eau électriques, études, services d'ingénierie, installation et accompagnement pour les projets résidentiels, tertiaires et industriels.",
    },
    vision: {
      eyebrow: "Vision",
      title: "Une marque orientée innovation et confiance",
      body1:
        "Nous croyons qu'une solution d'eau chaude ou d'énergie ne doit pas seulement être utile. Elle doit aussi inspirer confiance, offrir un bon niveau de finition et s'intégrer dans une expérience moderne.",
      body2:
        "C'est dans cette logique qu'Aventron Technologies associe étude, ingénierie, fourniture, installation, mise en service et accompagnement client avec une communication claire.",
    },
    approach: {
      title: "Notre approche",
      items: [
        "Solutions de chauffe-eau solaires, chauffe-eau électriques et photovoltaïque",
        "Étude, dimensionnement et ingénierie selon les besoins réels du projet",
        "Installation sérieuse, mise en service et accompagnement client",
        "Une exigence premium pour le résidentiel, le tertiaire et l'industrie",
      ],
    },
    footer: {
      body: "Aventron Technologies, une marque tournée vers l'eau chaude, le photovoltaïque, l'ingénierie et la qualité de service au Maroc.",
      facebook: "Facebook",
      instagram: "Instagram",
    },
  },
  en: {
    dir: "ltr",
    meta: {
      title: "The Company | Aventron Technologies",
      description:
        "Discover Aventron Technologies, its hot water, photovoltaic, engineering, and technical services for homes, businesses, and industrial sites in Morocco.",
    },
    nav: {
      home: "Home",
      solutions: "Solutions",
      sectors: "Sectors",
      projects: "Projects",
      company: "Company",
      contact: "Contact",
      cta: "Request a quote",
    },
    hero: {
      eyebrow: "The company",
      title: "Aventron Technologies",
      lead:
        "Aventron Technologies develops a clear, premium, and serious approach to hot water solutions, photovoltaic systems, and technical services in Morocco. We offer solar water heaters, electric water heaters, engineering studies, installation, and support for residential, tertiary, and industrial projects.",
    },
    vision: {
      eyebrow: "Vision",
      title: "A brand focused on innovation and trust",
      body1:
        "We believe a hot water or energy solution should not only be useful. It should also inspire trust, deliver a strong level of finish, and fit into a modern experience.",
      body2:
        "That is why Aventron Technologies combines studies, engineering, supply, installation, commissioning, and customer support with clear communication.",
    },
    approach: {
      title: "Our approach",
      items: [
        "Solar water heaters, electric water heaters, and photovoltaic solutions",
        "Studies, sizing, and engineering based on real project needs",
        "Serious installation, commissioning, and customer support",
        "A premium standard for residential, tertiary, and industrial projects",
      ],
    },
    footer: {
      body: "Aventron Technologies, a brand focused on hot water, photovoltaic, engineering, and service quality in Morocco.",
      facebook: "Facebook",
      instagram: "Instagram",
    },
  },
  ar: {
    dir: "rtl",
    meta: {
      title: "الشركة | Aventron Technologies",
      description:
        "اكتشف Aventron Technologies وحلولها في الماء الساخن والطاقة الشمسية الكهروضوئية والدراسات والخدمات الهندسية للمنازل والشركات والمواقع الصناعية في المغرب.",
    },
    nav: {
      home: "الرئيسية",
      solutions: "الحلول",
      sectors: "القطاعات",
      projects: "المشاريع",
      company: "الشركة",
      contact: "تواصل",
      cta: "اطلب عرض سعر",
    },
    hero: {
      eyebrow: "الشركة",
      title: "Aventron Technologies",
      lead:
        "تطور Aventron Technologies مقاربة واضحة ومتميزة وجدية لحلول الماء الساخن والطاقة الشمسية الكهروضوئية والخدمات التقنية في المغرب. نحن نوفر سخانات مياه شمسية، سخانات مياه كهربائية، دراسات، خدمات هندسية، تركيب ومرافقة للمشاريع السكنية والقطاع الثالثي والصناعية.",
    },
    vision: {
      eyebrow: "الرؤية",
      title: "علامة ترتكز على الابتكار والثقة",
      body1:
        "نؤمن أن حل الماء الساخن أو الطاقة لا يجب أن يكون مفيدا فقط. يجب أيضا أن يمنح الثقة، ويقدم مستوى تشطيب جيد، ويندمج في تجربة حديثة.",
      body2:
        "لهذا تجمع Aventron Technologies بين الدراسة والهندسة والتوريد والتركيب ووضع الخدمة ومرافقة العميل مع تواصل واضح.",
    },
    approach: {
      title: "مقاربتنا",
      items: [
        "حلول سخانات المياه الشمسية وسخانات المياه الكهربائية والطاقة الكهروضوئية",
        "دراسة وقياس وخدمات هندسية حسب الحاجيات الحقيقية للمشروع",
        "تركيب جدي ووضع الخدمة ومرافقة للعميل",
        "مستوى premium للسكني والقطاع الثالثي والمشاريع الصناعية",
      ],
    },
    footer: {
      body: "Aventron Technologies علامة موجهة نحو الماء الساخن والطاقة الكهروضوئية والهندسة وجودة الخدمة في المغرب.",
      facebook: "فيسبوك",
      instagram: "إنستغرام",
    },
  },
};

export default function CompanyPage() {
  const [language, setLanguage] = useState(() => window.localStorage.getItem("aventron-language") || "fr");
  const content = translations[language] || translations.fr;

  useBodyClass("landing-page");
  useDocumentLanguage(language, content.dir);
  useDocumentMeta(content.meta.title, content.meta.description);

  useEffect(() => {
    window.localStorage.setItem("aventron-language", language);
  }, [language]);

  return (
    <>
      <InnerHeader
        labels={content.nav}
        ctaLabel={content.nav.cta}
        ctaHref="/contact.html"
        showLanguageSwitcher
        language={language}
        onLanguageChange={setLanguage}
      />

      <main>
        <section className="landing-hero">
          <div className="container landing-hero__grid">
            <div>
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1>{content.hero.title}</h1>
              <p className="landing-lead">{content.hero.lead}</p>
            </div>
            <div className="landing-hero__visual">
              <img src={companyHero} alt="Aventron Technologies équipe et accueil entreprise" />
            </div>
          </div>
        </section>

        <section className="section landing-section">
          <div className="container landing-split">
            <div>
              <p className="eyebrow">{content.vision.eyebrow}</p>
              <h2>{content.vision.title}</h2>
              <p>{content.vision.body1}</p>
              <p>{content.vision.body2}</p>
            </div>
            <div className="glass-card landing-panel">
              <h3>{content.approach.title}</h3>
              <ul className="landing-list">
                {content.approach.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div>
            <img className="site-footer__logo" src={logo} alt="Aventron Technologies" />
            <p className="site-footer__text">{content.footer.body}</p>
          </div>
          <div className="site-footer__socials">
            <a href="https://www.facebook.com/aventrontech" target="_blank" rel="noreferrer">
              {content.footer.facebook}
            </a>
            <a href="https://www.instagram.com/aventrontechnologies" target="_blank" rel="noreferrer">
              {content.footer.instagram}
            </a>
          </div>
          <div className="site-footer__meta">
            <a href="mailto:info@aventrontechnologies.ma">info@aventrontechnologies.ma</a>
            <a href="tel:+212722667235">+212 722 667 235</a>
          </div>
        </div>
      </footer>
    </>
  );
}
