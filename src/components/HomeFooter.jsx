import logo from "../../assets/images/logo-20260401.png";

export default function HomeFooter() {
  return (
    <>
      <a className="mobile-cta" href="https://wa.me/212722667235" target="_blank" rel="noreferrer">
        Nous contacter sur WhatsApp
      </a>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <img className="site-footer__logo" src={logo} alt="Logo Aventron Technologies" />
            <p className="site-footer__text">
              Aventron Technologies conçoit des solutions d’eau chaude, d’énergie et de photovoltaïque pour particuliers,
              entreprises et grands établissements au Maroc.
            </p>
          </div>

          <div className="site-footer__links">
            <strong className="site-footer__links-title">Entreprise</strong>
            <a href="/entreprise">L’entreprise</a>
            <a href="/notre-equipe.html">Notre équipe</a>
            <a href="/recrutement.html">Recrutement</a>
          </div>

          <div className="site-footer__links">
            <strong className="site-footer__links-title">Solutions</strong>
            <a href="/chauffe-eau-solaires.html">Chauffe-eau solaires</a>
            <a href="/chauffe-eau-electriques.html">Chauffe-eau électriques</a>
            <a href="/photovoltaique.html">Photovoltaïque</a>
            <a href="/solutions-industrielles.html">Solutions industrielles</a>
          </div>

          <div className="site-footer__links">
            <strong className="site-footer__links-title">Explorer</strong>
            <a href="/secteurs.html">Secteurs</a>
            <a href="/projets.html">Projets</a>
            <a href="/contact.html">Contact</a>
          </div>

          <div className="site-footer__meta">
            <a href="https://www.facebook.com/aventrontech" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://www.instagram.com/aventrontechnologies" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="mailto:info@aventrontechnologies.ma">info@aventrontechnologies.ma</a>
            <a href="tel:+212722667235">+212 722 667 235</a>
            <p>&copy; 2026 Aventron Technologies. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
