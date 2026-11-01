import { BrandLayout, BulletList, CtaButton, Divider, Eyebrow, Heading, Paragraph } from "./BrandLayout";

export type WelcomeMemberProps = { firstName?: string | null; panelUrl: string; founding?: boolean };

export default function WelcomeMember({ firstName, panelUrl, founding }: WelcomeMemberProps) {
  return (
    <BrandLayout preview="Twoje członkostwo Member jest aktywne.">
      <Eyebrow>Member · witamy</Eyebrow>
      <Heading>{firstName ? `Witamy w klubie, ${firstName}.` : "Witamy w klubie."}</Heading>
      <Paragraph>
        Członkostwo Member jest aktywne.
        {founding ? " Jesteś członkiem założycielem – rabat 40% obowiązuje przez cały czas trwania abonamentu." : ""}
      </Paragraph>
      <BulletList
        items={[
          "Minimum 2 okazje miesięcznie, każda z pełnym memo",
          "Pierwszeństwo przed rynkiem",
          "Analizy mieszkań bez limitu, odpowiedź w 24 h",
          "Zamknięta grupa członków i kolacja inwestycyjna co kwartał",
          "Sieć partnerów ze zniżkami",
        ]}
      />
      <CtaButton href={panelUrl}>Przejdź do panelu</CtaButton>
      <Divider />
      <Paragraph>
        Gwarancja 90 dni: jeśli w tym czasie nie pokażemy Ci wartościowej okazji, zwrócimy pieniądze.
        Wystarczy odpowiedzieć na tę wiadomość.
      </Paragraph>
    </BrandLayout>
  );
}

WelcomeMember.PreviewProps = { firstName: "Anna", panelUrl: "https://example.com/panel", founding: true } satisfies WelcomeMemberProps;
