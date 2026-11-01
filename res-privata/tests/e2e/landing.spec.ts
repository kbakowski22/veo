import { expect, test } from "@playwright/test";

test.describe("Landing", () => {
  test("ma wszystkie sekcje w ustalonej kolejności", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Inwestuj jak fundusz.");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Nie jak przypadkowy kupujący.");
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(["kim-jestesmy", "kalkulator", "czlonkostwo", "dolacz"]);
    await expect(page.getByText("Najczęściej wybierany")).toBeVisible();
  });

  test("kalkulator przelicza zwrot po zmianie suwaka", async ({ page }) => {
    await page.goto("/#kalkulator");
    const rent = page.getByLabel("Czynsz najmu");
    const before = await page.locator("#kalkulator").getByText(/^\d+,\d\s?%$/).first().textContent();
    await rent.focus();
    for (let i = 0; i < 10; i++) await rent.press("ArrowRight");
    const after = await page.locator("#kalkulator").getByText(/^\d+,\d\s?%$/).first().textContent();
    expect(after).not.toBe(before);
  });

  test("brak poziomego przewijania strony", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("formularz Dołącz wymaga zgody RODO", async ({ page }) => {
    await page.goto("/#dolacz");
    await page.getByRole("textbox", { name: "Imię i nazwisko" }).fill("Jan Kowalski");
    await page.getByRole("textbox", { name: "E-mail" }).fill("jan@example.pl");
    await page.getByRole("button", { name: "Dołącz do klubu" }).click();
    await expect(page.getByText("Ta zgoda jest wymagana.")).toBeVisible();
  });
});

test.describe("Menu mobilne", () => {
  test("rozwija się i zwija", async ({ page, isMobile }) => {
    test.skip(!isMobile, "tylko na telefonie");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Otwórz menu" });
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Menu mobilne" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Menu mobilne" })).toBeHidden();
  });
});

test.describe("Ochrona panelu", () => {
  test("niezalogowany użytkownik trafia z /panel na logowanie", async ({ page }) => {
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/logowanie$/);
    await expect(page.getByRole("heading", { name: "Zaloguj się" })).toBeVisible();
  });

  test("wygasły link pokazuje komunikat", async ({ page }) => {
    await page.goto("/logowanie?blad=link");
    await expect(page.getByRole("alert").filter({ hasText: "Link logowania wygasł" })).toBeVisible();
  });
});
