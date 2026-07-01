import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo-20260401.png";

const solutionLinks = [
  { href: "/chauffe-eau-solaires.html", label: "Chauffe-eau solaires" },
  { href: "/chauffe-eau-electriques.html", label: "Chauffe-eau électriques" },
  { href: "/solutions-industrielles.html", label: "Chauffe-eau industriels" },
  { href: "/photovoltaique.html", label: "Photovoltaïque" },
];

const sectorLinks = [
  { href: "/particuliers.html", label: "Particuliers" },
  { href: "/professionnels.html", label: "Professionnels" },
  { href: "/industriel.html", label: "Industriel" },
];

export default function InnerHeader({
  labels,
  ctaLabel,
  ctaHref = "/contact.html",
  showLanguageSwitcher = false,
  language = "fr",
  onLanguageChange,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("");

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) {
        setMobileOpen(false);
        setOpenSubmenu("");
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpenSubmenu("");
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className="landing-header">
      <div className="container landing-header__inner">
        <Link className="brand" to="/" aria-label="Aventron Technologies">
          <img className="brand__logo" src={logo} alt="Aventron Technologies" />
        </Link>

        <nav className="landing-nav" aria-label="Navigation principale">
          <Link to="/">{labels.home}</Link>
          <div className="nav-dropdown">
            <Link className="nav-dropdown__trigger" to="/solutions">
              {labels.solutions}
            </Link>
            <div className="nav-dropdown__menu" role="menu" aria-label="Solutions">
              {solutionLinks.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="nav-dropdown">
            <a className="nav-dropdown__trigger" href="/secteurs.html">
              {labels.sectors}
            </a>
            <div className="nav-dropdown__menu" role="menu" aria-label="Secteurs">
              {sectorLinks.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <a href="/projets.html">{labels.projects}</a>
          <Link to="/entreprise">{labels.company}</Link>
          <a href="/contact.html">{labels.contact}</a>
        </nav>

        <button
          className={`mobile-menu-toggle${mobileOpen ? " is-open" : ""}`}
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen ? "true" : "false"}
          aria-controls="inner-mobile-menu"
          onClick={() => setMobileOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <a className="button button--small button--ghost" href={ctaHref}>
          {ctaLabel}
        </a>

        {showLanguageSwitcher ? (
          <div className="language-switcher" aria-label="Language switcher">
            {["fr", "en", "ar"].map((lang) => (
              <button
                key={lang}
                className={`language-switcher__button${language === lang ? " is-active" : ""}`}
                type="button"
                onClick={() => onLanguageChange?.(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className={`mobile-menu${mobileOpen ? " is-open" : ""}`} id="inner-mobile-menu">
        <nav className="mobile-menu__panel" aria-label="Navigation mobile">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            {labels.home}
          </Link>

          <div className={`mobile-submenu${openSubmenu === "solutions" ? " is-open" : ""}`}>
            <button
              className="mobile-submenu__toggle"
              type="button"
              aria-expanded={openSubmenu === "solutions" ? "true" : "false"}
              onClick={() => setOpenSubmenu((current) => (current === "solutions" ? "" : "solutions"))}
            >
              {labels.solutions}
            </button>
            <div className="mobile-submenu__panel">
              <Link to="/solutions" onClick={() => setMobileOpen(false)}>
                {labels.solutions}
              </Link>
              {solutionLinks.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className={`mobile-submenu${openSubmenu === "secteurs" ? " is-open" : ""}`}>
            <button
              className="mobile-submenu__toggle"
              type="button"
              aria-expanded={openSubmenu === "secteurs" ? "true" : "false"}
              onClick={() => setOpenSubmenu((current) => (current === "secteurs" ? "" : "secteurs"))}
            >
              {labels.sectors}
            </button>
            <div className="mobile-submenu__panel">
              <a href="/secteurs.html" onClick={() => setMobileOpen(false)}>
                {labels.sectors}
              </a>
              {sectorLinks.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <a href="/projets.html" onClick={() => setMobileOpen(false)}>
            {labels.projects}
          </a>
          <Link to="/entreprise" onClick={() => setMobileOpen(false)}>
            {labels.company}
          </Link>
          <a href="/contact.html" onClick={() => setMobileOpen(false)}>
            {labels.contact}
          </a>
          <a className="mobile-menu__quote" href={ctaHref} onClick={() => setMobileOpen(false)}>
            {ctaLabel}
          </a>
        </nav>
      </div>
    </header>
  );
}
