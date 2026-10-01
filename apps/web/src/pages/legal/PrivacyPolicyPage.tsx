import {
  Shield,
  Lock,
  CheckCircle2,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-10">
      {/* Header */}
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
            DPDPA 2023 & IT ACT COMPLIANT
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            Last Updated: October 2026
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          FastQuiz Technologies Private Limited ("FastQuiz", "we", "our", or
          "us") is committed to protecting your personal data in full compliance
          with the{" "}
          <strong>
            Digital Personal Data Protection Act, 2023 (DPDPA 2023)
          </strong>
          , the <strong>Information Technology Act, 2000</strong>, and the{" "}
          <strong>
            Information Technology (Reasonable Security Practices and Procedures
            and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)
          </strong>{" "}
          of the Republic of India.
        </p>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs font-mono uppercase">
            <Shield className="w-4 h-4" />
            Data Minimization
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We collect only what is strictly required to provide diagnostic
            assessments and manage your account.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs font-mono uppercase">
            <Lock className="w-4 h-4" />
            Zero Data-Mining
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We never sell, broker, or rent your personal data or assessment
            telemetry to advertisers or third-party brokers.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs font-mono uppercase">
            <CheckCircle2 className="w-4 h-4" />
            Your Rights
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Full rights under Indian law to access, correct, download, or
            permanently erase your data at any time.
          </p>
        </div>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {/* 1. Data Fiduciary */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              01.
            </span>
            Identity of Data Fiduciary
          </h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023, the Data
            Fiduciary responsible for your personal data is:
          </p>
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs space-y-1 text-zinc-800 dark:text-zinc-200">
            <div>
              <strong>Entity:</strong> FastQuiz Technologies Private Limited
            </div>
            <div>
              <strong>Registered Jurisdiction:</strong> Bengaluru, Karnataka,
              India
            </div>
            <div>
              <strong>Registered Office:</strong> 4th Floor, Tech Innovation
              Hub, 14th Main Road, HSR Layout Sector 4, Bengaluru, Karnataka
              560102, India
            </div>
            <div>
              <strong>Corporate Email:</strong> legal@fastquiz.in
            </div>
          </div>
        </section>

        {/* 2. Personal Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              02.
            </span>
            Personal Data We Collect (Data Minimization Pledge)
          </h2>
          <p>
            In accordance with Section 6 of DPDPA 2023, we practice strict{" "}
            <em>data minimization</em>. We only collect the minimal personal
            data necessary for delivering our educational assessment service:
          </p>
          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                A. Account Information
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Full name and email address provided during registration. If you
                authenticate via Google or GitHub OAuth, we receive only the
                public profile name and verified email address authorized by
                you. We do not access contacts, repositories, or social graphs.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                B. Assessment & Performance Telemetry
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Selected quiz answers, completion timestamps, pacing intervals,
                diagnostic scores, and unlocked topic modules. This data is
                strictly used to render your personalized diagnostic reports and
                curriculum dashboard.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                C. Transaction Information
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                When you unlock paid modules or topic bundles, payment is
                processed securely through our RBI-licensed payment gateway
                partner, <strong>Razorpay</strong>. We never store or process
                your credit/debit card numbers, CVVs, or Net Banking credentials
                on our servers. We receive only a tokenized transaction
                reference ID, payment timestamp, and order status.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                D. Essential Technical Logs
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                IP address, user agent, session tokens, and security error logs
                required for platform security, fraud prevention, and session
                maintenance under the IT Act 2000.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
            <strong>What We Never Collect:</strong> We do not collect Aadhaar
            numbers, biometric data, precise GPS location, phone contacts,
            financial credentials, or microphone/camera feeds.
          </div>
        </section>

        {/* 3. Purpose of Processing & Lawful Basis */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              03.
            </span>
            Lawful Basis and Purposes of Processing
          </h2>
          <p>
            Under Section 4 and Section 6 of DPDPA 2023, personal data is
            processed solely for specified, explicit, and lawful purposes based
            on your informed consent:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>
              Creating, authenticating, and maintaining your engineer profile.
            </li>
            <li>
              Administering timed diagnostics and generating accuracy/rubric
              telemetry.
            </li>
            <li>
              Processing orders for single modules or topic master bundles.
            </li>
            <li>
              Transmitting transactional notifications, purchase receipts, and
              support communications.
            </li>
            <li>
              Enforcing assessment security, cheating mitigation, and preventing
              denial-of-service abuse.
            </li>
            <li>
              Sending our weekly Staff Architecture Digest (only if you opted
              in, with one-click unsubscribe).
            </li>
          </ul>
        </section>

        {/* 4. Third-Party Integrations */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              04.
            </span>
            Third-Party Processors & Integrations
          </h2>
          <p>
            We partner only with vetted data processors who comply with Indian
            data protection standards and applicable security benchmarks:
          </p>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs">
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Razorpay Software Private Limited
                </span>
                <span className="block text-zinc-500">
                  Payment Gateway (PCI-DSS Level 1 compliant, RBI regulated)
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Payments & Refunds
              </span>
            </div>
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Google LLC (Google Identity Services)
                </span>
                <span className="block text-zinc-500">
                  Optional single sign-on authentication
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                OAuth Sign-in
              </span>
            </div>
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  GitHub Inc.
                </span>
                <span className="block text-zinc-500">
                  Optional developer single sign-on authentication
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                OAuth Sign-in
              </span>
            </div>
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Google Fonts
                </span>
                <span className="block text-zinc-500">
                  Static typography assets (Inter, JetBrains Mono, Plus Jakarta
                  Sans)
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                CDN Font Delivery
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            We do not embed third-party advertising trackers, social sharing
            surveillance pixels, or behavioral analytics cookies.
          </p>
        </section>

        {/* 5. Rights of Data Principals */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              05.
            </span>
            Your Rights Under DPDPA 2023
          </h2>
          <p>
            As a Data Principal under Chapter III of the Digital Personal Data
            Protection Act, 2023, you hold the following statutory rights:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Right to Access Information (Sec. 11)
              </span>
              <p className="text-zinc-500">
                Request a summary of personal data being processed and
                identities of Data Processors with whom it was shared.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Right to Correction & Erasure (Sec. 12)
              </span>
              <p className="text-zinc-500">
                Request updating of incomplete or inaccurate data, or permanent
                deletion of your account and personal history.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Right of Grievance Redressal (Sec. 13)
              </span>
              <p className="text-zinc-500">
                Direct escalation to our designated Grievance Officer, with
                response within statutory timelines.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Right to Nominate (Sec. 14)
              </span>
              <p className="text-zinc-500">
                Nominate any individual who shall exercise your rights in the
                event of death or incapacity.
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            To exercise any of these rights, email us at{" "}
            <a
              href="mailto:privacy@fastquiz.in"
              className="text-indigo-600 dark:text-indigo-400 underline"
            >
              privacy@fastquiz.in
            </a>{" "}
            or submit a request to our Grievance Officer.
          </p>
        </section>

        {/* 6. Children's Data */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              06.
            </span>
            Protection of Children (DPDPA Section 9)
          </h2>
          <p>
            FastQuiz is an engineering diagnostic platform intended for
            university students and software engineering professionals aged 18
            and older. We do not knowingly collect personal data from or target
            individuals under 18 years of age. In compliance with Section 9 of
            the DPDPA 2023, we do not undertake tracking, behavioral monitoring,
            or targeted advertising directed at children.
          </p>
        </section>

        {/* 7. Data Retention & Erasure */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              07.
            </span>
            Data Retention and Security
          </h2>
          <p>
            We retain your personal data only as long as your account remains
            active or as required by applicable Indian tax and electronic
            transaction laws (e.g. keeping purchase invoice records under GST
            regulations). When you delete your account, personal identifiers are
            permanently scrubbed from active operational databases within 30
            days.
          </p>
          <p>
            In accordance with Rule 5(8) of the IT SPDI Rules 2011, we maintain
            reasonable security practices including TLS 1.3 encryption in
            transit, salted password hashes (bcrypt/argon2), strict role-based
            access control, and automated audit logging.
          </p>
        </section>

        {/* 8. Grievance Officer Details */}
        <section className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
              08.
            </span>
            Designated Grievance Officer
          </h2>
          <p>
            In compliance with Section 13 of the Digital Personal Data
            Protection Act, 2023 and Rule 3(2) of the Information Technology
            (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021,
            the designated Grievance Officer for FastQuiz is:
          </p>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-2">
            <div>
              <strong>Name:</strong> Ankit Mehra
            </div>
            <div>
              <strong>Designation:</strong> Data Protection & Grievance
              Redressal Officer
            </div>
            <div>
              <strong>Company:</strong> FastQuiz Technologies Private Limited
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <span>
                <strong>Address:</strong> 4th Floor, Tech Innovation Hub, 14th
                Main Road, HSR Layout Sector 4, Bengaluru, Karnataka 560102,
                India
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:grievance@fastquiz.in"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  grievance@fastquiz.in
                </a>
              </span>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-[11px] text-zinc-500">
              <strong>Statutory SLA:</strong> Acknowledgment of grievance within
              24 to 48 hours; resolution within 15 calendar days from receipt.
            </div>
          </div>
        </section>
      </div>

      {/* Navigation Footer */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
        <Link
          to="/terms"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Terms & Conditions
        </Link>
        <Link
          to="/cookies"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Cookie Policy & Storage Details
        </Link>
        <Link
          to="/refund-policy"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Refund & Access Policy
        </Link>
        <Link
          to="/about"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 underline"
        >
          Company & Business Details
        </Link>
      </div>
    </div>
  );
};
