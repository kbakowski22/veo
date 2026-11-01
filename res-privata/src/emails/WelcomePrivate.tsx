import { BrandLayout, BulletList, CtaButton, Eyebrow, Heading, Paragraph } from "./BrandLayout";

export type WelcomePrivateProps = { firstName?: string | null; panelUrl: string; advisorName?: string | null };

export default function WelcomePrivate({ firstName, panelUrl, advisorName }: WelcomePrivateProps) {
  return (
    <BrandLayout preview="Witamy w Res Privata Private.">
      <Eyebrow>Private · witamy</Eyebrow>
      <Heading>{firstName ? `Dzień dobry, ${firstName}.` : "Dzień dobry."}</Heading>
      <Paragraph>
        Dziękujemy za rozmowę i zaufanie. Twoje członkostwo Private jest aktywne
        {advisorName ? `, a Twoim osobistym opiekunem jest ${advisorName}` : ""}. Odpowiadamy tego samego dnia.
      </Paragraph>
      <Paragraph>Najbliższe kroki:</Paragraph>
      <BulletList
        items={[
          "Spisujemy Twoją strategię: budżet, cel, horyzont i kryteria",
          "Szukamy okazji szytych na miarę, także spoza portali",
          "Każdą z nich dostajesz z memo, zanim zdecydujesz",
          "W zakładce „Mój portfel” zobaczysz zakupy, remonty i dokumenty",
        ]}
      />
      <CtaButton href={panelUrl}>Otwórz panel</CtaButton>
    </BrandLayout>
  );
}

WelcomePrivate.PreviewProps = { firstName: "Anna", panelUrl: "https://example.com/panel", advisorName: "Jan" } satisfies WelcomePrivateProps;
