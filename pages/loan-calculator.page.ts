import { type Page, type Locator } from "@playwright/test";

export class LoanCalculatorPage {
  readonly page: Page;
  readonly calculateButton: Locator;
  readonly applyButton: Locator;
  readonly amountInput: Locator;
  readonly imageButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.calculateButton = page.getByTestId(
      "id-small-loan-calculator-field-calculate",
    );
    this.applyButton = page.getByTestId("id-small-loan-calculator-field-apply");
    this.amountInput = page.getByTestId(
      "id-small-loan-calculator-field-amount",
    );
    this.imageButton = page.getByTestId("id-image-element-button-image-1");
  }

  async goto() {
    await this.page.goto("https://loan-decision.tl-academy.ee/small-loan");
  }

  async calculate() {
    await this.calculateButton.click();
  }

  async setAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async scrollToImageAndClick() {
    await this.imageButton.scrollIntoViewIfNeeded();
    await this.imageButton.click();
  }
  async apply() {
    await this.applyButton.click();
  }
}
