import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Growial — client journey automation for coaches and clients.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-5 py-12 md:px-10">
      <Navbar variant="logoOnly" />

      <article className="mx-auto max-w-3xl pt-16">
        <h1 className="text-3xl font-normal tracking-[-0.02em] md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-gray-500">Last updated: February 2026</p>

        <div className="prose prose-gray mt-10 max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-medium text-black">1. Agreement to terms</h2>
            <p>
              By accessing or using Growial (&quot;the Service&quot;), operated by DesignAxe
              (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;), you agree to be bound by these Terms of
              Service. The Service is a client journey automation platform for coaches, mentors, and
              program creators. It helps you onboard clients, assign tasks and milestones, automate
              reminders, and provide a simple client portal. If you do not agree to these terms, do
              not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">2. Description of the service</h2>
            <p>
              Growial provides (i) <strong>execution</strong> tools: prebuilt coaching flows
              (e.g. 1:1 onboarding, 8–12 week programs, high-ticket mentorship), a coach dashboard
              to manage clients and stages (Onboarding, Active, At Risk, Completed), a client portal
              accessible via a unique link per client (no login required in the current version), and
              email-based automation (welcome messages, reminders, check-ins). We may also offer (ii){" "}
              <strong>discovery</strong> features so that clients can search for and find coaches on
              the platform.
            </p>
            <p className="mt-3">
              The Service is built for solo coaches, business mentors, fitness and mindset coaches,
              and program-based educators. It is not intended for agencies or large teams. We do not
              provide course hosting, community feeds, full CRM, or payment processing as part of the
              current product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">3. Accounts and roles</h2>
            <p>
              You may use the Service as a <strong>coach</strong> (creating flows, adding clients,
              managing your dashboard) or as a <strong>client</strong> (accessing a portal via a link
              from your coach, viewing tasks and progress). You are responsible for the accuracy of
              the information you provide and for keeping your account credentials secure. You must
              not share your coach account or client portal links with anyone who should not have
              access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">4. Acceptable use</h2>
            <p>
              You agree to use the Service only for lawful purposes and in line with these terms.
              You may not: use the Service to harm, harass, or mislead others; upload or share
              content that infringes others&apos; rights or is illegal; attempt to gain unauthorized
              access to our systems or other users&apos; data; or use the Service in a way that
              overburdens our infrastructure or negatively affects other users. We may suspend or
              terminate access if we reasonably believe you have violated these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">5. Client data and your responsibility</h2>
            <p>
              As a coach, you may input client names, email addresses, and other information into
              the Service. You are responsible for ensuring you have the right to collect and use
              that data and for complying with applicable privacy and data protection laws. We
              process such data as described in our Privacy Policy to provide and improve the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">6. Payments and billing</h2>
            <p>
              The current version of the Service (MVP) may not include payment or billing features.
              If we introduce paid plans or payment processing later, additional terms and fees will
              apply and will be communicated to you before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">7. Intellectual property</h2>
            <p>
              The Service, including its design, software, and content we provide, is owned by us
              or our licensors. You do not acquire any ownership rights by using the Service. You
              retain ownership of the content you create (e.g. flow copy, client data); you grant us
              a limited license to use, store, and process that content as necessary to provide and
              improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">8. Disclaimers</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available.&quot; We do not
              guarantee that it will be uninterrupted, error-free, or secure. We are not liable for
              any coaching outcomes, client relationships, or business results. You use the Service
              at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">9. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, we (and our affiliates, officers, and
              employees) shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages, or for loss of data, revenue, or profits, arising from your use
              of the Service. Our total liability for any claims related to the Service shall not
              exceed the amount you paid us in the twelve (12) months preceding the claim, or one
              hundred dollars (100 USD), whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">10. Termination</h2>
            <p>
              You may stop using the Service at any time. We may suspend or terminate your access
              for violation of these terms or for any other reason. Upon termination, your right to
              use the Service ceases. Sections that by their nature should survive (including
              intellectual property, disclaimers, limitation of liability, and governing law) will
              survive.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">11. Changes to terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will post the updated
              terms on this page and update the &quot;Last updated&quot; date. Continued use of the
              Service after changes constitutes acceptance of the revised terms. If you do not
              agree, you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">12. Governing law and contact</h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which DesignAxe operates,
              without regard to conflict of law principles. For questions about these terms, contact
              us at{" "}
              <a
                href="mailto:hello@Growial.app"
                className="text-black underline underline-offset-2 hover:no-underline"
              >
                hello@Growial.app
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-gray-500">
          <Link href="/" className="text-black hover:underline">
            ← Back to Growial
          </Link>
        </p>
      </article>
    </div>
  );
}
