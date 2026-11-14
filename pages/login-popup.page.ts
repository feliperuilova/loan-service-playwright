import { LoanDetailsPage } from "./loan-details.page";
import { type Page, type Locator } from "@playwright/test";

export class LoginPopupPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly smartIdTab: Locator;
  readonly personalCodeInput: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId("login-popup-username-input");
    this.passwordInput = page.getByTestId("login-popup-password-input");
    this.continueButton = page.getByTestId("login-popup-continue-button");
    this.smartIdTab = page.getByTestId("login-popup-tab-smart-id");
    this.personalCodeInput = page.getByTestId(
      "login-popup-personal-code-input",
    );
  }

  async selectSmartId() {
    await this.smartIdTab.click();
  }
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.continueButton.click();

    return new LoanDetailsPage(this.page);
  }
}
