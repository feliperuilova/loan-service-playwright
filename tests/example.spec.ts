import { LoanCalculatorPage } from "../pages/loan-calculator.page";
import { LoginPopupPage } from "../pages/login-popup.page";

import { test, expect } from "@playwright/test";

test("app in default state", async ({ page }) => {
  const loanCalculator = new LoanCalculatorPage(page);

  await loanCalculator.goto();

  await expect(loanCalculator.calculateButton).toBeEnabled();
  await expect(loanCalculator.applyButton).toBeDisabled();

  await loanCalculator.scrollToImageAndClick();

  await expect(loanCalculator.calculateButton).toBeInViewport();
});

test("calculate > apply button enabled > request happened", async ({
  page,
}) => {
  const loanCalculator = new LoanCalculatorPage(page);

  await loanCalculator.goto();

  const requestPromise = page.waitForRequest(
    "**/api/loan-calc?amount=500&period=12",
  );
  await loanCalculator.calculate();
  await requestPromise;

  await expect(loanCalculator.applyButton).toBeEnabled();

  await loanCalculator.setAmount("1000");

  const requestOneKPromise = page.waitForRequest(
    "**/api/loan-calc?amount=1000&period=12",
  );
  await loanCalculator.calculate();
  await requestOneKPromise;
});

test("login page default state", async ({ page }) => {
  const loanCalculator = new LoanCalculatorPage(page);
  const loginPopup = new LoginPopupPage(page);

  await loanCalculator.goto();
  await loanCalculator.calculate();
  await loanCalculator.apply();

  await expect(loginPopup.usernameInput).toBeVisible();
  await expect(loginPopup.passwordInput).toBeVisible();
  await expect(loginPopup.continueButton).toBeDisabled();

  await loginPopup.selectSmartId();

  await expect(loginPopup.personalCodeInput).toBeVisible();
  await expect(loginPopup.continueButton).toBeDisabled();
});

test("complete loan application flow", async ({ page }) => {
  const loanCalculator = new LoanCalculatorPage(page);
  const loginPopup = new LoginPopupPage(page);

  await loanCalculator.goto();
  await loanCalculator.calculate();
  await loanCalculator.apply();

  const loanDetails = await loginPopup.login("anna", "Tallinn1");
  const income = await loanDetails.continue();

  await income.setMonthlyIncome("2000");
  const decision = await income.getDecision();

  await expect(decision.title).toHaveText("Loan approved!");
});
