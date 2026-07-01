import { useState } from "react";
import useBodyClass from "../hooks/useBodyClass.js";
import useDocumentLanguage from "../hooks/useDocumentLanguage.js";
import useDocumentMeta from "../hooks/useDocumentMeta.js";
import HomeHeader from "../components/HomeHeader.jsx";
import HomeFooter from "../components/HomeFooter.jsx";
import heroEnergy from "../../assets/images/hero-energy-cinematic-v2.png";
import qrCode from "../../assets/images/qr.png";

const signalItems = [
  {
    title: "Solutions lisibles",
    body: "Solaire, électrique, photovoltaïque et industriel dans une présentation claire.",
  },
  {
    title: "Approche multi-secteurs",
    body: "Maisons, établissements professionnels et sites industriels dans une même logique.",
  },
  {
    title: "Accompagnement local",
    body: "Conseil, installation, mise en service et suivi pour des projets partout au Maroc.",
  },
];

const solutionCards = [
  {
    href: "/chauffe-eau-solaires.html",
    title: "Chauffe-eau solaires",
    body: "Production d'eau chaude solaire pour villas, hôtels, riads et bâtiments à usage collectif.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 8C24 8 14 19.2 14 26.4C14 31.7 18.5 36 24 36C29.5 36 34 31.7 34 26.4C34 19.2 24 8 24 8Z" stroke="currentColor" strokeWidth="2.4" />
        <path d="M24 16V31" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/chauffe-eau-electriques.html",
    title: "Chauffe-eau électriques",
    body: "Appoint ou production principale selon la capacité, le rythme d'usage et le niveau de service.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="14" y="7" width="20" height="34" rx="8" stroke="currentColor" strokeWidth="2.4" />
        <path d="M24 14V22M24 26V34" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/photovoltaique.html",
    title: "Photovoltaïque",
    body: "Autoconsommation, batteries, pompage solaire et projets énergétiques pour l'entreprise.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M9 30L19 17L26 25L39 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 11H39V19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="7" y="7" width="34" height="34" rx="8" stroke="currentColor" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    href: "/solutions-industrielles.html",
    title: "Solutions industrielles",
    body: "Ballons, résistances, armoires électriques, sécurité hydraulique, régulation et mise en service.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="11" width="32" height="26" rx="5" stroke="currentColor" strokeWidth="2.4" />
        <path d="M16 19H32M16 25H32M16 31H25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const sectorCards = [
  {
    eyebrow: "Particuliers",
    title: "Maisons, villas et résidences",
    body: "Pour le confort quotidien, l'eau chaude sanitaire et les projets énergétiques bien dimensionnés.",
    href: "/particuliers.html",
  },
  {
    eyebrow: "Professionnels",
    title: "Hôtels, bureaux et établissements",
    body: "Pour les besoins réguliers en eau chaude, la continuité de service et la lecture des coûts d'exploitation.",
    href: "/professionnels.html",
  },
  {
    eyebrow: "Industriel",
    title: "Grands volumes et architecture technique",
    body: "Pour les sites qui demandent puissance, régulation, sécurité et mise en service structurée.",
    href: "/industriel.html",
  },
];

const trustCards = [
  {
    title: "Étude & ingénierie",
    body: "Analyse du besoin, dimensionnement et choix de la bonne architecture avant l'installation.",
  },
  {
    title: "Installation & mise en service",
    body: "Une exécution propre, un démarrage maîtrisé et une solution prête à être exploitée rapidement.",
  },
  {
    title: "Suivi & accompagnement",
    body: "Un interlocuteur pour clarifier les choix techniques, sécuriser l'usage et accompagner la suite du projet.",
  },
];

export default function HomePage() {
  useBodyClass("homepage");
  useDocumentLanguage("fr", "ltr");
  useDocumentMeta(
    "Aventron Technologies | Énergie, eau chaude et photovoltaïque au Maroc",
    "Aventron Technologies conçoit des solutions d’énergie, d’eau chaude et de photovoltaïque pour particuliers, hôtels, établissements et entreprises au Maroc."
  );

  const [desiredSolution, setDesiredSolution] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [submitState, setSubmitState] = useState({ status: "idle", message: "" });

  const handlePrefill = ({ solution = "", profile = "" }) => {
    if (solution) {
      setDesiredSolution(solution);
    }

    if (profile) {
      setCustomerType(profile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (desiredSolution) {
      formData.set("desired_solution", desiredSolution);
    }

    if (customerType) {
      formData.set("customer_type", customerType);
    }

    setSubmitState({ status: "sending", message: "" });

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        form.reset();
        setDesiredSolution("");
        setCustomerType("");
        setSubmitState({
          status: "success",
          message: "Merci. Votre demande a bien été reçue. Nous vous contacterons rapidement.",
        });
      } else {
        setSubmitState({
          status: "error",
          message: data.message
            ? `L’envoi n’a pas abouti. Merci de réessayer ou de nous contacter sur WhatsApp. ${data.message}`
            : "L’envoi n’a pas abouti. Merci de réessayer ou de nous contacter sur WhatsApp.",
        });
      }
    } catch (error) {
      setSubmitState({
        status: "error",
        message: "L’envoi n’a pas abouti. Merci de réessayer ou de nous contacter sur WhatsApp.",
      });
    }
  };

  const submitLabel = submitState.status === "sending" ? "Envoi en cours..." : "Recevoir un devis";

  return (
    <>
      <HomeHeader />

      <main>
        <section className="hero-cinematic" id="hero" data-section>
          <div className="hero-cinematic__media" aria-hidden="true">
            <img
              src={heroEnergy}
              alt="Architecture contemporaine au Maroc avec panneaux photovoltaïques et ambiance de confort énergétique"
            />
          </div>

          <div className="hero-cinematic__veil"></div>

          <div className="container hero-cinematic__content">
            <div className="hero-cinematic__copy reveal is-visible">
              <p className="eyebrow">Aventron Technologies</p>
              <h1>
                <span className="hero-cinematic__title-line">Solutions photovoltaïques et eau chaude</span>
                <span className="hero-cinematic__title-line">pour maisons, entreprises et sites industriels</span>
              </h1>
              <p className="hero-cinematic__lead">
                Aventron Technologies conçoit des solutions en eau chaude sanitaire, photovoltaïque et ingénierie
                technique pour les maisons, entreprises et sites industriels au Maroc.
              </p>

              <div className="hero-cinematic__actions">
                <a className="button button--primary" href="#contact">
                  Demander un devis
                </a>
                <a className="button button--secondary" href="#solutions">
                  Explorer nos solutions
                </a>
              </div>

              <div className="hero-cinematic__pills" aria-label="Univers d’expertise">
                <span>Eau chaude sanitaire</span>
                <span>Photovoltaïque</span>
                <span>Ingénierie & installation</span>
              </div>
            </div>

            <div className="hero-cinematic__rail reveal is-visible">
              <article>
                <strong>Étude & dimensionnement</strong>
                <span>Une recommandation claire selon l'usage, le bâtiment et le niveau de service attendu.</span>
              </article>
              <article>
                <strong>Installation & mise en service</strong>
                <span>Des projets propres, performants et directement exploitables après livraison.</span>
              </article>
              <article>
                <strong>Suivi de projet</strong>
                <span>Coordination, mise en service et accompagnement pour une exploitation sereine.</span>
              </article>
            </div>
          </div>
        </section>

        <section className="signal-strip">
          <div className="container signal-strip__grid">
            {signalItems.map((item) => (
              <article key={item.title} className="signal-strip__item reveal is-visible">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section solution-lab" id="solutions" data-section>
          <div className="container">
            <div className="section-heading reveal is-visible">
              <p className="eyebrow">Solutions</p>
              <h2>Un accès simple à chaque solution</h2>
              <p>La page d'accueil reste volontairement concise. Chaque solution dispose ensuite de sa propre page détaillée.</p>
            </div>

            <div className="solution-lab__menu solution-lab__menu--compact">
              {solutionCards.map((card) => (
                <a key={card.href} className="solution-tile reveal is-visible" href={card.href}>
                  <span className="solution-tile__icon">{card.icon}</span>
                  <span className="solution-tile__copy">
                    <strong>{card.title}</strong>
                    <small>{card.body}</small>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section sector-studio" id="sectors" data-section>
          <div className="container">
            <div className="section-heading reveal is-visible">
              <p className="eyebrow">Secteurs</p>
              <h2>Des parcours pensés pour votre type de projet</h2>
              <p>Nous adaptons la recommandation selon le confort attendu, la cadence d'usage et les contraintes du site.</p>
            </div>

            <div className="shortcut-grid">
              {sectorCards.map((card) => (
                <article key={card.title} className="sector-card reveal is-visible">
                  <p className="sector-card__eyebrow">{card.eyebrow}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <a className="button button--secondary" href={card.href}>
                    Voir la page
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section trust-gallery">
          <div className="container">
            <div className="section-heading reveal is-visible">
              <p className="eyebrow">Entreprise</p>
              <h2>Une approche claire, premium et sérieuse</h2>
              <p>Chauffe-eau solaires, chauffe-eau électriques, photovoltaïque et ingénierie sont réunis dans une même logique projet.</p>
            </div>

            <div className="trust-gallery__grid">
              {trustCards.map((card) => (
                <article key={card.title} className="trust-card reveal is-visible">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section cta-banner-zone">
          <div className="container">
            <div className="cta-banner reveal is-visible">
              <div>
                <p className="eyebrow">Votre projet</p>
                <h2>Parlons de votre projet</h2>
                <p>Recevez une recommandation claire pour votre maison, votre entreprise ou votre site technique.</p>
              </div>

              <div className="cta-banner__actions">
                <a className="button button--primary" href="#contact">
                  Demander un devis
                </a>
                <a className="button button--secondary" href="https://wa.me/212722667235" target="_blank" rel="noreferrer">
                  Nous contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section contact-zone" id="contact" data-section>
          <div className="container">
            <div className="section-heading reveal is-visible">
              <p className="eyebrow">Demander un devis</p>
              <h2>Décrivez votre besoin</h2>
              <p>Quelques informations suffisent pour vous orienter vers la bonne solution.</p>
            </div>

            <div className="contact-zone__grid">
              <aside className="contact-aside reveal is-visible">
                <div className="contact-aside__panel">
                  <p className="contact-aside__eyebrow">Contact direct</p>
                  <h3>Préférez un échange rapide ?</h3>
                  <p>Nous vous aidons à qualifier le besoin, choisir la bonne solution et préparer une proposition claire.</p>

                  <div className="contact-aside__actions">
                    <a
                      className="header-link header-link--whatsapp"
                      href="https://wa.me/212722667235"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="WhatsApp Aventron"
                    >
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 4.25C7.72 4.25 4.25 7.63 4.25 11.8C4.25 13.34 4.72 14.83 5.6 16.09L4.75 19.75L8.57 18.95C9.77 19.73 11.18 20.15 12.64 20.15C16.92 20.15 20.39 16.77 20.39 12.6C20.39 8.43 16.92 4.25 12.64 4.25H12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M9.51 9.14C9.72 8.7 9.95 8.68 10.18 8.69C10.36 8.7 10.57 8.69 10.77 8.69C10.98 8.69 11.31 8.77 11.45 9.08C11.59 9.39 11.97 10.31 12.01 10.39C12.05 10.47 12.08 10.57 12.02 10.67C11.96 10.78 11.93 10.84 11.83 10.96C11.73 11.07 11.62 11.21 11.53 11.3C11.43 11.4 11.34 11.5 11.46 11.7C11.58 11.9 11.99 12.55 12.59 13.07C13.36 13.74 14.01 13.95 14.24 14.04C14.47 14.13 14.6 14.11 14.7 14C14.8 13.89 15.12 13.52 15.26 13.32C15.4 13.12 15.54 13.15 15.73 13.22C15.92 13.29 16.95 13.78 17.16 13.88C17.37 13.98 17.51 14.03 17.56 14.11C17.61 14.2 17.61 14.62 17.41 15.02C17.21 15.42 16.25 15.79 15.81 15.84C15.37 15.89 14.82 15.92 13.04 15.19C11.25 14.47 10.08 13.07 9.75 12.6C9.42 12.14 8.46 10.84 8.46 9.49C8.46 9.09 8.58 8.71 8.83 8.43C9.08 8.15 9.29 9.58 9.51 9.14Z" fill="currentColor" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                    <div className="header-qr">
                      <img src={qrCode} alt="QR code WhatsApp Aventron Technologies" />
                    </div>
                  </div>

                  <ul className="contact-aside__list">
                    <li>
                      <strong>Téléphone :</strong> <a href="tel:+212722667235">+212 722 667 235</a>
                    </li>
                    <li>
                      <strong>Email :</strong> <a href="mailto:info@aventrontechnologies.ma">info@aventrontechnologies.ma</a>
                    </li>
                    <li>
                      <strong>Couverture :</strong> Conseil, installation, mise en service et suivi au Maroc.
                    </li>
                  </ul>
                </div>
              </aside>

              <div className="contact-form-card reveal is-visible">
                <div className="contact-form-card__helpers">
                  <button type="button" className={`prefill-pill${desiredSolution === "Chauffe-eau solaires" ? " is-selected" : ""}`} onClick={() => handlePrefill({ solution: "Chauffe-eau solaires" })}>
                    Solaire
                  </button>
                  <button type="button" className={`prefill-pill${desiredSolution === "Chauffe-eau électriques" ? " is-selected" : ""}`} onClick={() => handlePrefill({ solution: "Chauffe-eau électriques" })}>
                    Électrique
                  </button>
                  <button type="button" className={`prefill-pill${desiredSolution === "Photovoltaïque" ? " is-selected" : ""}`} onClick={() => handlePrefill({ solution: "Photovoltaïque" })}>
                    Photovoltaïque
                  </button>
                  <button type="button" className={`prefill-pill${desiredSolution === "Solutions industrielles" ? " is-selected" : ""}`} onClick={() => handlePrefill({ solution: "Solutions industrielles" })}>
                    Industriel
                  </button>
                </div>

                <form
                  className="contact-form"
                  id="contact-form"
                  action="https://api.web3forms.com/submit"
                  method="POST"
                  onSubmit={handleSubmit}
                >
                  <input type="hidden" name="access_key" value="4de3406d-49da-47a1-9e30-e5f9ae41aace" />
                  <input type="hidden" name="subject" value="Nouvelle demande de devis depuis la page d'accueil Aventron" />
                  <input type="hidden" name="from_name" value="Aventron Technologies Website" />
                  <input type="hidden" name="source_page" value="Homepage React app" />
                  <input type="checkbox" name="botcheck" tabIndex="-1" autoComplete="off" className="contact-form__botcheck" />

                  <div className="contact-form__grid">
                    <div className="contact-form__field">
                      <label htmlFor="full-name">Nom complet</label>
                      <input id="full-name" name="full_name" type="text" required />
                    </div>

                    <div className="contact-form__field">
                      <label htmlFor="phone">Téléphone</label>
                      <input id="phone" name="phone" type="tel" required />
                    </div>

                    <div className="contact-form__field">
                      <label htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" />
                    </div>

                    <div className="contact-form__field">
                      <label htmlFor="city">Ville</label>
                      <input id="city" name="city" type="text" required />
                    </div>

                    <div className="contact-form__field">
                      <label htmlFor="customer-type">Vous êtes</label>
                      <select id="customer-type" name="customer_type" value={customerType} onChange={(event) => setCustomerType(event.target.value)} required>
                        <option value="" disabled>
                          Choisir votre profil
                        </option>
                        <option value="Particulier">Particulier</option>
                        <option value="Entreprise">Entreprise / tertiaire</option>
                        <option value="Hôtel / Riad">Hôtel / Riad</option>
                        <option value="École">École</option>
                        <option value="Hôpital / Clinique">Hôpital / Clinique</option>
                        <option value="Industrie">Industrie</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div className="contact-form__field">
                      <label htmlFor="desired-solution">Solution souhaitée</label>
                      <select id="desired-solution" name="desired_solution" value={desiredSolution} onChange={(event) => setDesiredSolution(event.target.value)} required>
                        <option value="" disabled>
                          Choisir une solution
                        </option>
                        <option value="Chauffe-eau solaires">Chauffe-eau solaires</option>
                        <option value="Chauffe-eau électriques">Chauffe-eau électriques</option>
                        <option value="Photovoltaïque">Photovoltaïque</option>
                        <option value="Solutions industrielles">Solutions industrielles</option>
                        <option value="Je ne sais pas encore">Je ne sais pas encore</option>
                      </select>
                    </div>

                    <div className="contact-form__field contact-form__field--full">
                      <label htmlFor="message">Message / Besoin</label>
                      <textarea id="message" name="message" rows="6" required></textarea>
                    </div>
                  </div>

                  <button className="button button--primary contact-form__submit" type="submit" disabled={submitState.status === "sending"}>
                    {submitLabel}
                  </button>
                  <p className="contact-form__success" id="contact-success" aria-live="polite">
                    {submitState.message}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </>
  );
}
