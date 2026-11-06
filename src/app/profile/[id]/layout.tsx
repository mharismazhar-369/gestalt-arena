import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, company_name, bio, avatar_url, role")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    return {
      title: "Member Profile",
      description: "View verified member profile on Gestalt Arena.",
    };
  }

  const name = profile.nickname || profile.company_name || "Arena Member";
  const roleTitle = profile.role === "investor" ? "Investor" : "Founder & Startup";
  const description =
    profile.bio?.slice(0, 160) ||
    `${name} is a verified ${roleTitle} on Gestalt Arena. Connect, collaborate, and explore opportunities.`;

  return {
    title: `${name} (${roleTitle})`,
    description,
    openGraph: {
      title: `${name} | Gestalt Arena`,
      description,
      url: `https://www.gestalt-arena.com/profile/${id}`,
      siteName: "Gestalt Arena",
      type: "profile",
      images: profile.avatar_url
        ? [
            {
              url: profile.avatar_url,
              width: 400,
              height: 400,
              alt: `${name} avatar`,
            },
          ]
        : [
            {
              url: "/og-image.jpg",
              width: 1200,
              height: 630,
              alt: `${name} on Gestalt Arena`,
            },
          ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Gestalt Arena`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : ["/og-image.jpg"],
    },
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

