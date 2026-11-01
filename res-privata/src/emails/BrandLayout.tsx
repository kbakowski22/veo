import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export const brand = {
  paper: "#F5F3EF",
  card: "#FFFFFF",
  ink: "#121212",
  ink2: "#4A4741",
  ink3: "#6B6760",
  line: "#D6D1C8",
  accent: "#1F3D2E",
  font: "Geist, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'Geist Mono', 'SFMono-Regular', Menlo, monospace",
};

export const DISCLAIMER =
  "Materiał informacyjny Res Privata. Nie stanowi rekomendacji inwestycyjnej ani oferty w rozumieniu przepisów prawa.";

export function BrandLayout({
  preview,
  children,
  unsubscribeUrl,
}: {
  preview: string;
  children: ReactNode;
  /** Wymagany w mailach marketingowych (nowa okazja, przypomnienia). */
  unsubscribeUrl?: string;
}) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: brand.paper, fontFamily: brand.font, margin: 0, padding: "32px 0" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "0 16px" }}>
          <Section style={{ padding: "8px 0 24px" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ width: 18, height: 18, backgroundColor: brand.accent }} />
                  <td
                    style={{
                      paddingLeft: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.24em",
                      color: brand.ink,
                    }}
                  >
                    RES PRIVATA
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
          <Section
            style={{
              backgroundColor: brand.card,
              borderRadius: 20,
              border: `1px solid ${brand.line}`,
              padding: "36px 32px",
            }}
          >
            {children}
          </Section>
          <Text style={{ fontSize: 12, lineHeight: "18px", color: brand.ink3, margin: "24px 4px 0" }}>
            {DISCLAIMER}
          </Text>
          <Text style={{ fontSize: 12, lineHeight: "18px", color: brand.ink3, margin: "8px 4px 0" }}>
            Res Privata · Polska
            {unsubscribeUrl && (
              <>
                {" · "}
                <Link href={unsubscribeUrl} style={{ color: brand.ink3, textDecoration: "underline" }}>
                  Wypisz się z tych wiadomości
                </Link>
              </>
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: brand.mono,
        fontSize: 12,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: brand.accent,
        margin: "0 0 12px",
      }}
    >
      {children}
    </Text>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 28,
        lineHeight: "32px",
        fontWeight: 500,
        letterSpacing: "-0.03em",
        color: brand.ink,
        margin: "0 0 16px",
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={{ fontSize: 15, lineHeight: "24px", color: brand.ink2, margin: "0 0 16px" }}>{children}</Text>;
}

export function CtaButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: brand.accent,
        color: brand.paper,
        borderRadius: 999,
        padding: "14px 26px",
        fontSize: 15,
        fontWeight: 500,
        textDecoration: "none",
        display: "inline-block",
        margin: "8px 0 8px",
      }}
    >
      {children}
    </Button>
  );
}

export function Divider() {
  return <Hr style={{ borderColor: brand.line, margin: "24px 0" }} />;
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 16px" }}>
      <tbody>
        {items.map((item) => (
          <tr key={item}>
            <td style={{ verticalAlign: "top", padding: "4px 10px 4px 0", color: brand.accent, fontSize: 15 }}>–</td>
            <td style={{ padding: "4px 0", fontSize: 15, lineHeight: "22px", color: brand.ink }}>{item}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
