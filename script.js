const revealItems = Array.from(document.querySelectorAll('.reveal'));
const testimonialCards = Array.from(document.querySelectorAll('.testimonial-card'));
const testimonialDots = Array.from(document.querySelectorAll('.testimonial-slider__dots button'));
const prevButton = document.querySelector('.testimonial-slider__control--prev');
const nextButton = document.querySelector('.testimonial-slider__control--next');
const contactForm = document.querySelector('#contact-form');
const contactSuccess = document.querySelector('#contact-success');
const heroBackground = document.querySelector('.hero__bg');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => {
  if (!item.classList.contains('is-visible')) {
    revealObserver.observe(item);
  }
});

let testimonialIndex = 0;

function setTestimonial(index) {
  if (!testimonialCards.length) {
    return;
  }

  testimonialIndex = (index + testimonialCards.length) % testimonialCards.length;

  testimonialCards.forEach((card, cardIndex) => {
    card.classList.toggle('is-active', cardIndex === testimonialIndex);
  });

  testimonialDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === testimonialIndex);
  });
}

if (prevButton && nextButton && testimonialCards.length) {
  prevButton.addEventListener('click', () => setTestimonial(testimonialIndex - 1));
  nextButton.addEventListener('click', () => setTestimonial(testimonialIndex + 1));

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener('click', () => setTestimonial(index));
  });

  window.setInterval(() => {
    setTestimonial(testimonialIndex + 1);
  }, 5000);
}

if (contactForm && contactSuccess) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactSuccess.textContent = 'Merci, votre demande a bien ete envoyee. Nous vous recontacterons rapidement.';
    contactForm.reset();
  });
}

if (heroBackground) {
  window.addEventListener('scroll', () => {
    const offset = Math.min(window.scrollY * 0.12, 48);
    heroBackground.style.transform = `scale(1.08) translateY(${offset}px)`;
  });
}
