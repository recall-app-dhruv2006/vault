import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        Vault exists to help you find things you saved — not to build a profile of you. This page explains, in
        plain language, what we store and what our AI processing touches.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>The content you save: links, images, screenshots, PDFs, notes, and receipts, plus the file itself in private storage.</li>
        <li>AI-generated metadata about that content: titles, summaries, tags, categories, and extracted details like prices or dates.</li>
        <li>Your account information: email, display name, and settings.</li>
        <li>Usage data needed for the product to work: search history (so you can revisit past searches), item view timestamps, and processing status.</li>
      </ul>

      <h2>What our AI processes</h2>
      <p>
        When you save an item, we send its content (text, extracted page text, or images) to our AI provider to
        generate a title, summary, tags, and searchable description, and to create a semantic embedding used for
        search. This processing happens only to power features you've asked for — search, categorization, and
        receipt extraction. We do not use your content to train AI models, and we do not use one user's content
        to answer another user's search.
      </p>

      <h2>Your controls</h2>
      <ul>
        <li>Delete any individual item at any time — it moves to Trash, then is permanently removed after 30 days, or immediately if you empty Trash.</li>
        <li>Delete your full search history from Settings → Privacy.</li>
        <li>Download an export of your data (Pro feature, scaffolded for a future release).</li>
        <li>Delete your account entirely, which permanently removes your items, files, embeddings, and account record.</li>
      </ul>

      <h2>What we don't do</h2>
      <ul>
        <li>We don't sell your data.</li>
        <li>We don't show your saved content to other users.</li>
        <li>We don't claim end-to-end encryption — files are stored securely in private, access-controlled storage, but Vault's servers can technically access content to process it, the same as most SaaS products.</li>
      </ul>

      <h2>Questions</h2>
      <p>Reach us at the address on the Contact page for any privacy question or data request.</p>
    </LegalPage>
  );
}
