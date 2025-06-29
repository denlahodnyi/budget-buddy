/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import '@testing-library/cypress/add-commands';

export interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description?: string;
}

Cypress.Commands.add('createTransaction', (transaction: Transaction) => {
  Cypress.on('uncaught:exception', (error) => {
    const errors = [
      "Cannot read properties of null (reading 'focus')",
      'ResizeObserver loop completed with undelivered notifications',
    ];
    if (errors.some((err) => error.message.includes(err))) {
      return false;
    }
  });

  cy.findByRole('button', { name: /add new/i }).click();
  cy.findByRole('combobox', { name: /transaction type/i }).click();
  cy.findByRole('option', { name: new RegExp(transaction.type, 'i') }).click();
  cy.findByLabelText('Amount').type(transaction.amount.toString());
  cy.findByLabelText('Date').type(`{selectAll}${transaction.date}`);
  cy.findByLabelText('Description').then(($el) => {
    if (transaction.description) cy.wrap($el).type(transaction.description);
  });
  cy.findByRole('button', { name: /save/i }).click();
  cy.findByRole('button', { name: /close dialog/i }).click();
});

Cypress.Commands.add('getBalanceText', (balanceText: string) => {
  return cy
    .findByRole('heading', { name: /your balance/i })
    .closest('section')
    .findByText(balanceText);
});

Cypress.Commands.add('getIncomeText', (incomeText: string) => {
  return cy
    .findByRole('heading', { name: /income/i })
    .closest('section')
    .findByText(incomeText);
});

Cypress.Commands.add('getExpenseText', (expenseText: string) => {
  return cy
    .findByRole('heading', { name: /expense/i })
    .closest('section')
    .findByText(expenseText);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      createTransaction(transaction: Transaction): Chainable<void>;
      getBalanceText(balanceText: string): Chainable<JQuery<HTMLElement>>;
      getIncomeText(incomeText: string): Chainable<JQuery<HTMLElement>>;
      getExpenseText(expenseText: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
