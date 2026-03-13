// Business type templates for Australian SMB onboarding
// All prices in AUD cents

export type PriceType = 'fixed' | 'hourly' | 'starting_at' | 'quote'

export type FeatureKey =
  | 'ai_receptionist'
  | 'online_booking'
  | 'quotes_estimates'
  | 'invoicing_payments'
  | 'sms_notifications'
  | 'email_management'
  | 'client_crm'
  | 'appointment_reminders'
  | 'review_requests'
  | 'daily_briefings'

export interface ServiceTemplate {
  name: string
  description: string
  category: string
  priceCents: number | null
  priceType: PriceType
  durationMinutes: number | null
}

export interface FaqTemplate {
  question: string
  answer: string
}

export interface DayHours {
  open: string
  close: string
}

export interface BusinessTypeTemplate {
  id: string
  label: string
  icon: string
  industry: string
  services: ServiceTemplate[]
  faqs: FaqTemplate[]
  defaultHours: Record<string, DayHours | null>
  suggestedTone: 'professional' | 'friendly' | 'casual' | 'formal'
  defaultFeatures: FeatureKey[]
}

export const ALL_FEATURES: {
  key: FeatureKey
  label: string
  description: string
  icon: string
}[] = [
  {
    key: 'ai_receptionist',
    label: 'AI Receptionist',
    description: '24/7 AI answers calls, chats, and messages',
    icon: 'Phone',
  },
  {
    key: 'online_booking',
    label: 'Online Booking',
    description: 'Customers book appointments through AI',
    icon: 'Calendar',
  },
  {
    key: 'quotes_estimates',
    label: 'Quotes & Estimates',
    description: 'Generate and send professional quotes',
    icon: 'FileText',
  },
  {
    key: 'invoicing_payments',
    label: 'Invoicing & Payments',
    description: 'Create invoices with online payment links',
    icon: 'CreditCard',
  },
  {
    key: 'sms_notifications',
    label: 'SMS Notifications',
    description: 'Send reminders and updates via text',
    icon: 'MessageSquare',
  },
  {
    key: 'email_management',
    label: 'Email Management',
    description: 'AI reads and responds to business emails',
    icon: 'Mail',
  },
  {
    key: 'client_crm',
    label: 'Client CRM',
    description: 'Track customer details, notes, and history',
    icon: 'Users',
  },
  {
    key: 'appointment_reminders',
    label: 'Appointment Reminders',
    description: 'Automatic reminders before appointments',
    icon: 'Bell',
  },
  {
    key: 'review_requests',
    label: 'Review Requests',
    description: 'Ask happy customers for reviews',
    icon: 'Star',
  },
  {
    key: 'daily_briefings',
    label: 'Daily Briefings',
    description: 'Morning summary of your day ahead',
    icon: 'Sunrise',
  },
]

export const BUSINESS_TYPE_TEMPLATES: BusinessTypeTemplate[] = [
  // ──────────────────────────────────────────────
  // 1. Hair & Beauty Salon
  // ──────────────────────────────────────────────
  {
    id: 'hair_beauty_salon',
    label: 'Hair & Beauty Salon',
    icon: 'Scissors',
    industry: 'Beauty & Wellness',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'sms_notifications',
      'client_crm',
      'appointment_reminders',
      'review_requests',
      'daily_briefings',
    ],
    services: [
      {
        name: "Women's Cut & Blowdry",
        description: 'Shampoo, precision cut, and professional blowdry',
        category: 'Haircuts',
        priceCents: 8500,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: "Men's Cut",
        description: 'Shampoo and precision cut for men',
        category: 'Haircuts',
        priceCents: 4500,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: "Kids' Cut",
        description: 'Haircut for children under 12',
        category: 'Haircuts',
        priceCents: 3000,
        priceType: 'fixed',
        durationMinutes: 25,
      },
      {
        name: 'Full Colour',
        description: 'All-over permanent colour application',
        category: 'Colour',
        priceCents: 15000,
        priceType: 'starting_at',
        durationMinutes: 90,
      },
      {
        name: 'Half Head Foils',
        description: 'Partial foil highlights or lowlights',
        category: 'Colour',
        priceCents: 18000,
        priceType: 'starting_at',
        durationMinutes: 105,
      },
      {
        name: 'Full Head Foils',
        description: 'Full foil highlights or lowlights',
        category: 'Colour',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 120,
      },
      {
        name: 'Balayage',
        description: 'Hand-painted balayage for a natural gradient look',
        category: 'Colour',
        priceCents: 28000,
        priceType: 'starting_at',
        durationMinutes: 150,
      },
      {
        name: 'Blowdry & Style',
        description: 'Professional blowdry and styling',
        category: 'Styling',
        priceCents: 5500,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Updo',
        description: 'Formal updo styling for events and special occasions',
        category: 'Styling',
        priceCents: 12000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Keratin Treatment',
        description: 'Smoothing keratin treatment for frizz-free hair',
        category: 'Treatments',
        priceCents: 30000,
        priceType: 'starting_at',
        durationMinutes: 120,
      },
      {
        name: 'Eyebrow Wax & Tint',
        description: 'Shape and tint eyebrows for a defined look',
        category: 'Beauty',
        priceCents: 3500,
        priceType: 'fixed',
        durationMinutes: 20,
      },
      {
        name: 'Lash Lift & Tint',
        description: 'Lift and tint natural lashes for a curled, defined look',
        category: 'Beauty',
        priceCents: 8500,
        priceType: 'fixed',
        durationMinutes: 45,
      },
    ],
    faqs: [
      {
        question: 'Do you accept walk-ins?',
        answer:
          'We welcome walk-ins when we have availability, but we recommend booking an appointment to guarantee your preferred time. You can book online 24/7 or give us a call.',
      },
      {
        question: 'What is your cancellation policy?',
        answer:
          'We require at least 24 hours notice for cancellations or rescheduling. Late cancellations or no-shows may incur a 50% service fee.',
      },
      {
        question: 'Do I need a consultation before colour?',
        answer:
          'We recommend a complimentary consultation for any major colour changes, especially if switching from dark to light. This helps us give you an accurate quote and timeline.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept cash, EFTPOS, Visa, Mastercard, and Apple Pay / Google Pay. We also offer Afterpay for services over $100.',
      },
      {
        question: 'Is there parking available?',
        answer:
          'There is street parking directly outside the salon and a free car park located within a short walk. Please check local signage for any time restrictions.',
      },
    ],
    defaultHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '16:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 2. Barbershop
  // ──────────────────────────────────────────────
  {
    id: 'barbershop',
    label: 'Barbershop',
    icon: 'Scissors',
    industry: 'Beauty & Wellness',
    suggestedTone: 'casual',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'sms_notifications',
      'client_crm',
      'appointment_reminders',
      'review_requests',
    ],
    services: [
      {
        name: "Men's Haircut",
        description: 'Classic men\'s haircut with clippers and scissors',
        category: 'Haircuts',
        priceCents: 4000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Skin Fade',
        description: 'Precision skin fade with a seamless blend',
        category: 'Haircuts',
        priceCents: 4500,
        priceType: 'fixed',
        durationMinutes: 35,
      },
      {
        name: 'Buzz Cut',
        description: 'All-over clipper cut to one length',
        category: 'Haircuts',
        priceCents: 3000,
        priceType: 'fixed',
        durationMinutes: 15,
      },
      {
        name: "Kids' Cut",
        description: 'Haircut for children under 12',
        category: 'Haircuts',
        priceCents: 2500,
        priceType: 'fixed',
        durationMinutes: 20,
      },
      {
        name: 'Beard Trim',
        description: 'Trim, shape, and line up your beard',
        category: 'Beard',
        priceCents: 2500,
        priceType: 'fixed',
        durationMinutes: 15,
      },
      {
        name: 'Hot Towel Shave',
        description: 'Traditional hot towel straight-razor shave',
        category: 'Beard',
        priceCents: 4000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Haircut + Beard Combo',
        description: 'Full haircut plus beard trim and shape',
        category: 'Combos',
        priceCents: 6000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Hair Design',
        description: 'Haircut with custom design or pattern shaved in',
        category: 'Haircuts',
        priceCents: 5500,
        priceType: 'fixed',
        durationMinutes: 40,
      },
      {
        name: 'Head Shave',
        description: 'Full head shave with clippers or razor',
        category: 'Haircuts',
        priceCents: 3000,
        priceType: 'fixed',
        durationMinutes: 20,
      },
      {
        name: 'Eyebrow Tidy',
        description: 'Quick trim and shape of eyebrows',
        category: 'Extras',
        priceCents: 1000,
        priceType: 'fixed',
        durationMinutes: 10,
      },
    ],
    faqs: [
      {
        question: 'Do I need to book or can I walk in?',
        answer:
          'Both! We take walk-ins when a chair is free, but booking guarantees you a spot without waiting. Book online anytime or just rock up.',
      },
      {
        question: 'How long does a haircut take?',
        answer:
          "A standard men's cut takes about 30 minutes. Skin fades are around 35 minutes, and a haircut plus beard combo is about 45 minutes.",
      },
      {
        question: 'Do you cut kids\' hair?',
        answer:
          "Absolutely! We cut kids' hair from any age. Little ones might sit on a parent's lap if they're not comfortable in the chair on their own.",
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept cash, EFTPOS, Visa, Mastercard, and tap-to-pay with Apple Pay or Google Pay.',
      },
    ],
    defaultHours: {
      monday: null,
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: { open: '09:00', close: '14:00' },
    },
  },

  // ──────────────────────────────────────────────
  // 3. Plumber
  // ──────────────────────────────────────────────
  {
    id: 'plumber',
    label: 'Plumber',
    icon: 'Wrench',
    industry: 'Home Services',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'email_management',
      'client_crm',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Callout Fee',
        description: 'Standard callout fee covering travel and first 30 minutes',
        category: 'General',
        priceCents: 9900,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Blocked Drain',
        description: 'Clear blocked drains using electric eel or high-pressure jetter',
        category: 'Drains',
        priceCents: 22000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'CCTV Drain Inspection',
        description: 'Camera inspection to diagnose drain and pipe issues',
        category: 'Drains',
        priceCents: 35000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Burst Pipe Repair',
        description: 'Emergency repair of burst or leaking pipes',
        category: 'Pipes',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Leaking Tap Repair',
        description: 'Repair dripping or leaking taps',
        category: 'Taps',
        priceCents: 16500,
        priceType: 'starting_at',
        durationMinutes: 45,
      },
      {
        name: 'Tap Replacement',
        description: 'Supply and install new taps',
        category: 'Taps',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Toilet Repair',
        description: 'Fix running, leaking, or blocked toilets',
        category: 'Toilets',
        priceCents: 18000,
        priceType: 'starting_at',
        durationMinutes: 45,
      },
      {
        name: 'Toilet Installation',
        description: 'Remove old and install new toilet',
        category: 'Toilets',
        priceCents: 45000,
        priceType: 'starting_at',
        durationMinutes: 90,
      },
      {
        name: 'Hot Water Repair',
        description: 'Diagnose and repair hot water system faults',
        category: 'Hot Water',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Hot Water Replacement',
        description: 'Supply and install new hot water system',
        category: 'Hot Water',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Gas Fitting',
        description: 'Gas appliance installation, repair, and compliance checks',
        category: 'Gas',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'General Plumbing',
        description: 'General plumbing repairs and maintenance',
        category: 'General',
        priceCents: 14000,
        priceType: 'hourly',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'Do you offer emergency callouts?',
        answer:
          'Yes, we offer emergency plumbing services. After-hours and weekend emergency callouts may attract a higher callout fee. Call us anytime and we\'ll get to you as fast as possible.',
      },
      {
        question: 'What is your hourly rate?',
        answer:
          'Our standard rate is $140 per hour plus a $99 callout fee. Most common jobs are quoted upfront so you know the cost before we start.',
      },
      {
        question: 'Do you provide free quotes?',
        answer:
          'We provide free no-obligation quotes for larger jobs like hot water replacements and renovations. For smaller repairs, our callout fee covers the initial assessment.',
      },
      {
        question: 'Are you licensed and insured?',
        answer:
          'Absolutely. We are fully licensed plumbers with comprehensive public liability insurance. Our licence number is displayed on all quotes and invoices.',
      },
      {
        question: 'What areas do you service?',
        answer:
          'We service the greater metropolitan area and surrounding suburbs. Contact us with your location and we\'ll confirm we can get to you.',
      },
    ],
    defaultHours: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 4. Electrician
  // ──────────────────────────────────────────────
  {
    id: 'electrician',
    label: 'Electrician',
    icon: 'Zap',
    industry: 'Home Services',
    suggestedTone: 'professional',
    defaultFeatures: [
      'ai_receptionist',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'email_management',
      'client_crm',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Callout Fee',
        description: 'Standard callout fee covering travel and first 30 minutes',
        category: 'General',
        priceCents: 9900,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Powerpoint Installation',
        description: 'Install new power outlet or relocate existing one',
        category: 'Installation',
        priceCents: 18000,
        priceType: 'starting_at',
        durationMinutes: 45,
      },
      {
        name: 'Light Fitting Installation',
        description: 'Supply and install light fittings',
        category: 'Lighting',
        priceCents: 12000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Downlight Installation',
        description: 'Install LED downlight per light',
        category: 'Lighting',
        priceCents: 8500,
        priceType: 'fixed',
        durationMinutes: 20,
      },
      {
        name: 'Ceiling Fan Installation',
        description: 'Supply and install ceiling fan with wiring',
        category: 'Installation',
        priceCents: 22000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Switchboard Upgrade',
        description: 'Upgrade old switchboard to modern safety standards',
        category: 'Switchboard',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Safety Switch Installation',
        description: 'Install RCD safety switch for electrical protection',
        category: 'Switchboard',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 45,
      },
      {
        name: 'Smoke Alarm Installation',
        description: 'Supply and install compliant smoke alarms',
        category: 'Safety',
        priceCents: 15000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Fault Finding',
        description: 'Diagnose and locate electrical faults',
        category: 'Repairs',
        priceCents: 14000,
        priceType: 'hourly',
        durationMinutes: null,
      },
      {
        name: 'Full Rewire',
        description: 'Complete rewire of property to current standards',
        category: 'Major Works',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'EV Charger Installation',
        description: 'Supply and install electric vehicle charger',
        category: 'Installation',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'General Electrical',
        description: 'General electrical repairs and maintenance work',
        category: 'General',
        priceCents: 14000,
        priceType: 'hourly',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'Do you do emergency electrical work?',
        answer:
          'Yes, we provide emergency electrical services for power outages, sparking outlets, and other urgent issues. After-hours callout fees apply. Call us anytime for emergencies.',
      },
      {
        question: 'How much do you charge per hour?',
        answer:
          'Our standard rate is $140 per hour plus a $99 callout fee. We provide upfront pricing for most standard jobs so there are no surprises.',
      },
      {
        question: 'Are you a licensed electrician?',
        answer:
          'Yes, we are fully licensed and insured electrical contractors. All work is completed to Australian Standards and a certificate of compliance is provided where required.',
      },
      {
        question: 'Can you install solar panels or EV chargers?',
        answer:
          'We install EV chargers and can work alongside solar installers for electrical connections. Contact us for a tailored quote based on your setup.',
      },
    ],
    defaultHours: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 5. HVAC / Air Conditioning
  // ──────────────────────────────────────────────
  {
    id: 'hvac',
    label: 'HVAC / Air Conditioning',
    icon: 'Thermometer',
    industry: 'Home Services',
    suggestedTone: 'professional',
    defaultFeatures: [
      'ai_receptionist',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'email_management',
      'client_crm',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Split System Service',
        description: 'Full service and clean of split system air conditioner',
        category: 'Servicing',
        priceCents: 18000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Ducted System Service',
        description: 'Full service and clean of ducted air conditioning system',
        category: 'Servicing',
        priceCents: 30000,
        priceType: 'starting_at',
        durationMinutes: 120,
      },
      {
        name: 'Split System Installation',
        description: 'Supply and install new split system air conditioner',
        category: 'Installation',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Ducted System Installation',
        description: 'Supply and install new ducted air conditioning system',
        category: 'Installation',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Refrigerant Regas',
        description: 'Recharge refrigerant gas in air conditioning system',
        category: 'Repairs',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'AC Fault Diagnosis',
        description: 'Diagnose faults and issues with air conditioning systems',
        category: 'Repairs',
        priceCents: 15000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Thermostat Replacement',
        description: 'Supply and install replacement thermostat or controller',
        category: 'Repairs',
        priceCents: 20000,
        priceType: 'starting_at',
        durationMinutes: 45,
      },
      {
        name: 'Duct Cleaning',
        description: 'Professional cleaning of ductwork and vents',
        category: 'Servicing',
        priceCents: 45000,
        priceType: 'starting_at',
        durationMinutes: 180,
      },
      {
        name: 'Commercial HVAC',
        description: 'Commercial air conditioning installation and servicing',
        category: 'Commercial',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Callout',
        description: 'Standard callout fee for assessment and travel',
        category: 'General',
        priceCents: 9900,
        priceType: 'fixed',
        durationMinutes: 30,
      },
    ],
    faqs: [
      {
        question: 'How often should I service my air conditioner?',
        answer:
          'We recommend servicing your air conditioner at least once a year. For systems used heavily or in dusty environments, twice a year is ideal to maintain efficiency and air quality.',
      },
      {
        question: 'How long does an installation take?',
        answer:
          'A single split system typically takes 4-6 hours to install. Ducted systems can take 2-5 days depending on the size of the property and complexity of the installation.',
      },
      {
        question: 'Do you offer free quotes for installations?',
        answer:
          'Yes, we provide free in-home quotes for all air conditioning installations. We\'ll assess your space, discuss your needs, and recommend the best system for your budget.',
      },
      {
        question: 'What brands do you work with?',
        answer:
          'We install and service all major brands including Daikin, Mitsubishi Electric, Fujitsu, Samsung, LG, and Panasonic. We can recommend the best brand for your needs and budget.',
      },
    ],
    defaultHours: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 6. Cleaning Service
  // ──────────────────────────────────────────────
  {
    id: 'cleaning',
    label: 'Cleaning Service',
    icon: 'SprayCan',
    industry: 'Home Services',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'client_crm',
      'appointment_reminders',
      'review_requests',
    ],
    services: [
      {
        name: 'Standard Clean - 2 Bedroom',
        description: 'Regular clean of a 2-bedroom home including kitchen and bathroom',
        category: 'Regular Cleaning',
        priceCents: 18000,
        priceType: 'starting_at',
        durationMinutes: 120,
      },
      {
        name: 'Standard Clean - 3 Bedroom',
        description: 'Regular clean of a 3-bedroom home including kitchen and bathrooms',
        category: 'Regular Cleaning',
        priceCents: 22000,
        priceType: 'starting_at',
        durationMinutes: 150,
      },
      {
        name: 'Standard Clean - 4 Bedroom',
        description: 'Regular clean of a 4-bedroom home including kitchen and bathrooms',
        category: 'Regular Cleaning',
        priceCents: 28000,
        priceType: 'starting_at',
        durationMinutes: 180,
      },
      {
        name: 'Deep Clean - 2 Bedroom',
        description: 'Thorough deep clean of a 2-bedroom home including inside cupboards and appliances',
        category: 'Deep Cleaning',
        priceCents: 35000,
        priceType: 'starting_at',
        durationMinutes: 180,
      },
      {
        name: 'Deep Clean - 3 Bedroom',
        description: 'Thorough deep clean of a 3-bedroom home including inside cupboards and appliances',
        category: 'Deep Cleaning',
        priceCents: 45000,
        priceType: 'starting_at',
        durationMinutes: 240,
      },
      {
        name: 'End of Lease - 2 Bedroom',
        description: 'Comprehensive end-of-lease clean to bond-back standard for a 2-bedroom property',
        category: 'End of Lease',
        priceCents: 40000,
        priceType: 'starting_at',
        durationMinutes: 240,
      },
      {
        name: 'End of Lease - 3 Bedroom',
        description: 'Comprehensive end-of-lease clean to bond-back standard for a 3-bedroom property',
        category: 'End of Lease',
        priceCents: 55000,
        priceType: 'starting_at',
        durationMinutes: 300,
      },
      {
        name: 'Oven Clean',
        description: 'Deep clean of oven interior, racks, trays, and door',
        category: 'Add-Ons',
        priceCents: 8000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Window Clean',
        description: 'Interior and exterior window cleaning',
        category: 'Add-Ons',
        priceCents: 5000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Carpet Steam Clean - Per Room',
        description: 'Professional steam clean of carpet per room',
        category: 'Add-Ons',
        priceCents: 5000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Office Clean',
        description: 'Regular commercial office cleaning per hour',
        category: 'Commercial',
        priceCents: 5500,
        priceType: 'hourly',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'Do I need to be home during the clean?',
        answer:
          'No, you don\'t need to be home. Many of our clients provide a key or access code. We are fully insured and our cleaners are police-checked for your peace of mind.',
      },
      {
        question: 'What products do you use?',
        answer:
          'We use professional-grade, eco-friendly cleaning products that are safe for families and pets. If you have specific product preferences or allergies, just let us know.',
      },
      {
        question: 'Do you bring your own equipment?',
        answer:
          'Yes, we bring all cleaning products, equipment, and supplies. We just need access to running water and electricity at the property.',
      },
      {
        question: 'What does an end of lease clean include?',
        answer:
          'Our end-of-lease clean covers everything required to meet real estate inspection standards: all rooms, kitchen appliances, bathrooms, windows (interior), and more. We offer a bond-back guarantee.',
      },
      {
        question: 'How do you provide a quote?',
        answer:
          'We can provide a quote based on the number of bedrooms, bathrooms, and the type of clean you need. For larger or custom jobs, we may arrange a quick walkthrough or ask for photos.',
      },
    ],
    defaultHours: {
      monday: { open: '07:00', close: '18:00' },
      tuesday: { open: '07:00', close: '18:00' },
      wednesday: { open: '07:00', close: '18:00' },
      thursday: { open: '07:00', close: '18:00' },
      friday: { open: '07:00', close: '18:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 7. Auto Mechanic
  // ──────────────────────────────────────────────
  {
    id: 'auto_mechanic',
    label: 'Auto Mechanic',
    icon: 'Car',
    industry: 'Automotive',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'client_crm',
      'appointment_reminders',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Logbook Service - Small Car',
        description: 'Manufacturer logbook service for small and medium cars',
        category: 'Servicing',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 90,
      },
      {
        name: 'Logbook Service - Large / 4WD',
        description: 'Manufacturer logbook service for large cars and 4WDs',
        category: 'Servicing',
        priceCents: 35000,
        priceType: 'starting_at',
        durationMinutes: 120,
      },
      {
        name: 'Oil & Filter Change',
        description: 'Engine oil and filter replacement',
        category: 'Servicing',
        priceCents: 15000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Brake Pads - Per Axle',
        description: 'Replace brake pads on front or rear axle',
        category: 'Brakes',
        priceCents: 30000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Brake Disc & Pad Replacement',
        description: 'Replace brake discs and pads on one axle',
        category: 'Brakes',
        priceCents: 55000,
        priceType: 'starting_at',
        durationMinutes: 90,
      },
      {
        name: 'Tyre Fitting - Per Tyre',
        description: 'Fit and balance one tyre (tyre cost not included)',
        category: 'Tyres',
        priceCents: 3000,
        priceType: 'fixed',
        durationMinutes: 15,
      },
      {
        name: 'Wheel Alignment',
        description: 'Full four-wheel alignment check and adjustment',
        category: 'Tyres',
        priceCents: 8000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Diagnostic Scan',
        description: 'Electronic diagnostic scan to read fault codes',
        category: 'Diagnostics',
        priceCents: 9900,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Clutch Replacement',
        description: 'Remove and replace clutch assembly',
        category: 'Major Repairs',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Timing Belt Replacement',
        description: 'Replace timing belt and inspect related components',
        category: 'Major Repairs',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Pre-Purchase Inspection',
        description: 'Comprehensive inspection before buying a used vehicle',
        category: 'Inspections',
        priceCents: 22000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Roadworthy / Safety Certificate',
        description: 'Vehicle safety inspection and certificate for registration transfer',
        category: 'Inspections',
        priceCents: 18000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'General Mechanical',
        description: 'General mechanical repairs and maintenance',
        category: 'General',
        priceCents: 13000,
        priceType: 'hourly',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'Do you service all makes and models?',
        answer:
          'Yes, we service all makes and models including European, Japanese, Korean, and Australian vehicles. We use quality parts and follow manufacturer specifications.',
      },
      {
        question: 'Does the service maintain my new car warranty?',
        answer:
          'Absolutely. Under Australian Consumer Law, you can have your new car serviced at any licensed mechanic without affecting your warranty, as long as the logbook service schedule is followed.',
      },
      {
        question: 'Do you have loan cars available?',
        answer:
          'We have a limited number of courtesy vehicles available for customers whose cars require extended repairs. Please book ahead to secure a loan car.',
      },
      {
        question: 'How long does a service take?',
        answer:
          'A standard logbook service takes 1-2 hours. More involved services or repairs may take longer. We\'ll give you an estimated completion time when you drop off your vehicle.',
      },
    ],
    defaultHours: {
      monday: { open: '07:30', close: '17:00' },
      tuesday: { open: '07:30', close: '17:00' },
      wednesday: { open: '07:30', close: '17:00' },
      thursday: { open: '07:30', close: '17:00' },
      friday: { open: '07:30', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 8. Restaurant / Cafe
  // ──────────────────────────────────────────────
  {
    id: 'restaurant',
    label: 'Restaurant / Cafe',
    icon: 'UtensilsCrossed',
    industry: 'Food & Beverage',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'sms_notifications',
      'email_management',
      'client_crm',
      'review_requests',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Table Reservation - 2 Guests',
        description: 'Reserve a table for 2 guests',
        category: 'Reservations',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Table Reservation - 4 Guests',
        description: 'Reserve a table for 4 guests',
        category: 'Reservations',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 90,
      },
      {
        name: 'Large Group - 8+ Guests',
        description: 'Reserve seating for a large group of 8 or more guests',
        category: 'Reservations',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 120,
      },
      {
        name: 'Private Function',
        description: 'Private dining or function room booking for events',
        category: 'Events',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Catering - Per Head',
        description: 'Off-site catering service priced per person',
        category: 'Catering',
        priceCents: 4500,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Birthday Package',
        description: 'Birthday celebration package including dedicated area and set menu',
        category: 'Events',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Corporate Lunch - Per Head',
        description: 'Corporate lunch package with set menu priced per person',
        category: 'Catering',
        priceCents: 3500,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Takeaway Order',
        description: 'Takeaway order for pickup or delivery',
        category: 'Takeaway',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'Do I need a reservation?',
        answer:
          'Reservations are recommended, especially for dinner and weekends. Walk-ins are welcome but we cannot guarantee a table. You can book online or give us a call.',
      },
      {
        question: 'Can you accommodate dietary requirements?',
        answer:
          'Absolutely! We cater to vegetarian, vegan, gluten-free, dairy-free, and other dietary needs. Please let us know when booking or speak to your server so we can accommodate you.',
      },
      {
        question: 'Do you offer catering or host events?',
        answer:
          'Yes, we offer both on-site private functions and off-site catering for events of all sizes. Contact us to discuss your requirements and we\'ll put together a custom package.',
      },
      {
        question: 'Is there parking available?',
        answer:
          'There is street parking nearby and a public car park within walking distance. We recommend checking local council signage for time restrictions.',
      },
      {
        question: 'Do you have a kids\' menu?',
        answer:
          'Yes, we have a dedicated kids\' menu with smaller portions and child-friendly options. High chairs are available on request.',
      },
    ],
    defaultHours: {
      monday: null,
      tuesday: { open: '07:00', close: '15:00' },
      wednesday: { open: '07:00', close: '15:00' },
      thursday: { open: '07:00', close: '15:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '07:00', close: '22:00' },
      sunday: { open: '08:00', close: '15:00' },
    },
  },

  // ──────────────────────────────────────────────
  // 9. Personal Trainer / Gym
  // ──────────────────────────────────────────────
  {
    id: 'personal_trainer',
    label: 'Personal Trainer / Gym',
    icon: 'Dumbbell',
    industry: 'Health & Fitness',
    suggestedTone: 'casual',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'invoicing_payments',
      'sms_notifications',
      'client_crm',
      'appointment_reminders',
      'review_requests',
    ],
    services: [
      {
        name: '1-on-1 Personal Training - 60 min',
        description: 'Private one-on-one personal training session',
        category: 'Personal Training',
        priceCents: 9000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: '1-on-1 Personal Training - 30 min',
        description: 'Shorter one-on-one personal training session',
        category: 'Personal Training',
        priceCents: 5500,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Couples Training',
        description: 'Personal training session for two people',
        category: 'Personal Training',
        priceCents: 14000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: '10-Session Pack',
        description: 'Pack of 10 one-on-one personal training sessions',
        category: 'Packs',
        priceCents: 80000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: '20-Session Pack',
        description: 'Pack of 20 one-on-one personal training sessions',
        category: 'Packs',
        priceCents: 150000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: 'Fitness Assessment',
        description: 'Comprehensive fitness assessment including goals, measurements, and program design',
        category: 'Assessments',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Nutrition Consultation',
        description: 'One-on-one nutrition coaching and meal plan guidance',
        category: 'Nutrition',
        priceCents: 12000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Small Group Training',
        description: 'Group training session for 3-6 people per person',
        category: 'Group Training',
        priceCents: 3000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Online Coaching - Monthly',
        description: 'Monthly online coaching with custom program and check-ins',
        category: 'Online',
        priceCents: 25000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: 'Body Composition Scan',
        description: 'InBody or DEXA-style body composition analysis',
        category: 'Assessments',
        priceCents: 5000,
        priceType: 'fixed',
        durationMinutes: 15,
      },
    ],
    faqs: [
      {
        question: 'Is personal training suitable for beginners?',
        answer:
          'Absolutely! Most of our clients start as complete beginners. Every program is tailored to your fitness level, goals, and any injuries or limitations. We meet you where you are.',
      },
      {
        question: 'What should I bring to a session?',
        answer:
          'Wear comfortable workout clothes and bring a water bottle and a towel. We provide all the equipment you need for your session.',
      },
      {
        question: 'What is your cancellation policy?',
        answer:
          'We require at least 12 hours notice to cancel or reschedule. Late cancellations or no-shows will be charged as a used session from your pack.',
      },
      {
        question: 'Do you provide nutrition advice?',
        answer:
          'Yes, we offer nutrition consultations and general dietary guidance as part of our holistic approach to fitness. For complex dietary needs, we can refer you to an accredited dietitian.',
      },
    ],
    defaultHours: {
      monday: { open: '05:30', close: '20:00' },
      tuesday: { open: '05:30', close: '20:00' },
      wednesday: { open: '05:30', close: '20:00' },
      thursday: { open: '05:30', close: '20:00' },
      friday: { open: '05:30', close: '20:00' },
      saturday: { open: '06:00', close: '14:00' },
      sunday: { open: '07:00', close: '12:00' },
    },
  },

  // ──────────────────────────────────────────────
  // 10. Medical / Dental Practice
  // ──────────────────────────────────────────────
  {
    id: 'medical_dental',
    label: 'Medical / Dental Practice',
    icon: 'Stethoscope',
    industry: 'Health & Fitness',
    suggestedTone: 'professional',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'sms_notifications',
      'email_management',
      'client_crm',
      'appointment_reminders',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Standard Consultation',
        description: 'Standard GP or dental consultation',
        category: 'Consultations',
        priceCents: 8500,
        priceType: 'fixed',
        durationMinutes: 15,
      },
      {
        name: 'Long Consultation',
        description: 'Extended consultation for complex or multiple issues',
        category: 'Consultations',
        priceCents: 16000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'New Patient Consultation',
        description: 'Initial consultation for new patients including medical history review',
        category: 'Consultations',
        priceCents: 12000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Check-Up & Clean',
        description: 'Dental check-up, scale, and professional clean',
        category: 'Dental',
        priceCents: 22000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Dental X-Ray',
        description: 'Digital dental X-ray imaging',
        category: 'Dental',
        priceCents: 7000,
        priceType: 'fixed',
        durationMinutes: 10,
      },
      {
        name: 'Filling - Per Tooth',
        description: 'Tooth-coloured composite filling per tooth',
        category: 'Dental',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Crown / Veneer',
        description: 'Porcelain crown or veneer per tooth',
        category: 'Dental',
        priceCents: 150000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Teeth Whitening',
        description: 'Professional in-chair teeth whitening treatment',
        category: 'Cosmetic',
        priceCents: 60000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Health Assessment',
        description: 'Comprehensive health assessment and check-up',
        category: 'Assessments',
        priceCents: 24000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Skin Check',
        description: 'Full body skin cancer check and mole assessment',
        category: 'Assessments',
        priceCents: 10000,
        priceType: 'fixed',
        durationMinutes: 20,
      },
    ],
    faqs: [
      {
        question: 'Do you bulk bill?',
        answer:
          'We offer bulk billing for concession card holders, children under 16, and pensioners. Standard consultations for other patients are privately billed with Medicare rebates available.',
      },
      {
        question: 'Do I need a referral?',
        answer:
          'No referral is needed for general consultations, dental check-ups, or skin checks. Referrals are only required if you are being referred to a specialist.',
      },
      {
        question: 'What should I bring to my appointment?',
        answer:
          'Please bring your Medicare card, any private health insurance details, a list of current medications, and any relevant medical records or referral letters.',
      },
      {
        question: 'Do you offer telehealth appointments?',
        answer:
          'Yes, we offer telehealth consultations via phone or video call for eligible appointments. Book online and select the telehealth option, or call the practice to arrange.',
      },
      {
        question: 'Is there parking available?',
        answer:
          'There is on-site parking available for patients as well as street parking nearby. The practice is also accessible by public transport.',
      },
    ],
    defaultHours: {
      monday: { open: '08:00', close: '17:30' },
      tuesday: { open: '08:00', close: '17:30' },
      wednesday: { open: '08:00', close: '17:30' },
      thursday: { open: '08:00', close: '17:30' },
      friday: { open: '08:00', close: '17:30' },
      saturday: { open: '08:30', close: '12:30' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 11. Real Estate Agency
  // ──────────────────────────────────────────────
  {
    id: 'real_estate',
    label: 'Real Estate Agency',
    icon: 'Home',
    industry: 'Professional Services',
    suggestedTone: 'professional',
    defaultFeatures: [
      'ai_receptionist',
      'sms_notifications',
      'email_management',
      'client_crm',
      'review_requests',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Property Appraisal',
        description: 'Free market appraisal to determine your property\'s value',
        category: 'Sales',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Property Listing & Sale',
        description: 'Full-service property listing, marketing, and sale campaign',
        category: 'Sales',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Auction Campaign',
        description: 'Complete auction marketing campaign and auction day management',
        category: 'Sales',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Rental Property Management',
        description: 'Ongoing property management for rental properties',
        category: 'Property Management',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Tenant Screening',
        description: 'Comprehensive tenant application checks and screening',
        category: 'Property Management',
        priceCents: 22000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: 'Open Home',
        description: 'Scheduled open home inspection for prospective buyers or tenants',
        category: 'Inspections',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Building & Pest Coordination',
        description: 'Coordinate building and pest inspections with trusted providers',
        category: 'Coordination',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Lease Preparation',
        description: 'Prepare residential tenancy lease agreement',
        category: 'Property Management',
        priceCents: 33000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: 'Investment Consultation',
        description: 'Free consultation on property investment opportunities',
        category: 'Advisory',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 45,
      },
    ],
    faqs: [
      {
        question: 'What commission do you charge?',
        answer:
          'Our commission rates are competitive and depend on the property type and value. We\'ll provide a clear breakdown during your appraisal. There are no hidden fees — everything is agreed upfront.',
      },
      {
        question: 'How long does it take to sell a property?',
        answer:
          'On average, properties in our area sell within 30-45 days on market, though this varies by property type, price range, and market conditions. Auction campaigns typically run for 4 weeks.',
      },
      {
        question: 'How should I prepare my property for sale?',
        answer:
          'We provide a personalised pre-sale checklist during your appraisal. Key tips include decluttering, fresh paint where needed, tidy gardens, and professional photography. We can recommend trusted tradespeople.',
      },
      {
        question: 'What does rental management include?',
        answer:
          'Our property management service covers tenant sourcing, screening, lease preparation, rent collection, routine inspections, maintenance coordination, and end-of-lease management.',
      },
    ],
    defaultHours: {
      monday: { open: '08:30', close: '17:30' },
      tuesday: { open: '08:30', close: '17:30' },
      wednesday: { open: '08:30', close: '17:30' },
      thursday: { open: '08:30', close: '17:30' },
      friday: { open: '08:30', close: '17:30' },
      saturday: { open: '09:00', close: '16:00' },
      sunday: { open: '10:00', close: '14:00' },
    },
  },

  // ──────────────────────────────────────────────
  // 12. Accounting / Tax
  // ──────────────────────────────────────────────
  {
    id: 'accounting',
    label: 'Accounting / Tax',
    icon: 'Calculator',
    industry: 'Professional Services',
    suggestedTone: 'professional',
    defaultFeatures: [
      'ai_receptionist',
      'invoicing_payments',
      'sms_notifications',
      'email_management',
      'client_crm',
      'appointment_reminders',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Individual Tax Return - Simple',
        description: 'Tax return for individuals with straightforward income (salary, bank interest)',
        category: 'Tax Returns',
        priceCents: 22000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Individual Tax Return - Complex',
        description: 'Tax return for individuals with investments, rental properties, or capital gains',
        category: 'Tax Returns',
        priceCents: 44000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Sole Trader Tax Return',
        description: 'Tax return including business schedule for sole traders',
        category: 'Tax Returns',
        priceCents: 55000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Company Tax Return',
        description: 'Annual company tax return and financial statements',
        category: 'Tax Returns',
        priceCents: 110000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'BAS Preparation - Quarterly',
        description: 'Quarterly Business Activity Statement preparation and lodgement',
        category: 'BAS & GST',
        priceCents: 33000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Bookkeeping - Monthly',
        description: 'Monthly bookkeeping and reconciliation service',
        category: 'Bookkeeping',
        priceCents: 55000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Business Structure Setup',
        description: 'Advice and setup of company, trust, or partnership structures',
        category: 'Advisory',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Financial Statements',
        description: 'Preparation of annual financial statements',
        category: 'Financial Reporting',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'SMSF Annual Compliance',
        description: 'Annual audit, tax return, and compliance for self-managed super fund',
        category: 'SMSF',
        priceCents: 220000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Initial Consultation',
        description: 'Free initial consultation to discuss your accounting and tax needs',
        category: 'Consultations',
        priceCents: 0,
        priceType: 'fixed',
        durationMinutes: 30,
      },
    ],
    faqs: [
      {
        question: 'How much does a tax return cost?',
        answer:
          'Individual tax returns start from $220 for simple returns. More complex returns with investments, rental properties, or business income start from $440. We provide an upfront quote before starting.',
      },
      {
        question: 'What do I need to bring to my tax appointment?',
        answer:
          'Please bring your tax file number, income statements (payment summaries), details of any deductions, private health insurance statement, bank interest statements, and any investment or rental property records.',
      },
      {
        question: 'When is the tax return deadline?',
        answer:
          'For self-lodgers, the deadline is 31 October. If you lodge through a registered tax agent like us, you may be eligible for an extended deadline up to 15 May the following year.',
      },
      {
        question: 'Can you help with overdue tax returns?',
        answer:
          'Yes, we regularly help clients catch up on overdue returns. We can lodge multiple years at once and liaise with the ATO on your behalf to manage any outstanding obligations.',
      },
    ],
    defaultHours: {
      monday: { open: '08:30', close: '17:00' },
      tuesday: { open: '08:30', close: '17:00' },
      wednesday: { open: '08:30', close: '17:00' },
      thursday: { open: '08:30', close: '17:00' },
      friday: { open: '08:30', close: '17:00' },
      saturday: null,
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 13. Legal Practice
  // ──────────────────────────────────────────────
  {
    id: 'legal',
    label: 'Legal Practice',
    icon: 'Scale',
    industry: 'Professional Services',
    suggestedTone: 'formal',
    defaultFeatures: [
      'ai_receptionist',
      'invoicing_payments',
      'sms_notifications',
      'email_management',
      'client_crm',
      'appointment_reminders',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Initial Consultation',
        description: 'Initial legal consultation to discuss your matter',
        category: 'Consultations',
        priceCents: 33000,
        priceType: 'starting_at',
        durationMinutes: 30,
      },
      {
        name: 'Standard Will',
        description: 'Preparation of a standard individual will',
        category: 'Wills & Estates',
        priceCents: 66000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Mutual Wills',
        description: 'Preparation of mutual wills for couples',
        category: 'Wills & Estates',
        priceCents: 99000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Power of Attorney',
        description: 'Preparation of enduring power of attorney documents',
        category: 'Wills & Estates',
        priceCents: 44000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Conveyancing - Purchase',
        description: 'Legal conveyancing for property purchase',
        category: 'Conveyancing',
        priceCents: 150000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Conveyancing - Sale',
        description: 'Legal conveyancing for property sale',
        category: 'Conveyancing',
        priceCents: 130000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Family Law Consultation',
        description: 'Consultation on separation, divorce, custody, and property settlement matters',
        category: 'Family Law',
        priceCents: 44000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Contract Review',
        description: 'Review and advise on commercial or employment contracts',
        category: 'Commercial',
        priceCents: 55000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Employment Law',
        description: 'Employment law advice and representation',
        category: 'Employment',
        priceCents: 44000,
        priceType: 'hourly',
        durationMinutes: null,
      },
      {
        name: 'General Legal Advice',
        description: 'General legal advice and representation',
        category: 'General',
        priceCents: 44000,
        priceType: 'hourly',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'How much does a lawyer cost?',
        answer:
          'Our rates vary depending on the type of work. Many services such as wills and conveyancing are offered at fixed fees. Hourly rates apply for ongoing matters. We provide a clear cost agreement before any work begins.',
      },
      {
        question: 'Do you offer a free initial consultation?',
        answer:
          'We offer a reduced-fee initial consultation so you can discuss your matter and understand your options. Some matters may qualify for a complimentary brief phone consultation.',
      },
      {
        question: 'How long does conveyancing take?',
        answer:
          'Standard conveyancing takes 30-90 days from exchange of contracts to settlement. The exact timeline depends on the terms of the contract and any conditions such as finance or building inspections.',
      },
      {
        question: 'What documents should I bring to my appointment?',
        answer:
          'Please bring any documents relevant to your matter, such as contracts, court documents, correspondence, identification, and any previous legal advice. We\'ll let you know if we need anything specific when you book.',
      },
    ],
    defaultHours: {
      monday: { open: '08:30', close: '17:30' },
      tuesday: { open: '08:30', close: '17:30' },
      wednesday: { open: '08:30', close: '17:30' },
      thursday: { open: '08:30', close: '17:30' },
      friday: { open: '08:30', close: '17:30' },
      saturday: null,
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 14. Photography
  // ──────────────────────────────────────────────
  {
    id: 'photography',
    label: 'Photography',
    icon: 'Camera',
    industry: 'Professional Services',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'email_management',
      'client_crm',
      'review_requests',
    ],
    services: [
      {
        name: 'Portrait Session',
        description: 'Professional portrait photography session with edited digital images',
        category: 'Portraits',
        priceCents: 35000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Family Session',
        description: 'Family photography session in studio or on location',
        category: 'Portraits',
        priceCents: 45000,
        priceType: 'starting_at',
        durationMinutes: 90,
      },
      {
        name: 'Wedding - Full Day',
        description: 'Full-day wedding photography coverage',
        category: 'Weddings',
        priceCents: 350000,
        priceType: 'starting_at',
        durationMinutes: 480,
      },
      {
        name: 'Wedding - Half Day',
        description: 'Half-day wedding photography coverage',
        category: 'Weddings',
        priceCents: 200000,
        priceType: 'starting_at',
        durationMinutes: 240,
      },
      {
        name: 'Engagement Shoot',
        description: 'Pre-wedding engagement photography session',
        category: 'Weddings',
        priceCents: 40000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Newborn Session',
        description: 'Newborn baby photography session in studio',
        category: 'Portraits',
        priceCents: 40000,
        priceType: 'fixed',
        durationMinutes: 120,
      },
      {
        name: 'Corporate Headshots - Per Person',
        description: 'Professional corporate headshot per person',
        category: 'Corporate',
        priceCents: 20000,
        priceType: 'fixed',
        durationMinutes: 20,
      },
      {
        name: 'Event Photography',
        description: 'Professional event photography per hour',
        category: 'Events',
        priceCents: 25000,
        priceType: 'hourly',
        durationMinutes: null,
      },
      {
        name: 'Real Estate Photography',
        description: 'Professional real estate photography package per property',
        category: 'Commercial',
        priceCents: 30000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Product Photography - Per Item',
        description: 'Product photography per item on white or styled background',
        category: 'Commercial',
        priceCents: 5000,
        priceType: 'starting_at',
        durationMinutes: 15,
      },
    ],
    faqs: [
      {
        question: 'What is the turnaround time for photos?',
        answer:
          'Portrait and family sessions are delivered within 2 weeks. Weddings take 4-6 weeks for the full edited gallery. Rush delivery is available for an additional fee.',
      },
      {
        question: 'Do you travel to locations?',
        answer:
          'Yes! We shoot on location as well as in studio. Travel within the local area is included. For locations further afield, a travel fee may apply — just ask for a quote.',
      },
      {
        question: 'What happens if it rains on shoot day?',
        answer:
          'For outdoor sessions, we monitor the weather and will offer to reschedule at no charge if conditions are unsuitable. We always have indoor backup options as well.',
      },
      {
        question: 'Are digital files included?',
        answer:
          'Yes, all packages include high-resolution edited digital images delivered via an online gallery. Print packages and albums are available as add-ons.',
      },
    ],
    defaultHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: null,
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 15. Pet Grooming / Vet
  // ──────────────────────────────────────────────
  {
    id: 'pet_grooming_vet',
    label: 'Pet Grooming / Vet',
    icon: 'PawPrint',
    industry: 'Other',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'online_booking',
      'sms_notifications',
      'client_crm',
      'appointment_reminders',
      'review_requests',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Dog Wash - Small',
        description: 'Bath, dry, and brush for small dogs (under 10kg)',
        category: 'Grooming',
        priceCents: 4000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Dog Wash - Medium',
        description: 'Bath, dry, and brush for medium dogs (10-25kg)',
        category: 'Grooming',
        priceCents: 5500,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Dog Wash - Large',
        description: 'Bath, dry, and brush for large dogs (25kg+)',
        category: 'Grooming',
        priceCents: 7000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Full Groom - Small',
        description: 'Full groom including bath, clip, nails, and ears for small dogs',
        category: 'Grooming',
        priceCents: 7500,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Full Groom - Medium',
        description: 'Full groom including bath, clip, nails, and ears for medium dogs',
        category: 'Grooming',
        priceCents: 9500,
        priceType: 'fixed',
        durationMinutes: 75,
      },
      {
        name: 'Full Groom - Large',
        description: 'Full groom including bath, clip, nails, and ears for large dogs',
        category: 'Grooming',
        priceCents: 12000,
        priceType: 'fixed',
        durationMinutes: 90,
      },
      {
        name: 'Cat Grooming',
        description: 'Bath, brush, and trim for cats',
        category: 'Grooming',
        priceCents: 8500,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Nail Trim',
        description: 'Nail trim for dogs or cats',
        category: 'Extras',
        priceCents: 2000,
        priceType: 'fixed',
        durationMinutes: 10,
      },
      {
        name: 'Vet Consultation',
        description: 'General veterinary consultation and examination',
        category: 'Veterinary',
        priceCents: 8500,
        priceType: 'fixed',
        durationMinutes: 20,
      },
      {
        name: 'Vaccination Package',
        description: 'Core vaccinations for dogs or cats',
        category: 'Veterinary',
        priceCents: 12000,
        priceType: 'starting_at',
        durationMinutes: 15,
      },
      {
        name: 'Desexing - Cat',
        description: 'Desexing surgery for cats',
        category: 'Surgery',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Desexing - Dog',
        description: 'Desexing surgery for dogs',
        category: 'Surgery',
        priceCents: 40000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
      {
        name: 'Dental Clean',
        description: 'Professional dental clean under anaesthesia',
        category: 'Dental',
        priceCents: 50000,
        priceType: 'starting_at',
        durationMinutes: null,
      },
    ],
    faqs: [
      {
        question: 'Does my pet need to be vaccinated before grooming?',
        answer:
          'Yes, we require all dogs to be up to date with their C3 vaccination (at minimum) before grooming. This keeps all pets in our care safe. Please bring your vaccination certificate.',
      },
      {
        question: 'How often should my pet be groomed?',
        answer:
          'Most dogs benefit from a full groom every 6-8 weeks, with baths in between as needed. Breeds with fast-growing coats may need grooming every 4-6 weeks.',
      },
      {
        question: 'Can I stay with my pet during grooming?',
        answer:
          'We find most pets are calmer and better behaved when their owners are not present. You\'re welcome to drop off and pick up, and we\'ll call you as soon as your pet is ready.',
      },
      {
        question: 'Do you handle anxious or nervous pets?',
        answer:
          'Absolutely. Our groomers and vets are experienced with anxious pets. Please let us know in advance so we can allow extra time and use calming techniques to keep your pet comfortable.',
      },
    ],
    defaultHours: {
      monday: { open: '08:00', close: '17:30' },
      tuesday: { open: '08:00', close: '17:30' },
      wednesday: { open: '08:00', close: '17:30' },
      thursday: { open: '08:00', close: '17:30' },
      friday: { open: '08:00', close: '17:30' },
      saturday: { open: '08:30', close: '14:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 16. Landscaping / Gardening
  // ──────────────────────────────────────────────
  {
    id: 'landscaping',
    label: 'Landscaping / Gardening',
    icon: 'TreePine',
    industry: 'Home Services',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'quotes_estimates',
      'invoicing_payments',
      'sms_notifications',
      'client_crm',
      'review_requests',
      'daily_briefings',
    ],
    services: [
      {
        name: 'Lawn Mowing - Small',
        description: 'Mow, edge, and blow small lawn (up to 150m\u00B2)',
        category: 'Lawn Care',
        priceCents: 6000,
        priceType: 'fixed',
        durationMinutes: 30,
      },
      {
        name: 'Lawn Mowing - Medium',
        description: 'Mow, edge, and blow medium lawn (150-400m\u00B2)',
        category: 'Lawn Care',
        priceCents: 9000,
        priceType: 'fixed',
        durationMinutes: 45,
      },
      {
        name: 'Lawn Mowing - Large',
        description: 'Mow, edge, and blow large lawn (400m\u00B2+)',
        category: 'Lawn Care',
        priceCents: 14000,
        priceType: 'fixed',
        durationMinutes: 60,
      },
      {
        name: 'Hedge Trimming',
        description: 'Trim and shape hedges per hour',
        category: 'Garden Maintenance',
        priceCents: 7500,
        priceType: 'hourly',
        durationMinutes: null,
      },
      {
        name: 'Garden Clean-Up',
        description: 'General garden clean-up, weeding, and tidying per hour',
        category: 'Garden Maintenance',
        priceCents: 7500,
        priceType: 'hourly',
        durationMinutes: null,
      },
      {
        name: 'Green Waste Removal',
        description: 'Removal of green waste per trailer load',
        category: 'Waste Removal',
        priceCents: 15000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: 'Garden Design Consultation',
        description: 'On-site consultation for garden design and landscape planning',
        category: 'Design',
        priceCents: 25000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
      {
        name: 'Landscape Construction',
        description: 'Full landscape construction including paving, decking, and garden beds',
        category: 'Construction',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Retaining Wall',
        description: 'Design and construction of retaining walls',
        category: 'Construction',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Turf Installation - Per m\u00B2',
        description: 'Supply and lay new turf per square metre',
        category: 'Lawn Care',
        priceCents: 3000,
        priceType: 'fixed',
        durationMinutes: null,
      },
      {
        name: 'Irrigation Installation',
        description: 'Design and install irrigation system',
        category: 'Irrigation',
        priceCents: null,
        priceType: 'quote',
        durationMinutes: null,
      },
      {
        name: 'Regular Maintenance',
        description: 'Regular scheduled garden maintenance visit',
        category: 'Maintenance',
        priceCents: 12000,
        priceType: 'starting_at',
        durationMinutes: 60,
      },
    ],
    faqs: [
      {
        question: 'Do you offer regular maintenance plans?',
        answer:
          'Yes, we offer weekly, fortnightly, and monthly maintenance plans tailored to your garden\'s needs. Regular clients receive priority scheduling and discounted rates.',
      },
      {
        question: 'Do you remove green waste?',
        answer:
          'Yes, green waste removal is included or available as an add-on depending on the service. We dispose of all waste responsibly at licensed green waste facilities.',
      },
      {
        question: 'Can you work on sloped or difficult blocks?',
        answer:
          'Absolutely. We have experience with steep, sloped, and difficult terrain. Retaining walls and terracing are among our specialties. We\'ll assess the site and provide a tailored solution.',
      },
      {
        question: 'Do you offer free quotes?',
        answer:
          'Yes, we provide free on-site quotes for all landscaping and larger gardening jobs. For regular maintenance, we can often quote over the phone or from photos.',
      },
    ],
    defaultHours: {
      monday: { open: '07:00', close: '16:30' },
      tuesday: { open: '07:00', close: '16:30' },
      wednesday: { open: '07:00', close: '16:30' },
      thursday: { open: '07:00', close: '16:30' },
      friday: { open: '07:00', close: '16:30' },
      saturday: { open: '07:30', close: '13:00' },
      sunday: null,
    },
  },

  // ──────────────────────────────────────────────
  // 17. Custom / Other
  // ──────────────────────────────────────────────
  {
    id: 'custom',
    label: 'Custom / Other',
    icon: 'Briefcase',
    industry: 'Other',
    suggestedTone: 'friendly',
    defaultFeatures: [
      'ai_receptionist',
      'sms_notifications',
      'client_crm',
      'daily_briefings',
    ],
    services: [],
    faqs: [
      {
        question: 'What services do you offer?',
        answer: '[Fill in your main services and what customers can expect.]',
      },
      {
        question: 'What are your prices?',
        answer: '[Fill in your pricing structure or direct customers to request a quote.]',
      },
      {
        question: 'How do I book an appointment?',
        answer: '[Fill in how customers can book — online, phone, walk-in, etc.]',
      },
    ],
    defaultHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: null,
      sunday: null,
    },
  },
]

export function getTemplateById(id: string): BusinessTypeTemplate | undefined {
  return BUSINESS_TYPE_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByIndustry(industry: string): BusinessTypeTemplate[] {
  return BUSINESS_TYPE_TEMPLATES.filter((t) => t.industry === industry)
}

export const INDUSTRIES = [
  ...new Set(BUSINESS_TYPE_TEMPLATES.map((t) => t.industry)),
] as const

const INDUSTRY_KEYWORDS: Record<string, string> = {
  hair: 'hair_beauty_salon',
  beauty: 'hair_beauty_salon',
  salon: 'hair_beauty_salon',
  hairdresser: 'hair_beauty_salon',
  nail: 'hair_beauty_salon',
  spa: 'hair_beauty_salon',
  barber: 'barbershop',
  plumb: 'plumber',
  electric: 'electrician',
  hvac: 'hvac',
  'air conditioning': 'hvac',
  aircon: 'hvac',
  clean: 'cleaning',
  landscape: 'landscaping',
  garden: 'landscaping',
  lawn: 'landscaping',
  mechanic: 'auto_mechanic',
  auto: 'auto_mechanic',
  'car repair': 'auto_mechanic',
  restaurant: 'restaurant',
  cafe: 'restaurant',
  coffee: 'restaurant',
  food: 'restaurant',
  catering: 'restaurant',
  gym: 'personal_trainer',
  fitness: 'personal_trainer',
  'personal train': 'personal_trainer',
  medical: 'medical_dental',
  dental: 'medical_dental',
  doctor: 'medical_dental',
  dentist: 'medical_dental',
  clinic: 'medical_dental',
  physio: 'medical_dental',
  chiro: 'medical_dental',
  'real estate': 'real_estate',
  property: 'real_estate',
  account: 'accounting',
  tax: 'accounting',
  bookkeep: 'accounting',
  legal: 'legal',
  law: 'legal',
  solicitor: 'legal',
  attorney: 'legal',
  photo: 'photography',
  video: 'photography',
  pet: 'pet_grooming_vet',
  vet: 'pet_grooming_vet',
  animal: 'pet_grooming_vet',
  dog: 'pet_grooming_vet',
  groom: 'pet_grooming_vet',
}

export function matchIndustryToTemplate(industry: string): BusinessTypeTemplate | undefined {
  const lower = industry.toLowerCase()
  for (const [keyword, templateId] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return getTemplateById(templateId)
    }
  }
  return undefined
}
