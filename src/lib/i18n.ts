export type Lang = "es" | "en";

export const LANGS: Lang[] = ["es", "en"];

/** Prefijo de ruta por idioma. Español en la raíz; inglés en /en. */
export function langPath(lang: Lang, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return lang === "en" ? `/en${clean === "/" ? "" : clean}` : clean;
}

/** Devuelve el mismo path en el otro idioma (para el toggle). */
export function switchLangPath(current: string, to: Lang): string {
  const stripped = current.replace(/^\/en(?=\/|$)/, "") || "/";
  return to === "en" ? `/en${stripped === "/" ? "" : stripped}` : stripped;
}

type Dict = Record<string, string>;

const es: Dict = {
  "nav.events": "Eventos",
  "nav.restaurant": "Restaurante",
  "nav.about": "Nosotros",
  "nav.contact": "Contacto",
  "nav.reserve": "Reservar",
  "hero.tagline": "Donde empieza la noche en Panamá",
  "hero.sub": "Cena, juegos, tragos y la mejor fiesta en Calle Uruguay. Cada noche pasa algo distinto.",
  "hero.ctaEvents": "Ver eventos y apuntarme",
  "hero.ctaMenu": "Ver la carta",
  "home.featuredEvent": "Próximo evento destacado",
  "home.week": "La semana",
  "home.seeAll": "Ver todos",
  "home.restaurantKicker": "Restaurante",
  "home.restaurantTitle": "Aquí empieza la noche: con la mesa",
  "home.restaurantText": "Cena informal para compartir antes de la fiesta: alitas, burgers, nachos y tragos. Llega temprano, come rico y quédate para lo bueno.",
  "events.kicker": "Programación",
  "events.title": "Eventos",
  "events.intro": "Apúntate gratis a la lista de cada noche. Elige CHICAS o CHICOS — cada lista tiene entrada gratis hasta una hora distinta.",
  "events.past": "Ya pasaron",
  "events.soon": "Pronto publicamos nuevos eventos.",
  "event.back": "Todos los eventos",
  "event.howKicker": "Cómo funciona",
  "event.howText": "Apúntate gratis a la lista eligiendo tu grupo. Entrada gratis hasta la hora indicada; después, entrada normal. Llega con tiempo y muestra tu nombre en la puerta.",
  "menu.kicker": "Restaurante",
  "menu.title": "La carta",
  "menu.intro": "Cena informal para compartir antes de la fiesta. Llega temprano y arranca la noche con la mesa.",
  "menu.featured": "Lo más pedido",
  "menu.full": "Carta completa",
  "menu.seeEvents": "Ver eventos de la semana",
  "menu.pairing": "Otros clientes lo acompañan con:",
  "menu.sugAlcohol": "Para brindar",
  "menu.sugNoAlcohol": "Sin alcohol",
  "menu.sugStarter": "De entrada",
  "menu.sugMain": "De plato fuerte",
  "menu.tapMore": "Toca para ver más",
  "menu.close": "Cerrar",
  "about.kicker": "Sobre nosotros",
  "about.title": "Donde empieza la noche en Panamá",
  "about.storyTitle": "Nuestra historia",
  "about.valuesTitle": "Lo que nos mueve",
  "about.visit": "Visítanos",
  "footer.visit": "Visítanos",
  "footer.follow": "Síguenos",
  "footer.seeEvents": "Ver eventos",
  "footer.staff": "Acceso staff",
  "footer.rights": "Todos los derechos reservados.",
  "footer.dinner": "Cena",
  "footer.party": "Fiesta",
  "link.menu": "Carta del restaurante",
  "link.events": "Eventos y entradas",
  "link.contact": "Consultas por WhatsApp",
  "link.directions": "Cómo llegar",
  "link.tagline": "Donde empieza la noche · Calle Uruguay, Panamá",
  "orb.greeting": "¡Hola! Soy el asistente de Q'Paso Ayer. Pregúntame por los eventos, cómo apuntarte gratis, la carta o cómo reservar.",
};

const en: Dict = {
  "nav.events": "Events",
  "nav.restaurant": "Restaurant",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.reserve": "Book",
  "hero.tagline": "Where the night begins in Panama",
  "hero.sub": "Dinner, games, drinks and the best party on Calle Uruguay. Something's always happening.",
  "hero.ctaEvents": "See events & get on the list",
  "hero.ctaMenu": "See the menu",
  "home.featuredEvent": "Next featured event",
  "home.week": "This week",
  "home.seeAll": "See all",
  "home.restaurantKicker": "Restaurant",
  "home.restaurantTitle": "The night starts here: at the table",
  "home.restaurantText": "Casual shareable dinner before the party: wings, burgers, nachos and drinks. Come early, eat well and stay for the good part.",
  "events.kicker": "Line-up",
  "events.title": "Events",
  "events.intro": "Join the free guest list for each night. Pick GIRLS or GUYS — each list has free entry until a different time.",
  "events.past": "Past events",
  "events.soon": "New events coming soon.",
  "event.back": "All events",
  "event.howKicker": "How it works",
  "event.howText": "Join the free list by choosing your group. Free entry until the listed time; after that, standard entry. Arrive early and show your name at the door.",
  "menu.kicker": "Restaurant",
  "menu.title": "The menu",
  "menu.intro": "Casual shareable dinner before the party. Come early and start the night at the table.",
  "menu.featured": "Most popular",
  "menu.full": "Full menu",
  "menu.seeEvents": "See this week's events",
  "menu.pairing": "Other guests pair it with:",
  "menu.sugAlcohol": "To toast",
  "menu.sugNoAlcohol": "Non-alcoholic",
  "menu.sugStarter": "As a starter",
  "menu.sugMain": "As a main",
  "menu.tapMore": "Tap to see more",
  "menu.close": "Close",
  "about.kicker": "About us",
  "about.title": "Where the night begins in Panama",
  "about.storyTitle": "Our story",
  "about.valuesTitle": "What drives us",
  "about.visit": "Visit us",
  "footer.visit": "Visit us",
  "footer.follow": "Follow us",
  "footer.seeEvents": "See events",
  "footer.staff": "Staff access",
  "footer.rights": "All rights reserved.",
  "footer.dinner": "Dinner",
  "footer.party": "Party",
  "link.menu": "Restaurant menu",
  "link.events": "Events & tickets",
  "link.contact": "Questions on WhatsApp",
  "link.directions": "How to get there",
  "link.tagline": "Where the night begins · Calle Uruguay, Panama",
  "orb.greeting": "Hi! I'm the Q'Paso Ayer assistant. Ask me about events, how to join the free list, the menu or how to book.",
};

const DICTS: Record<Lang, Dict> = { es, en };

export function t(lang: Lang, key: string): string {
  return DICTS[lang][key] ?? DICTS.es[key] ?? key;
}

/** Elige el texto en el idioma pedido con fallback a español. */
export function pick(lang: Lang, es_: string | null | undefined, en_: string | null | undefined): string {
  if (lang === "en") return (en_ && en_.trim()) || es_ || "";
  return es_ || "";
}
