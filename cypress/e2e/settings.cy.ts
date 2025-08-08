import {
  categoryOptions,
  inputTransactionDate,
  currencyOptions,
  localizeNum,
} from '../support/utils';

describe('The Settings page', () => {
  beforeEach(() => {
    cy.visit('/settings');
    cy.findByTestId('loader-overlay').should('not.be.visible');
  });

  it('successfully loads settings page with main title', () => {
    cy.contains('h1', 'Settings');
  });

  it('user can create, edit and delete custom currency', () => {
    cy.findByRole('button', { name: /add currency/i }).click();
    cy.findByLabelText('Name').type('Czech koruna');
    cy.findByLabelText('Code').type('CZK');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findAllByTestId('currency-CZK').contains('Czech koruna (CZK)');

    cy.findAllByTestId('currency-CZK')
      .findByRole('button', { name: /edit currency/i })
      .click();
    cy.skipSelectException();
    cy.findByRole('combobox', { name: /type/i }).click();
    cy.findByRole('option', { name: /Crypto/i }).click();
    cy.findByLabelText('Name').type('{selectAll}Ethereum');
    cy.findByLabelText('Code').type('{selectAll}ETH');
    cy.findByLabelText('Decimals').type('{selectAll}5');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findAllByTestId('currency-ETH').contains('Ethereum (ETH)');

    cy.findAllByTestId('currency-ETH')
      .findByRole('button', { name: /delete currency/i })
      .click();
    cy.findByRole('button', { name: /yes, delete currency/i }).click();
    cy.findAllByTestId('currency-ETH').should('not.exist');
  });

  it('user cannot create duplicated currency', () => {
    cy.findByRole('button', { name: /add currency/i }).click();
    cy.findByLabelText('Name').type('Czech koruna');
    cy.findByLabelText('Code').type('CZK');
    cy.findByRole('button', { name: /save/i }).click();

    cy.findByRole('button', { name: /add currency/i }).click();
    cy.findByLabelText('Name').type('Czech koruna');
    cy.findByLabelText('Code').type('CZK');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText(/must be unique/i);
  });

  it('user can set custom exchange rate that is used as a default', () => {
    cy.findByTestId('currency-UAH').within(() => {
      cy.findByRole('button', {
        name: /Set custom exchange rate/i,
      }).click();
      cy.findByLabelText('My exchange rate').type('40');
    });

    cy.findByRole('link', { name: /Back to dashboard/i }).click();

    const walletName = 'uah wallet';
    cy.createWallet({ name: walletName, currency: currencyOptions.uah });
    cy.createTransaction({
      amount: 80,
      date: inputTransactionDate(),
      category: categoryOptions.income.salary,
      type: 'income',
      wallet: walletName,
    });
    cy.getBalanceText(localizeNum(2)); // $4
    cy.getIncomeText(localizeNum(2));
  });
});
