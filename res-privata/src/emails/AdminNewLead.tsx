import { Text } from "@react-email/components";
import { BrandLayout, brand, CtaButton, Eyebrow, Heading, Paragraph } from "./BrandLayout";

export type AdminNewLeadProps = {
  fullName: string;
  email: string;
  plan: string;
  source: string;
  callBy: string;
  adminUrl: string;
};

export default function AdminNewLead({ fullName, email, plan, source, callBy, adminUrl }: AdminNewLeadProps) {
  const rows: [string, string][] = [
    ["Imię i nazwisko", fullName],
    ["E-mail", email],
    ["Pakiet", plan],
    ["Źródło", source],
  ];
  return (
    <BrandLayout preview={`Nowy lead: ${fullName} (${plan}). Zadzwoń w 48 h.`}>
      <Eyebrow>Nowy lead · {plan}</Eyebrow>
      <Heading>Zadzwoń do {callBy}.</Heading>
      <Paragraph>Nowe zgłoszenie z formularza. Dla Member i Private kontaktujemy się w ciągu 48 godzin.</Paragraph>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ width: "100%", margin: "0 0 16px" }}>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td style={{ padding: "6px 12px 6px 0", fontSize: 13, color: brand.ink3, width: 140 }}>{k}</td>
              <td style={{ padding: "6px 0", fontSize: 15, color: brand.ink }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CtaButton href={adminUrl}>Otwórz CRM</CtaButton>
      <Text style={{ fontSize: 12, color: brand.ink3 }}>Wiadomość wewnętrzna – nie przekazuj dalej.</Text>
    </BrandLayout>
  );
}

AdminNewLead.PreviewProps = {
  fullName: "Jan Kowalski",
  email: "jan@example.pl",
  plan: "Member",
  source: "Formularz Dołącz",
  callBy: "czwartku, 6 listopada",
  adminUrl: "https://example.com/admin/leady",
} satisfies AdminNewLeadProps;
