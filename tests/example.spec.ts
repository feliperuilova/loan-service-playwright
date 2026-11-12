import { test, expect } from '@playwright/test';

const URL = 'https://loan-decision.tl-academy.ee/small-loan'

test('app in default state', async ({ page }) => {
  await page.goto(URL);

  await expect(page.getByTestId('id-small-loan-calculator-field-calculate')).toBeEnabled()
  await expect(page.getByTestId('id-small-loan-calculator-field-apply')).toBeDisabled()

  await page.getByTestId('id-image-element-button-image-1').scrollIntoViewIfNeeded()
  await page.getByTestId('id-image-element-button-image-1').click()

  await expect(page.getByTestId('id-small-loan-calculator-field-calculate')).toBeInViewport()

});

test('calculate > apply button enabled > request happened', async ({ page }) => {
  await page.goto(URL);

  //before action we have to init request listener
  const requestPromise = page.waitForRequest('**/api/loan-calc?amount=500&period=12')
  await (page.getByTestId('id-small-loan-calculator-field-calculate')).click()
  //straight after action
  await requestPromise;
  // validate button is enabled
  await expect(page.getByTestId('id-small-loan-calculator-field-apply')).toBeEnabled()

  // change amount from default t0 1000
  await page.getByTestId('id-small-loan-calculator-field-amount').fill('1000')
  const requestOneKPromise = page.waitForRequest('**/api/loan-calc?amount=1000&period=12')
  await (page.getByTestId('id-small-loan-calculator-field-calculate')).click()
  //straight after action
  await requestOneKPromise;

});

test('login page default state', async ({ page }) => {
  await page.goto(URL);

  await (page.getByTestId('id-small-loan-calculator-field-calculate')).click()
  await (page.getByTestId('id-small-loan-calculator-field-apply')).click()
  //check user and password fields visible and 'continue' CTA disabled
  await expect(page.getByTestId('login-popup-username-input')).toBeVisible()
  await expect(page.getByTestId('login-popup-password-input')).toBeVisible()
  await expect(page.getByTestId('login-popup-continue-button')).toBeDisabled()

  //click smart id and check smart id field
  await (page.getByTestId('login-popup-tab-smart-id')).click()
  await expect(page.getByTestId('login-popup-personal-code-input')).toBeVisible()
  await expect(page.getByTestId('login-popup-continue-button')).toBeDisabled()






});
