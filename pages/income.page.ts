import { DecisionPage } from "./decision.page";
import { type Page, type Locator } from "@playwright/test";

export class IncomePage {
  readonly page: Page;
  readonly monthlyIncomeInput: Locator;
  readonly getDecisionButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.monthlyIncomeInput = page.getByTestId("income-page-input");
    this.getDecisionButton = page.getByTestId("income-page-submit-button");
    this.backButton = page.getByTestId("income-page-back-button");
  }

  async setMonthlyIncome(amount: string) {
    await this.monthlyIncomeInput.fill(amount);
  }

  async getDecision() {
    await this.getDecisionButton.click();
    return new DecisionPage(this.page);
  }

  async goBack() {
    await this.backButton.click();
  }
}
