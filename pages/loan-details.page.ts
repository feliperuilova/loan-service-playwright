import { IncomePage } from "./income.page";
import { type Page, type Locator } from "@playwright/test";

export class LoanDetailsPage {
  readonly page: Page;
  readonly amount: Locator;
  readonly monthlyPayment: Locator;
  readonly period: Locator;
  readonly fullNameInput: Locator;
  readonly communicationLanguage: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.amount = page.getByTestId("final-page-amount");
    this.monthlyPayment = page.getByTestId("final-page-monthly-payment");
    this.period = page.getByTestId("final-page-period");
    this.fullNameInput = page.getByTestId("final-page-full-name");
    this.communicationLanguage = page.getByTestId(
      "final-page-communication-language",
    );
    this.continueButton = page.getByTestId("final-page-continue-button");
    this.backButton = page.getByTestId("final-page-back-button");
  }

  async continue() {
    await this.continueButton.click();
    return new IncomePage(this.page);
  }

  async goBack() {
    await this.backButton.click();
  }
}
