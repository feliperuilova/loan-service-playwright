import { LoanCalculatorPage } from "../pages/loan-calculator.page";
import { LoginPopupPage } from "../pages/login-popup.page";
import { test, expect, type Locator, type Route } from "@playwright/test";

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

test("complete loan application flow > positive case", async ({ page }) => {
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

test("default state > calculate with mocked backend > monthly payment shown", async ({
  page,
}) => {
  // mock backend response before navigation
  await page.route(
    "**/api/loan-calc?amount=500&period=12",
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ paymentAmountMonthly: 34.56 }),
      });
    },
  );

  const loanCalculator = new LoanCalculatorPage(page);
  await loanCalculator.goto();

  await page.getByTestId("id-small-loan-calculator-field-calculate").click();

  // mocked value is displayed
  await expect(
    page.getByTestId("ib-small-loan-calculator-field-monthlyPayment"),
  ).toContainText("34.56");
});

test("calculation fails with invalid amount mocked backend > error is visible", async ({
  page,
}) => {
  // mock #1 backend response before navigation
  await page.route(
    "**/api/loan-calc?amount=499&period=12",
    async (route: Route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        //body: JSON.stringify({ paymentAmountMonthly: 34.56 }),
      });
    },
  );

  const loanCalculator = new LoanCalculatorPage(page);
  await loanCalculator.goto();
  await page.getByTestId("id-small-loan-calculator-field-amount").fill("499");

  await page.getByTestId("id-small-loan-calculator-field-calculate").click();

  // mocked value is displayed
  await expect(
    page.getByTestId("id-small-loan-calculator-field-error"),
  ).toBeVisible();
});

test("default state > change amount to 1k > calculate with mocked backend > monthly payment shown", async ({
  page,
}) => {
  // mock #1 backend response before navigation
  await page.route(
    "**/api/loan-calc?amount=500&period=12",
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ paymentAmountMonthly: 34.56 }),
      });
    },
  );

  // mock #2 backend response before navigation
  await page.route(
    "**/api/loan-calc?amount=1000&period=12",
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ paymentAmountMonthly: 65.78 }),
      });
    },
  );

  const loanCalculator = new LoanCalculatorPage(page);
  await loanCalculator.goto();
  // default calculation
  await page.getByTestId("id-small-loan-calculator-field-calculate").click();
  await expect(
    page.getByTestId("ib-small-loan-calculator-field-monthlyPayment"),
  ).toContainText("34.56");

  // change amount

  await page.getByTestId("id-small-loan-calculator-field-amount").fill("1000");
  await page.getByTestId("id-small-loan-calculator-field-calculate").click();
  await expect(
    page.getByTestId("ib-small-loan-calculator-field-monthlyPayment"),
  ).toContainText("65.78");
});
test("complete loan application flow > mock positive case", async ({
  page,
}) => {
  const loanCalculator = new LoanCalculatorPage(page);
  const loginPopup = new LoginPopupPage(page);

  await page.route("**/api/decisions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "f4a49f11-1983-42e9-bcc0-d1a39e3329d0",
        approved: true,
        reason: "approved",
        createdAt: "2026-11-15T17:51:18.010Z",
      }),
    });
  });

  await loanCalculator.goto();
  await loanCalculator.calculate();
  await loanCalculator.apply();

  const loanDetails = await loginPopup.loginWithSmartId("39001010001");
  const income = await loanDetails.continue();

  await income.setMonthlyIncome("500");

  const decision = await income.getDecision();

  await expect(decision.title).toHaveText("Loan approved!");
});

test("move amount slider to the middle > amount greater than default", async ({
  page,
}) => {
  const loanCalculator = new LoanCalculatorPage(page);
  await loanCalculator.goto();

  const amountInput: Locator = page.getByTestId(
    "id-small-loan-calculator-field-amount",
  );
  const amountSlider: Locator = page.getByTestId(
    "id-small-loan-calculator-field-amount-slider",
  );

  // default state
  const defaultAmount: string = await amountInput.inputValue();
  expect(defaultAmount).toEqual("500");

  // slider dimensions
  const box = await amountSlider.boundingBox();
  if (!box) throw new Error("Amount slider is not visible");

  // let's click in the middle of the slider
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x, box.y + box.height / 2);
  await page.mouse.up();

  await page.pause();
});

test("complete loan application flow > mock negative case", async ({
  page,
}) => {
  const loanCalculator = new LoanCalculatorPage(page);
  const loginPopup = new LoginPopupPage(page);

  await page.route("**/api/decisions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "f4a49f11-1983-42e9-bcc0-d1a39e3329d0",
        approved: false,
        reason: "declined",
        createdAt: "2026-11-15T17:51:18.010Z",
      }),
    });
  });

  await loanCalculator.goto();
  await loanCalculator.calculate();
  await loanCalculator.apply();

  const loanDetails = await loginPopup.loginWithSmartId("39001010001");
  const income = await loanDetails.continue();

  await income.setMonthlyIncome("500");

  const decision = await income.getDecision();

  await expect(decision.title).toHaveText("Loan declined");
});
