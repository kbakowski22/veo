import { BrandLayout, BulletList, CtaButton, Divider, Eyebrow, Heading, Paragraph } from "./BrandLayout";

export type WelcomeCircleProps = { firstName?: string | null; reportUrl: string; checkUrl?: string };

export default function WelcomeCircle({ firstName, reportUrl, checkUrl }: WelcomeCircleProps) {
  return (
    <BrandLayout preview="Witaj w Res Privata. Najnowszy raport rynku czeka w panelu.">
      <Eyebrow>Circle · witamy</Eyebrow>
      <Heading>{firstName ? `Dzień dobry, ${firstName}.` : "Dzień dobry."}</Heading>
      <Paragraph>
        Twoje konto Circle jest aktywne. Od dziś raz w miesiącu, do 5. dnia, dostajesz raport rynku
        sześciu największych miast: ceny za m², stawki najmu i zwrot.
      </Paragraph>
      <CtaButton href={reportUrl}>Otwórz najnowszy raport</CtaButton>
      <Divider />
      <Paragraph>W Circle masz także:</Paragraph>
      <BulletList
        items={[
          "Kalkulator opłacalności bez limitu",
          "Jedną bezpłatną analizę mieszkania w 24 godziny",
          "Webinar co kwartał",
          "Podgląd okazji dostępnych dla członków",
        ]}
      />
      {checkUrl && (
      <Paragraph>
        Oglądasz konkretne mieszkanie? Sprawdź, do jakiej ceny zakup ma sens:{" "}
        <a href={checkUrl} style={{ color: "#1F3D2E" }}>
          Prześwietl ogłoszenie
        </a>
        .
      </Paragraph>
      )}
    </BrandLayout>
  );
}

WelcomeCircle.PreviewProps = {
  firstName: "Anna",
  reportUrl: "https://example.com/panel/raporty",
  checkUrl: "https://example.com/przeswietl",
} satisfies WelcomeCircleProps;
