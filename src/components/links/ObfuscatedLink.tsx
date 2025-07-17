"use client";

import { useRouter } from "@/i18n/navigation";

type ObfuscatedLinkProps = {
  href:
    | "/"
    | "/secteurs"
    | { pathname: "/secteurs/[slug]"; params: { slug: string } }
    | "/blog"
    | { pathname: "/blog/[slug]"; params: { slug: string } }
    | {
        pathname: "/blog/[slug]/[subSlug]";
        params: { slug: string; subSlug: string };
      }
    | "/gammes"
    | "/engagements"
    | "/partenaires"
    | "/faq"
    | "/prestataire"
    | "/contact"
    | "/mentions"
    | "/confidentialite"
    | "/cookies"
    | "/cgv"
    | "/cgu"
    | { pathname: "/admin/[adminId]/dashboard"; params: { adminId: string } }
    | { pathname: "/client/[clientId]/dashboard"; params: { clientId: string } }
    | {
        pathname: "/fournisseur/[fournisseurId]/dashboard";
        params: { fournisseurId: string };
      }
    | "/auth/signin"
    | {
        pathname: "/services/[slug]";
        params: { slug: string };
      };
  children: React.ReactNode;
  className?: string;
};

export function ObfuscatedLink({
  href,
  children,
  className,
}: ObfuscatedLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    // e.preventDefault();
    router.push(href);
  };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className={`cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${className}`}
      title={typeof children === "string" ? children : undefined}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}
