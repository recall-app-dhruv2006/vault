import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms are a good-faith outline for the beta product and are not a substitute for legal counsel
        before commercial launch. By creating an account or using Vault, you agree to the terms below.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 13 years old to use Vault. If you're under 18, you confirm you have a parent or
        guardian's permission to use the service.
      </p>

      <h2>Using Vault</h2>
      <p>
        Vault is provided to help you save and retrieve your own content. You're responsible for the content
        you upload and for having the right to save and process it through Vault's AI features. You're
        responsible for keeping your account credentials secure and for all activity under your account.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of everything you save. We process it only to provide Vault's features to you, as
        described in the Privacy page. You grant us the limited right to store, process, and analyze your
        content solely to operate and improve the features you use — nothing more.
      </p>

      <h2>Acceptable use</h2>
      <p>Don't use Vault to:</p>
      <ul>
        <li>Store or process content you don't have the right to save.</li>
        <li>Attempt to access another user's data or bypass access controls.</li>
        <li>Upload malware, or content that's illegal, infringing, or that violates someone else's rights.</li>
        <li>Abuse, overload, or attempt to reverse-engineer the service.</li>
      </ul>
      <p>We may suspend or remove content or accounts that violate these terms.</p>

      <h2>Plans and billing</h2>
      <p>
        Free and Pro plan limits are described on the Pricing page. Billing is not yet active — no payment
        method is charged in the current beta. This section will be updated before any paid plan goes live.
      </p>

      <h2>Service availability</h2>
      <p>
        Vault is provided during a beta period on an "as is" and "as available" basis, without warranties of
        any kind, express or implied. We don't guarantee uninterrupted or error-free operation, and features may
        change as the product evolves.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Vault and its operators aren't liable for indirect, incidental,
        or consequential damages arising from your use of the service. Because this is a beta product, we
        recommend keeping independent backups of anything irreplaceable.
      </p>

      <h2>Termination</h2>
      <p>
        You can delete your account at any time from Settings — this permanently removes your items, files, and
        account record. We may suspend or terminate accounts that violate these terms.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms as the product develops. Material changes will be reflected by updating the
        "last updated" date above; continued use after a change means you accept the update.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms? Reach us via the Contact page.</p>
    </LegalPage>
  );
}
