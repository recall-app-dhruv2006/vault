import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <LegalPage title="Security">
      <p>An honest look at how Vault protects your data. We only describe controls that are actually implemented.</p>
      <h2>Data isolation</h2>
      <p>Every table that holds your content enforces Row Level Security in PostgreSQL — the database itself rejects any query that isn't scoped to your own user ID, not just the application code.</p>
      <h2>Private file storage</h2>
      <p>Uploaded files live in private storage buckets. Nothing is publicly accessible; the app generates short-lived signed URLs to display your files to you.</p>
      <h2>Link fetching</h2>
      <p>When you save a link, our servers fetch the page on your behalf with protections against requests to internal/private network addresses (SSRF protection), a size limit, and a timeout.</p>
      <h2>Input handling</h2>
      <p>Uploaded files are validated by type and size before processing. We never render untrusted HTML from saved pages directly — page text is extracted and stripped before storage.</p>
      <h2>Secrets</h2>
      <p>API keys and service credentials are stored as server-only environment variables and are never sent to the browser.</p>
      <h2>Encryption</h2>
      <p>
        All traffic between your browser and Vault is encrypted in transit (HTTPS/TLS). Data at rest in our
        database and storage buckets is encrypted by our infrastructure provider (Supabase, built on Postgres
        and AWS-backed storage).
      </p>
      <h2>Account security</h2>
      <p>
        Passwords are never stored in plain text — authentication is handled by Supabase Auth, which hashes
        passwords and manages sessions. You can also sign in with Google OAuth, which avoids storing a password
        for your account at all.
      </p>
      <h2>Rate limiting</h2>
      <p>
        Sensitive and AI-touching actions (link saving, search, account creation) are rate-limited to reduce
        abuse and accidental overload.
      </p>
      <h2>Current limitations</h2>
      <p>
        Vault is a beta product and has not yet been through a formal third-party security audit. We follow
        established practices (RLS, SSRF protection, input validation, least-privilege secrets) but recommend
        against storing anything highly sensitive until an independent audit has been completed.
      </p>
      <h2>Reporting an issue</h2>
      <p>If you find a security issue, please contact us — see the Contact page. We take reports seriously and will respond promptly.</p>
    </LegalPage>
  );
}
