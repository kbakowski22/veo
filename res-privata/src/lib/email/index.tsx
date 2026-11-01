import "server-only";
import AdminNewLead from "@/emails/AdminNewLead";
import WelcomeCircle from "@/emails/WelcomeCircle";
import WelcomeMember from "@/emails/WelcomeMember";
import WelcomePrivate from "@/emails/WelcomePrivate";
import type { Role } from "@/lib/auth/roles";
import { env } from "@/lib/env";
import { sendEmail } from "./send";

const firstName = (fullName?: string | null) => fullName?.trim().split(/\s+/)[0] ?? null;

export function sendWelcomeEmail(params: { to: string; fullName?: string | null; role: Role; founding?: boolean }) {
  const name = firstName(params.fullName);
  const panelUrl = `${env.siteUrl}/panel`;
  switch (params.role) {
    case "circle":
      return sendEmail({
        to: params.to,
        subject: "Witaj w Res Privata",
        tag: "welcome_circle",
        react: <WelcomeCircle firstName={name} reportUrl={`${panelUrl}/raporty`} />,
      });
    case "member":
      return sendEmail({
        to: params.to,
        subject: "Twoje członkostwo Member jest aktywne",
        tag: "welcome_member",
        react: <WelcomeMember firstName={name} panelUrl={panelUrl} founding={params.founding} />,
      });
    case "private":
      return sendEmail({
        to: params.to,
        subject: "Witamy w Res Privata Private",
        tag: "welcome_private",
        react: <WelcomePrivate firstName={name} panelUrl={panelUrl} />,
      });
    default:
      return Promise.resolve({ ok: true as const, skipped: true });
  }
}

export function sendAdminLeadNotification(lead: {
  fullName: string;
  email: string;
  plan: string;
  source: string;
  callBy: Date;
}) {
  if (!env.adminNotifyEmail) {
    console.info("[email] pominięto powiadomienie o leadzie (brak ADMIN_NOTIFY_EMAIL)");
    return Promise.resolve({ ok: true as const, skipped: true });
  }
  const callBy = lead.callBy.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
  return sendEmail({
    to: env.adminNotifyEmail,
    subject: `Nowy lead ${lead.plan}: ${lead.fullName}`,
    tag: "admin_lead",
    replyTo: lead.email,
    react: (
      <AdminNewLead
        fullName={lead.fullName}
        email={lead.email}
        plan={lead.plan}
        source={lead.source}
        callBy={callBy}
        adminUrl={`${env.siteUrl}/admin/leady`}
      />
    ),
  });
}
