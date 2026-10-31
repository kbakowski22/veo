/**
 * Treści zgód. Każda zgoda zapisywana jest w bazie razem z identyfikatorem
 * wersji i pełną treścią (etap 2, tabela `consents`), więc po zmianie treści
 * należy podbić wersję.
 */
export type ConsentDefinition = {
  type: string;
  version: string;
  text: string;
};

const ADMIN = "Res Privata [DO UZUPEŁNIENIA: pełna nazwa firmy, adres, NIP]";

export const CONSENTS = {
  joinRodo: {
    type: "rodo_join",
    version: "2026-10-v1",
    text:
      `Wyrażam zgodę na przetwarzanie moich danych osobowych (imię i nazwisko, adres e-mail) przez ${ADMIN} ` +
      "w celu obsługi zgłoszenia do klubu oraz kontaktu w sprawie członkostwa. " +
      "Zapoznałem się z Polityką prywatności. Zgodę mogę wycofać w dowolnym momencie.",
  },
  analysisRodo: {
    type: "rodo_analysis",
    version: "2026-10-v1",
    text:
      `Wyrażam zgodę na przetwarzanie moich danych osobowych (adres e-mail) przez ${ADMIN} ` +
      "w celu przygotowania i przesłania analizy mieszkania. " +
      "Zapoznałem się z Polityką prywatności. Zgodę mogę wycofać w dowolnym momencie.",
  },
} satisfies Record<string, ConsentDefinition>;
