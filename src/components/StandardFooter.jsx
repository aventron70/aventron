import logo from "../../assets/images/logo-20260401.png";

export default function StandardFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <img className="site-footer__logo" src={logo} alt="Aventron Technologies" />
          <p className="site-footer__text">
            Aventron Technologies conçoit des solutions d’énergie, d’eau chaude et de photovoltaïque pour particuliers,
            entreprises et établissements au Maroc.
          </p>
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
          <a href="mailto:info@aventrontechnologies.ma">info@aventrontechnologies.ma</a>
          <a href="tel:+212722667235">+212 722 667 235</a>
          <a href="https://www.facebook.com/aventrontech" target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a href="https://www.instagram.com/aventrontechnologies" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
