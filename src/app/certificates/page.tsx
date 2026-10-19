import type { Metadata } from "next";
import { CertificatesView } from "./CertificatesView";
import { getCertificates } from "@/lib/mongodb/certificates";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Certificates",
  description:
    "Verified technical certifications, accreditations, and coursework completions of Manish Kumar.",
  alternates: {
    canonical: "/certificates",
  },
  openGraph: {
    title: `Certificates | ${siteConfig.author}`,
    description:
      "Verified technical certifications, accreditations, and coursework completions of Manish Kumar.",
    url: `${siteConfig.url}/certificates`,
    type: "website",
  },
};

import { connection } from "next/server";

export const instant = false;

export default async function CertificatesPage() {
  await connection();
  const certificates = await getCertificates();

  return (
    <div className="pb-8 sm:pb-12">
      <CertificatesView initialCertificates={certificates} />
    </div>
  );
}
