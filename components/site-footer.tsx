import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand";

import type { PortfolioProfile } from "@/lib/types";

export function SiteFooter({ profile }: { profile: PortfolioProfile }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded border border-primary/40 bg-primary/10 font-mono text-[0.7rem] font-bold text-primary">
                MA
              </span>
              <span className="font-mono text-sm font-semibold">
                {profile.name}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {profile.role} — {profile.availability}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <FooterIcon href={profile.githubUrl} label="GitHub">
                <GithubIcon className="size-4" />
              </FooterIcon>
              <FooterIcon href={profile.linkedinUrl} label="LinkedIn">
                <LinkedinIcon className="size-4" />
              </FooterIcon>
              <FooterIcon href={`mailto:${profile.email}`} label="Email">
                <Mail className="size-4" />
              </FooterIcon>
              <FooterIcon
                href={`https://wa.me/${profile.whatsapp}`}
                label="WhatsApp"
              >
                <MessageCircle className="size-4" />
              </FooterIcon>
            </div>
          </div>

          <nav aria-label="Footer" className="text-sm">
            <h2 className="label-mono mb-4">Navigate</h2>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Command Center" },
                { href: "/projects", label: "Projects" },
                { href: "/writeups", label: "Write-ups" },
                { href: "/#triage", label: "Triage Lab" },
                { href: "/#contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm">
            <h2 className="label-mono mb-4">Direct line</h2>
            <ul className="space-y-2.5 text-muted-foreground">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="transition-colors hover:text-primary"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${profile.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-primary"
                >
                  {profile.phone}
                </a>
              </li>
              <li>{profile.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.7rem] tracking-[0.06em] text-muted-foreground">
            © {year} {profile.name} · built with Next.js, Supabase &amp; the AI SDK
          </p>
          <p className="font-mono text-[0.7rem] tracking-[0.06em] text-muted-foreground">
            <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle" />
            all systems nominal
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="grid size-9 place-items-center rounded border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {children}
    </a>
  );
}
