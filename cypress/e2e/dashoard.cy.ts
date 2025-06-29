import type { Transaction } from '../support/commands';

const localizeNum = (num: number, options?: Intl.NumberFormatOptions) =>
  num.toLocaleString('default', {
    style: 'currency',
    currency: 'USD',
    ...options,
  });

describe('The Dashboard page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('successfully loads home page with main title', () => {
    cy.get('h1').should('contain', 'Welcome back, buddy!');
  });

  it('creates income and expense transactions with correct total numbers', () => {
    const incomeTransaction: Transaction = {
      type: 'income',
      amount: 1000,
      date: '1/2/2025 15:00',
      description: 'Transaction #1',
    };
    const expenseTransaction: Transaction = {
      type: 'expense',
      amount: 500,
      date: '1/3/2025 15:00',
      description: 'Transaction #2',
    };

    cy.createTransaction(incomeTransaction);

    cy.findAllByTestId('0')
      .should('include.text', localizeNum(incomeTransaction.amount))
      .and('include.text', incomeTransaction.date.split(' ')[0])
      .and('include.text', 'income');

    cy.getBalanceText(localizeNum(incomeTransaction.amount));
    cy.getIncomeText(localizeNum(incomeTransaction.amount));
    cy.getExpenseText(localizeNum(-0));

    cy.createTransaction(expenseTransaction);

    cy.findAllByTestId('1')
      .should('include.text', 'expense')
      .and('include.text', localizeNum(-expenseTransaction.amount));

    cy.getBalanceText(
      localizeNum(incomeTransaction.amount - expenseTransaction.amount)
    );
    cy.getIncomeText(localizeNum(incomeTransaction.amount));
    cy.getExpenseText(localizeNum(-expenseTransaction.amount));
  });

  it('edits transaction', () => {
    const transaction: Transaction = {
      type: 'income',
      amount: 1000,
      date: '01/02/2025 15:00',
      description: 'Transaction #1',
    };
    const editedTransaction: Transaction = {
      type: 'expense',
      amount: 400,
      date: '10/10/2024 11:30',
      description: 'Edited Transaction #1',
    };

    cy.createTransaction(transaction);
    cy.findByTestId('0')
      .findByRole('button', { name: /more options/i })
      .click();
    cy.findByRole('menuitem', { name: /edit/i }).click();

    cy.findByRole('combobox', { name: /transaction type/i })
      .should('have.text', 'Income')
      .click();
    cy.findByRole('option', {
      name: new RegExp(editedTransaction.type, 'i'),
    }).click();
    cy.findByLabelText('Amount')
      .should(
        'have.value',
        localizeNum(transaction.amount, { maximumFractionDigits: 0 })
      )
      .type(`{selectAll}${editedTransaction.amount.toString()}`);
    cy.findByLabelText('Date')
      .should('have.value', transaction.date)
      .type(`{selectAll}${editedTransaction.date}`);
    cy.findByLabelText('Description')
      .should('have.value', transaction.description)
      .type(`{selectAll}${editedTransaction.description}`);
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByRole('button', { name: /close dialog/i }).click();

    cy.findByTestId('0')
      .should('include.text', 'expense')
      .and('include.text', localizeNum(-editedTransaction.amount));

    cy.getBalanceText(localizeNum(0 - editedTransaction.amount));
    cy.getIncomeText(localizeNum(0));
    cy.getExpenseText(localizeNum(-editedTransaction.amount));
  });

  it('deletes transaction', () => {
    const transaction: Transaction = {
      type: 'income',
      amount: 1000,
      date: '01/02/2025 15:00',
      description: 'Transaction #1',
    };
    cy.createTransaction(transaction);
    cy.findByTestId('0')
      .findByRole('button', { name: /more options/i })
      .click();
    cy.findByRole('menuitem', { name: /delete/i }).click();
    cy.findByRole('button', { name: /yes, delete transaction/i }).click();
    cy.findByTestId('0').should('not.exist');
    cy.getBalanceText(localizeNum(0));
    cy.getIncomeText(localizeNum(0));
    cy.getExpenseText(localizeNum(-0));
  });
});
