// ── BOOKING CONFIGURATION ───────────────────────────────────
// Real backend: each bookable service links to its Calendly event type.
// Calendly owns availability, confirmation, rescheduling, and syncs to
// the business calendar — this file just maps services to their links
// and controls how the widget is branded.
//
// • calendlyUrl: null means there's no Calendly event for that service
//   yet, so the site shows a "call or text for a quote" prompt instead.
// • To add/change a service, copy its scheduling URL from Calendly
//   (Event Types → the event → Share → copy link).

const BOOKING_CONFIG = {
  phone: '9515261636',
  phoneDisplay: '951 · 526 · 1636',
  calendlyOrg: 'homereadyhelpers',

  // Calendly inline widget branding — matches the site's black/green theme.
  // (hex values without '#', per Calendly's embed URL params)
  calendlyBrand: {
    background_color: '000000',
    text_color: 'ffffff',
    primary_color: '4ea345',
  },

  services: [
    { id: 'drywall',   name: 'Drywall Repair',         icon: '🧱', price: 'Starting at $75',   calendlyUrl: 'https://calendly.com/homereadyhelpers/drywall-patch-repair' },
    { id: 'fixture',   name: 'Fixture Replacement',    icon: '🔧', price: 'Starting at $125',  calendlyUrl: 'https://calendly.com/homereadyhelpers/fixture-replacement-install' },
    { id: 'painting',  name: 'Interior Painting',      icon: '🎨', price: 'Starting at $180',  calendlyUrl: 'https://calendly.com/homereadyhelpers/interior-painting-free-in-home-estimate', note: 'Books a free in-home estimate visit first — the actual paint days get scheduled after we look at the job together.' },
    { id: 'flooring',  name: 'Flooring Installation',  icon: '🪵', price: 'Starting at $360',  calendlyUrl: 'https://calendly.com/homereadyhelpers/flooring-installation', note: 'Bigger rooms can take more than one day — pick the closest time slot and we’ll confirm the full schedule with you.' },
    { id: 'tv',        name: 'TV Mounting',            icon: '📺', price: 'Starting at $175',  calendlyUrl: 'https://calendly.com/homereadyhelpers/tv-mounting' },
    { id: 'door',      name: 'Interior Door Install',  icon: '🚪', price: 'Contact for quote', calendlyUrl: null },
    { id: 'dryervent', name: 'Dryer Vent Cleaning',    icon: '🌀', price: '$125 flat',         calendlyUrl: 'https://calendly.com/homereadyhelpers/dryer-vent-cleaning' },
    { id: 'appliance', name: 'Appliance Installation', icon: '🛠️', price: 'Starting at $270',  calendlyUrl: 'https://calendly.com/homereadyhelpers/appliance-installation' },
    { id: 'furniture', name: 'Furniture Assembly',     icon: '📦', price: 'Starting at $180',  calendlyUrl: 'https://calendly.com/homereadyhelpers/furniture-assembly' },
  ],
};
