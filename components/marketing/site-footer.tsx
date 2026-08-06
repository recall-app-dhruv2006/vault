import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { brand } from "@/lib/config/brand";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/sign-up", label: "Start free" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "https://status.recall.app", label: "Status" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{brand.description}</p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-label text-muted-foreground">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-caption text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {brand.legal.company}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href={brand.social.twitter} className="hover:text-foreground">Twitter</a>
            <a href={brand.social.linkedin} className="hover:text-foreground">LinkedIn</a>
            <a href={brand.social.instagram} className="hover:text-foreground">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
