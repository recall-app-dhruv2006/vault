/**
 * Centralized brand configuration.
 *
 * Everything user-facing about the product's identity lives here:
 * name, tagline, copy fragments, colors (mirrored in globals.css as CSS
 * variables), and links. Change this file — and the CSS variables in
 * app/globals.css — to rebrand the product without touching page code.
 */

export const brand = {
  name: "Vault",
  shortName: "Vault",
  tagline: "Find anything you remember seeing.",
  description:
    "Vault turns your screenshots, links, receipts, notes, and documents into a private AI-searchable memory.",
  promise: "Save anything. Remember nothing. Find everything.",
  slogan: "I know I saw it somewhere.",
  domain: "vault.app",
  supportEmail: "support@vault.app",
  social: {
    twitter: "https://twitter.com/vaultapp",
    linkedin: "https://linkedin.com/company/vaultapp",
    instagram: "https://instagram.com/vaultapp",
  },
  legal: {
    company: "Vault Labs, Inc.",
    lastUpdated: "2026-08-06",
  },
} as const;

export const plans = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    limits: {
      maxItems: 100,
      maxCollections: 3,
      maxSearchesPerDay: 10,
      maxFileSizeMb: 15,
      maxPdfPages: 30,
      smartCollections: false,
      receiptReminders: true,
      exportTools: false,
      priorityProcessing: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 9,
    limits: {
      maxItems: Infinity,
      maxCollections: Infinity,
      maxSearchesPerDay: Infinity,
      maxFileSizeMb: 100,
      maxPdfPages: 300,
      smartCollections: true,
      receiptReminders: true,
      exportTools: true,
      priorityProcessing: true,
    },
  },
} as const;

export type PlanId = keyof typeof plans;
