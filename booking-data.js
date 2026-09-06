// ── BOOKING CONFIGURATION ───────────────────────────────────
// Edit this file to control what the booking calendar shows.
//
// • bookedDates: add a date here (as soon as you confirm a job by call/text)
//   to block it off so no one else can request that day.
// • closedWeekdays: days you don't work. 0 = Sunday, 1 = Monday, ... 6 = Saturday.
// • leadDays: minimum notice required before a job can be requested.
// • services: bookable = true shows a calendar. bookable = false (flooring,
//   painting) shows a "call/text first" notice instead, since those jobs can
//   run long or span multiple days.

const BOOKING_CONFIG = {
  phone: '9515261636',
  phoneDisplay: '951 · 526 · 1636',
  leadDays: 1,
  closedWeekdays: [0], // Sundays off

  bookedDates: [
    // '2026-09-15',
  ],

  services: [
    { id: 'drywall',   name: 'Drywall Repair',         icon: '🧱', price: 'Starting at $75',   bookable: true },
    { id: 'fixture',   name: 'Fixture Replacement',    icon: '🔧', price: 'Starting at $125',  bookable: true },
    { id: 'painting',  name: 'Interior Painting',      icon: '🎨', price: 'Starting at $180',  bookable: false },
    { id: 'flooring',  name: 'Flooring Installation',  icon: '🪵', price: 'Starting at $360',  bookable: false },
    { id: 'tv',        name: 'TV Mounting',            icon: '📺', price: 'Starting at $175',  bookable: true },
    { id: 'door',      name: 'Interior Door Install',  icon: '🚪', price: 'Contact for quote', bookable: true },
    { id: 'dryervent', name: 'Dryer Vent Cleaning',    icon: '🌀', price: '$125 flat',         bookable: true },
    { id: 'appliance', name: 'Appliance Installation', icon: '🛠️', price: 'Starting at $270',  bookable: true },
    { id: 'furniture', name: 'Furniture Assembly',     icon: '📦', price: 'Starting at $180',  bookable: true },
  ],
};
