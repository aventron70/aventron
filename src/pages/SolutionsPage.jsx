import useBodyClass from "../hooks/useBodyClass.js";
import useDocumentLanguage from "../hooks/useDocumentLanguage.js";
import useDocumentMeta from "../hooks/useDocumentMeta.js";
import InnerHeader from "../components/InnerHeader.jsx";
import StandardFooter from "../components/StandardFooter.jsx";
import heroEnergy from "../../assets/images/hero-energy-cinematic-v2.png";

const labels = {
  home: "Accueil",
  solutions: "Solutions",
  sectors: "Secteurs",
  projects: "Projets",
  company: "Entreprise",
  contact: "Contact",
};

const solutionCards = [
  {
    href: "/chauffe-eau-solaires.html",
    eyebrow: "Solaire",
    title: "Chauffe-eau solaires",
    body: "Pour produire l’eau chaude du quotidien avec une approche durable, claire et adaptée au résidentiel comme à l’hôtellerie.",
    meta: ["Maisons", "Hôtels", "Collectif"],
  },
  {
    href: "/chauffe-eau-electriques.html",
    eyebrow: "Électrique",
    title: "Chauffe-eau électriques",
    body: "Pour l’appoint, la continuité de service et les usages réguliers dans l’habitat, le tertiaire et certains sites collectifs.",
    meta: ["Appoint", "Continuité", "Tertiaire"],
  },
  {
    href: "/photovoltaique.html",
    eyebrow: "Photovoltaïque",
    title: "Photovoltaïque",
    body: "Pour réduire la facture électrique, gagner en autonomie et structurer une stratégie énergétique plus cohérente.",
    meta: ["Autoconsommation", "Batteries", "Pompage"],
  },
  {
    href: "/solutions-industrielles.html",
    eyebrow: "Industriel",
    title: "Solutions industrielles",
    body: "Pour les grands volumes et les projets intégrant ballons, résistances, armoires électriques, sécurité hydraulique, régulation et mise en service.",
    meta: ["Grande capacité", "Sécurité hydraulique", "Régulation"],
  },
];

const methodStats = [
  {
    title: "Étude",
    body: "Analyse du bâtiment, du profil de consommation et des objectifs du projet.",
  },
  {
    title: "Dimensionnement",
    body: "Choix des capacités, des organes de sécurité et de l’architecture technique adaptée.",
  },
  {
    title: "Exécution",
    body: "Installation, raccordement, réglages et accompagnement à la mise en service.",
  },
];

export default function SolutionsPage() {
  useBodyClass("landing-page page-shell");
  useDocumentLanguage("fr", "ltr");
  useDocumentMeta(
    "Solutions | Aventron Technologies",
    "Découvrez les solutions Aventron Technologies en chauffe-eau solaires, chauffe-eau électriques, photovoltaïque et solutions industrielles au Maroc."
  );

  return (
    <>
      <InnerHeader labels={labels} ctaLabel="Demander un devis" />

      <main>
        <section className="page-hero">
          <div className="container page-hero__grid">
            <div>
              <p className="eyebrow">Solutions</p>
              <h1>Des solutions énergétiques pensées pour le terrain</h1>
              <p className="page-lead">
                Aventron Technologies conçoit et installe des solutions en chauffe-eau solaires, chauffe-eau électriques,
                photovoltaïque et systèmes industriels pour maisons, hôtels, entreprises et établissements au Maroc.
              </p>
              <div className="page-pill-row">
                <span className="landing-pill">Chauffe-eau solaires</span>
                <span className="landing-pill">Chauffe-eau électriques</span>
                <span className="landing-pill">Photovoltaïque</span>
                <span className="landing-pill">Solutions industrielles</span>
              </div>
            </div>
            <div className="page-hero__visual">
              <img src={heroEnergy} alt="Projet Aventron Technologies en énergie et photovoltaïque" />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container page-grid page-grid--two">
            {solutionCards.map((card) => (
              <a key={card.href} className="glass-card page-card page-link-card" href={card.href}>
                <span className="landing-pill">{card.eyebrow}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <div className="page-link-card__meta">
                  {card.meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="section page-section--alt">
          <div className="container">
            <div className="landing-split">
              <div>
                <p className="eyebrow">Méthode</p>
                <h2>Une logique de projet lisible du début à la mise en service</h2>
                <p className="page-lead">
                  Nous commençons par le besoin réel du site, puis nous proposons la solution la plus cohérente selon l’usage,
                  le budget, les contraintes techniques et le niveau de service attendu.
                </p>
              </div>
              <div className="page-stat-grid">
                {methodStats.map((item) => (
                  <article key={item.title} className="page-stat">
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="page-cta-band">
              <div>
                <p className="eyebrow">Votre besoin</p>
                <h2>Vous ne savez pas encore quelle solution choisir ?</h2>
                <p>Décrivez votre bâtiment, votre usage et votre objectif. Nous vous orienterons vers la solution la plus pertinente.</p>
              </div>
              <div className="page-link-row">
                <a className="button button--primary" href="/contact.html">
                  Demander un devis
                </a>
                <a className="button button--secondary" href="https://wa.me/212722667235" target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StandardFooter />
    </>
  );
}
