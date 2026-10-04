import { expect, test, type Page } from "@playwright/test";

// 人間と同じようにブラウザで遊んで確かめる
test("出題されたコマンドを打つとスコアが1になる", async ({ page }) => {
  await page.goto("/");
  const word = await page.getByTestId("prompt").textContent();
  await page.getByTestId("answer").fill(word!);
  await page.getByTestId("answer").press("Enter");
  await expect(page.getByTestId("score")).toHaveText("1");
  await page.screenshot({ path: "e2e-screenshot.png" });
});

async function answerCurrent(page: Page) {
  const word = await page.getByTestId("prompt").textContent();
  await page.getByTestId("answer").fill(word!);
  await page.getByTestId("answer").press("Enter");
}

test("2問連続で正解するとコンボ2・スコア3になり、間違えるとコンボが0に戻る", async ({ page }) => {
  await page.goto("/");
  await answerCurrent(page);
  await answerCurrent(page);
  await expect(page.getByTestId("combo")).toHaveText("2");
  await expect(page.getByTestId("score")).toHaveText("3");
  await page.getByTestId("answer").fill("zzz-wrong");
  await page.getByTestId("answer").press("Enter");
  await expect(page.getByTestId("combo")).toHaveText("0");
});

test("60秒たつと結果が出て入力できなくなり、もう一度で再開できる", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await answerCurrent(page);
  await page.clock.runFor(61_000);
  await expect(page.getByTestId("result")).toBeVisible();
  await expect(page.getByTestId("final-score")).toHaveText("1");
  await expect(page.getByTestId("answer")).toBeDisabled();
  await page.getByTestId("retry").click();
  await expect(page.getByTestId("result")).toBeHidden();
  await expect(page.getByTestId("answer")).toBeEnabled();
  await expect(page.getByTestId("score")).toHaveText("0");
});
