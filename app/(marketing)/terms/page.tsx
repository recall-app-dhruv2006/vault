import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>These terms are a placeholder outline for the MVP and are not a substitute for legal counsel before commercial launch.</p>
      <h2>Using Vault</h2>
      <p>Vault is provided to help you save and retrieve your own content. You're responsible for the content you upload and for having the right to save and process it through Vault's AI features.</p>
      <h2>Your content</h2>
      <p>You retain ownership of everything you save. We process it only to provide Vault's features to you, as described in the Privacy page.</p>
      <h2>Acceptable use</h2>
      <p>Don't use Vault to store or process content you don't have the right to, or to attempt to access another user's data.</p>
      <h2>Plans and billing</h2>
      <p>Free and Pro plan limits are described on the Pricing page. Billing is not yet active in the MVP.</p>
      <h2>Termination</h2>
      <p>You can delete your account at any time from Settings. We may suspend accounts that violate these terms.</p>
    </LegalPage>
  );
}
