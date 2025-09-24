import {
  categoryOptions,
  currencyOptions,
  inputTransactionDate,
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
    cy.findByRole('dialog', { name: 'Add new currency' }).within(() => {
      cy.findByLabelText('Name').type('Czech koruna');
      cy.findByLabelText('Code').type('CZK');
      cy.findByRole('button', { name: /save/i }).click();
    });
    cy.findAllByTestId('currency-CZK').contains('Czech koruna (CZK)');

    cy.findAllByTestId('currency-CZK')
      .findByRole('button', { name: /edit currency/i })
      .click();
    cy.findByRole('dialog', { name: 'Edit currency' }).within(() => {
      cy.skipSelectException();
      cy.findByRole('combobox', { name: /type/i }).click();
      // escape within() to find options
      cy.document()
        .findByRole('option', { name: /Crypto/i })
        .click();
      cy.findByLabelText('Name').type('{selectAll}Ethereum');
      cy.findByLabelText('Code').type('{selectAll}ETH');
      cy.findByLabelText('Decimals').type('{selectAll}5');
      cy.findByRole('button', { name: /save/i }).click();
    });
    cy.findAllByTestId('currency-ETH').contains('Ethereum (ETH)');

    cy.findAllByTestId('currency-ETH')
      .findByRole('button', { name: /delete currency/i })
      .click();
    cy.findByRole('button', { name: /yes, delete currency/i }).click();
    cy.findAllByTestId('currency-ETH').should('not.exist');
  });

  it('user cannot create duplicated currency', () => {
    cy.findByRole('button', { name: /add currency/i }).click();
    cy.findByRole('dialog', { name: 'Add new currency' }).within(() => {
      cy.findByLabelText('Name').type('Czech koruna');
      cy.findByLabelText('Code').type('CZK');
      cy.findByRole('button', { name: /save/i }).click();
    });

    cy.findByRole('button', { name: /add currency/i }).click();
    cy.findByRole('dialog', { name: 'Add new currency' }).within(() => {
      cy.findByLabelText('Name').type('Czech koruna');
      cy.findByLabelText('Code').type('CZK');
      cy.findByRole('button', { name: /save/i }).click();
      cy.findByText(/must be unique/i);
    });
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

  it('user can update profile name', () => {
    cy.findByLabelText('Name').type('{selectAll}User #101');
    cy.findByRole('button', { name: /Update user details/i }).click();
    cy.findByDisplayValue('User #101');
    cy.findByRole('button', { name: /switch or create user/i }).contains(
      'User #101'
    );
  });

  it('user can delete profile', () => {
    cy.findByRole('button', { name: /switch or create user/i }).click();
    cy.findByRole('button', { name: /add new user/i }).click();
    cy.findByRole('dialog', { name: 'Create new user' }).within(() => {
      cy.findByLabelText('Name').type('User #2');
      cy.findByRole('button', { name: /save/i }).click();
    });
    cy.findByRole('menuitemradio', { name: /User #1/i }).click();
    cy.findByRole('button', { name: /delete user/i }).click();
    cy.findByRole('alertdialog', { name: 'Are you absolutely sure?' }).within(
      () => {
        cy.findByRole('button', { name: 'Yes, delete user' }).click();
      }
    );
    cy.findByRole('button', { name: /switch or create user/i }).contains(
      'User #2'
    );
  });
});
