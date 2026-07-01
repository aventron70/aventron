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

export default function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

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

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`} id="top">
      <div className="container site-header__inner">
        <button
          className={`mobile-menu-toggle${mobileOpen ? " is-open" : ""}`}
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen ? "true" : "false"}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link className="brand" to="/" aria-label="Aventron Technologies">
          <img className="brand__logo" src={logo} alt="Logo Aventron Technologies" />
        </Link>

        <nav className="site-nav" aria-label="Navigation principale">
          <div className="nav-dropdown">
            <Link className="nav-dropdown__trigger" to="/solutions">
              Solutions
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
              Secteurs
            </a>
            <div className="nav-dropdown__menu" role="menu" aria-label="Secteurs">
              {sectorLinks.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <a href="/projets.html">Projets</a>
          <Link to="/entreprise">Entreprise</Link>
          <a href="/contact.html">Contact</a>
        </nav>

        <div className="site-header__actions">
          <a className="button button--small button--primary" href="#contact">
            Demander un devis
          </a>
        </div>
      </div>

      <div className={`mobile-menu${mobileOpen ? " is-open" : ""}`} id="mobile-menu">
        <nav className="mobile-menu__panel" aria-label="Navigation mobile">
          <div className={`mobile-submenu${openSubmenu === "solutions" ? " is-open" : ""}`}>
            <button
              className="mobile-submenu__toggle"
              type="button"
              aria-expanded={openSubmenu === "solutions" ? "true" : "false"}
              onClick={() => setOpenSubmenu((current) => (current === "solutions" ? "" : "solutions"))}
            >
              Solutions
            </button>
            <div className="mobile-submenu__panel">
              <Link to="/solutions" onClick={() => setMobileOpen(false)}>
                Solutions
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
              Secteurs
            </button>
            <div className="mobile-submenu__panel">
              <a href="/secteurs.html" onClick={() => setMobileOpen(false)}>
                Secteurs
              </a>
              {sectorLinks.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <a href="/projets.html" onClick={() => setMobileOpen(false)}>
            Projets
          </a>
          <Link to="/entreprise" onClick={() => setMobileOpen(false)}>
            Entreprise
          </Link>
          <a href="/contact.html" onClick={() => setMobileOpen(false)}>
            Contact
          </a>
          <a className="mobile-menu__quote" href="#contact" onClick={() => setMobileOpen(false)}>
            Demander un devis
          </a>
        </nav>
      </div>
    </header>
  );
}
