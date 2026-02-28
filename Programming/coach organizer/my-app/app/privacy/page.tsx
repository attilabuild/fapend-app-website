import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Growial — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-5 py-12 md:px-10">
      <Navbar variant="logoOnly" />

      <article className="mx-auto max-w-3xl pt-16">
        <h1 className="text-3xl font-normal tracking-[-0.02em] md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-gray-500">Last updated: February 2026</p>

        <div className="prose prose-gray mt-10 max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-medium text-black">1. Who we are</h2>
            <p>
              Growial is a client journey automation platform for coaches, mentors, and program
              creators. It is operated by DesignAxe (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;).
              This Privacy Policy explains how we collect, use, store, and protect information when
              you use our website and the Growial service (dashboard, client portal, flows, and
              related features).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">2. Information we collect</h2>
            <p className="font-medium text-gray-800">Account and profile information</p>
            <p>
              When you sign up as a coach or client, we collect information you provide, such as
              name, email address, and password. Coaches may add a display name, coaching type, bio,
              timezone, and optional website. We use this to create and manage your account and to
              display your public coach profile if you have one.
            </p>
            <p className="mt-3 font-medium text-gray-800">Client data (entered by coaches)</p>
            <p>
              Coaches use the Service to add clients (e.g. name, email) and to assign them to
              flows, tasks, and milestones. This data is stored so we can provide the coach
              dashboard, send automated emails (welcome, reminders, check-ins), and generate
              client-specific portal links. Clients who access the portal via a magic link do not
              need to create an account; the link itself identifies their record.
            </p>
            <p className="mt-3 font-medium text-gray-800">Usage and technical data</p>
            <p>
              We may collect information about how you use the Service (e.g. pages visited, actions
              taken) and technical data such as IP address, browser type, and device information.
              We use this to operate, secure, and improve the Service and to analyze usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">3. How we use your information</h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Provide, maintain, and improve the Service (dashboard, flows, client portal, email automation);</li>
              <li>Authenticate you and manage your account;</li>
              <li>Send service-related emails (e.g. welcome messages, task reminders, check-ins) as configured by coaches;</li>
              <li>Respond to your requests and support inquiries;</li>
              <li>Comply with legal obligations and enforce our Terms of Service;</li>
              <li>Analyze and improve our product and user experience.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties. We may share data with
              service providers who help us operate the Service (e.g. hosting, email delivery), under
              contracts that limit their use of the data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">4. Client portal and magic links</h2>
            <p>
              Clients access their portal via a unique link sent by their coach. The link is tied to
              the client&apos;s record (name, tasks, progress, coach messages). We do not require
              clients to create an account or log in for the current version of the product. Coaches
              are responsible for sharing portal links only with the intended client and for
              complying with applicable privacy laws when collecting and using client data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">5. Data retention and security</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the
              Service and fulfill the purposes described in this policy. If you delete your account
              or ask us to delete your data, we will do so in line with our procedures and
              applicable law. We implement reasonable technical and organizational measures to
              protect your data against unauthorized access, loss, or misuse.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">6. Cookies and similar technologies</h2>
            <p>
              We may use cookies and similar technologies to keep you logged in, remember your
              preferences, and understand how the Service is used. You can adjust your browser
              settings to limit or block cookies; some features may not work correctly if you
              disable them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">7. Your rights</h2>
            <p>
              Depending on where you live, you may have the right to access, correct, delete, or
              export your personal data, or to object to or restrict certain processing. To exercise
              these rights, contact us at{" "}
              <a
                href="mailto:hello@Growial.app"
                className="text-black underline underline-offset-2 hover:no-underline"
              >
                hello@Growial.app
              </a>
              . We will respond in line with applicable law. If you are in the European Economic
              Area, you also have the right to lodge a complaint with a supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">8. International transfers</h2>
            <p>
              Your data may be processed in countries other than your own. We take steps to ensure
              that such transfers are subject to appropriate safeguards in line with applicable data
              protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">9. Children</h2>
            <p>
              The Service is not intended for users under the age of 16. We do not knowingly
              collect personal information from children under 16. If you become aware that a child
              has provided us with personal information, please contact us and we will take steps to
              delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">10. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated policy
              on this page and update the &quot;Last updated&quot; date. If we make material
              changes, we may notify you by email or through the Service. Continued use of the
              Service after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-black">11. Contact</h2>
            <p>
              For questions about this Privacy Policy or our data practices, contact us at{" "}
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
