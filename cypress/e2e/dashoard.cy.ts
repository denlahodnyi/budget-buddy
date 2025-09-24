import { type Transaction, type Wallet } from '../support/commands';
import {
  categoryOptions,
  currencyOptions,
  inputTransactionDate,
  localizeNum,
} from '../support/utils';

describe('The Dashboard page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.findByTestId('loader-overlay').should('not.be.visible');
  });

  it('successfully loads home page with main title', () => {
    cy.get('h1').should('contain', 'Welcome back, buddy!');
  });

  it('user can create, edit and delete a wallet', () => {
    cy.createWallet({ name: 'My uah wallet', currency: currencyOptions.uah });
    cy.findByText('My uah wallet')
      .closest('article')
      .as('uaWalletCard')
      .contains('₴ 0.00');

    cy.get('@uaWalletCard')
      .findByRole('button', { name: /More options/i })
      .click();
    cy.findByRole('menuitem', { name: /^edit$/i }).click();
    cy.findByLabelText('Name').type('{selectAll}My eur wallet');
    cy.findByRole('combobox', { name: /^currency$/i }).type('{selectAll}eur');
    cy.findByRole('option', { name: /\(EUR\) Euro/i }).click();
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText('My eur wallet')
      .closest('article')
      .as('euWalletCard')
      .contains('€0.00');

    cy.get('@euWalletCard')
      .findByRole('button', { name: /More options/i })
      .click();
    cy.findByRole('menuitem', { name: /^delete$/i }).click();
    cy.findByRole('button', { name: /^yes, delete wallet$/i }).click();
    // cy.findByTestId('wallet-1').should('not.exist');
    cy.findByText('My eur wallet').should('not.exist');
  });

  it('user creates income and expense transactions with correct total numbers', () => {
    const uahWallet: Wallet = {
      name: 'My uah wallet',
      currency: currencyOptions.uah,
    };
    const incomeTransaction: Transaction = {
      type: 'income',
      amount: 1000,
      date: inputTransactionDate(2, 1, 2025, 15),
      description: 'Transaction #1',
      category: categoryOptions.income.salary,
      wallet: 'My Wallet',
    };
    const incomeTransaction2: Transaction = {
      type: 'income',
      amount: 100,
      date: inputTransactionDate(2, 1, 2025, 20),
      description: 'Transaction #2',
      category: categoryOptions.income.gift,
      wallet: uahWallet.name,
    };
    const expenseTransaction: Transaction = {
      type: 'expense',
      amount: 500,
      date: inputTransactionDate(3, 1, 2025, 15),
      description: 'Transaction #3',
      category: categoryOptions.expense.travel,
      wallet: 'My Wallet',
    };

    cy.createWallet(uahWallet);

    cy.wait('@getLiveRates').then(({ response }) => {
      const rate = response?.body.quotes['USDUAH'];

      cy.createTransaction(incomeTransaction);
      cy.findAllByTestId('transaction_0')
        .should('include.text', localizeNum(incomeTransaction.amount))
        // date will be in other format (no zeros)
        // .and('include.text', incomeTransaction.date.split(' ')[0])
        .and('include.text', incomeTransaction.category);
      cy.getBalanceText(localizeNum(incomeTransaction.amount));
      cy.getIncomeText(localizeNum(incomeTransaction.amount));
      cy.getExpenseText(localizeNum(-0));
      cy.findByTestId('wallet-0').contains(
        localizeNum(incomeTransaction.amount)
      );

      cy.createTransaction(incomeTransaction2);
      cy.findAllByTestId('transaction_1').contains(
        localizeNum(incomeTransaction2.amount, { symbol: '₴ ' })
      );
      // cy.findAllByTestId('transaction_1').contains(
      //   incomeTransaction2.date.split(' ')[0]
      // );
      cy.findAllByTestId('transaction_1').contains(incomeTransaction2.category);
      cy.getBalanceText(
        localizeNum(incomeTransaction.amount + incomeTransaction2.amount / rate)
      );
      cy.getIncomeText(
        localizeNum(incomeTransaction.amount + incomeTransaction2.amount / rate)
      );
      cy.getExpenseText(localizeNum(-0));
      cy.findByTestId('wallet-1').contains(
        localizeNum(incomeTransaction2.amount, { symbol: '₴ ' })
      );

      cy.createTransaction(expenseTransaction);
      cy.findAllByTestId('transaction_2')
        .should('include.text', expenseTransaction.category)
        .and('include.text', localizeNum(-expenseTransaction.amount));
      cy.getBalanceText(
        localizeNum(
          incomeTransaction.amount +
            incomeTransaction2.amount / rate -
            expenseTransaction.amount
        )
      );
      cy.getIncomeText(
        localizeNum(incomeTransaction.amount + incomeTransaction2.amount / rate)
      );
      cy.getExpenseText(localizeNum(-expenseTransaction.amount));
      cy.findByTestId('wallet-0').contains(
        localizeNum(incomeTransaction.amount - expenseTransaction.amount)
      );
    });
  });

  it('user edits transaction', () => {
    const transaction: Transaction = {
      type: 'income',
      amount: 1000,
      date: inputTransactionDate(2, 1, 2025, 15),
      description: 'Transaction #1',
      category: categoryOptions.income.salary,
      wallet: 'My Wallet',
    };
    const editedTransaction: Transaction = {
      type: 'expense',
      amount: 400,
      date: inputTransactionDate(10, 10, 2024, 11, 30),
      description: 'Edited Transaction #1',
      category: categoryOptions.expense.travel,
      wallet: 'My Wallet',
    };

    cy.createTransaction(transaction);
    cy.findByTestId('transaction_0')
      .findByRole('button', { name: /more options/i })
      .click();
    cy.findByRole('menuitem', { name: /edit/i }).click();

    cy.findByRole('combobox', { name: /transaction type/i })
      .should('have.text', 'Income')
      .click();
    cy.findByRole('option', {
      name: new RegExp(editedTransaction.type, 'i'),
    }).click();
    cy.findByRole('combobox', { name: /category/i })
      .should('not.have.value', transaction.category)
      .type(editedTransaction.category);
    cy.findByRole('option', {
      name: new RegExp(editedTransaction.category, 'i'),
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

    cy.findByTestId('transaction_0')
      .should('include.text', editedTransaction.category)
      .and('include.text', localizeNum(-editedTransaction.amount));

    cy.getBalanceText(localizeNum(0 - editedTransaction.amount));
    cy.getIncomeText(localizeNum(0));
    cy.getExpenseText(localizeNum(-editedTransaction.amount));
  });

  it('user deletes transaction', () => {
    const transaction: Transaction = {
      type: 'income',
      amount: 1000,
      date: inputTransactionDate(1, 2, 2025, 15),
      description: 'Transaction #1',
      category: categoryOptions.income.salary,
      wallet: 'My Wallet',
    };
    cy.createTransaction(transaction);
    cy.findByTestId('transaction_0')
      .findByRole('button', { name: /more options/i })
      .click();
    cy.findByRole('menuitem', { name: /delete/i }).click();
    cy.findByRole('button', { name: /yes, delete transaction/i }).click();
    cy.findByTestId('transaction_0').should('not.exist');
    cy.getBalanceText(localizeNum(0));
    cy.getIncomeText(localizeNum(0));
    cy.getExpenseText(localizeNum(-0));
  });

  it('user can create new income category, edit it (make it as a subcategory) and delete', () => {
    const categoryTestId = 'category_18';
    const categoryName = 'Birthday gift';
    const editedCategoryName = 'Christmas gift';

    cy.findAddTransactionButton().click();
    cy.findByRole('button', { name: /manage categories/i }).click();
    cy.findByRole('button', { name: /add new category/i }).click();
    // create category
    cy.findByRole('dialog')
      .contains('h2', 'Create new category')
      .closest('[role=dialog]')
      .as('categoryDialog');
    cy.get('@categoryDialog')
      .findByRole('textbox', { name: /name/i })
      .type(categoryName);
    cy.get('@categoryDialog')
      .findByRole('radio', { name: /color: red/i })
      .click();
    cy.get('@categoryDialog')
      .findByRole('radio', { name: /gift icon/i })
      .click();
    cy.get('@categoryDialog')
      .findByRole('button', { name: /save category/i })
      .click();
    // find created item
    cy.findByTestId(categoryTestId)
      .as('newCat1')
      .should('contain.text', categoryName);
    cy.get('@newCat1').findByRole('img', { name: /icon: gift/i });
    // edit category
    cy.get('@newCat1').findByRole('button', { name: /edit/i }).click();
    cy.findByRole('dialog')
      .contains('h2', 'Edit category')
      .closest('[role=dialog]')
      .as('editCategoryDialog');
    cy.get('@editCategoryDialog')
      .findByRole('textbox', { name: /name/i })
      .should('have.value', categoryName)
      .type(`{selectAll}${editedCategoryName}`);
    cy.get('@editCategoryDialog')
      .findByRole('radio', { name: /^color: blue$/i })
      .click();
    cy.get('@editCategoryDialog')
      .findByRole('radio', { name: /party icon/i })
      .click();
    cy.get('@editCategoryDialog')
      .findByRole('button', { name: /save changes/i })
      .click();
    // check changes
    cy.get('@newCat1').should('contain.text', editedCategoryName);
    cy.get('@newCat1').findByRole('button', { name: /edit/i }).click();
    // change parent
    cy.findByRole('dialog')
      .contains('h2', 'Edit category')
      .closest('[role=dialog]')
      .as('newParentCategoryDialog');
    cy.get('@newParentCategoryDialog')
      .findByRole('combobox', { name: /parent category/i })
      .type('{selectAll}Other Income');
    cy.findByRole('option', { name: /other income/i }).click();
    cy.get('@newParentCategoryDialog')
      .findByRole('button', { name: /save changes/i })
      .click();
    // check parent
    cy.contains(/Other Income/i)
      .closest('[role=listitem]')
      .findByTestId(categoryTestId)
      .contains(editedCategoryName);
    // delete category
    cy.findByTestId(categoryTestId)
      .findByRole('button', { name: /delete category/i })
      .click();
    cy.findByRole('button', { name: /yes, delete category/i }).click();
    cy.findByTestId(categoryTestId).should('not.exist');
  });

  it('user can create new expense category, edit it (make it as a subcategory) and delete', () => {
    const categoryTestId = 'category_18';
    const categoryName = 'Hobby';
    const editedCategoryName = 'Guitar class';

    cy.findAddTransactionButton().click();
    cy.findByRole('button', { name: /manage categories/i }).click();
    cy.findByRole('tab', { name: /expense/i }).click();
    cy.findByRole('button', { name: /add new category/i }).click();
    // create category
    cy.findByRole('dialog')
      .contains('h2', 'Create new category')
      .closest('[role=dialog]')
      .as('categoryDialog');
    cy.get('@categoryDialog')
      .findByRole('textbox', { name: /name/i })
      .type(categoryName);
    cy.get('@categoryDialog')
      .findByRole('radio', { name: /color: red/i })
      .click();
    cy.get('@categoryDialog')
      .findByRole('radio', { name: /gift icon/i })
      .click();
    cy.get('@categoryDialog')
      .findByRole('button', { name: /save category/i })
      .click();
    // find created item
    cy.findByTestId(categoryTestId)
      .as('newCat1')
      .should('contain.text', categoryName);
    cy.get('@newCat1').findByRole('img', { name: /icon: gift/i });
    // edit category
    cy.get('@newCat1').findByRole('button', { name: /edit/i }).click();
    cy.findByRole('dialog')
      .contains('h2', 'Edit category')
      .closest('[role=dialog]')
      .as('editCategoryDialog');
    cy.get('@editCategoryDialog')
      .findByRole('textbox', { name: /name/i })
      .should('have.value', categoryName)
      .type(`{selectAll}${editedCategoryName}`);
    cy.get('@editCategoryDialog')
      .findByRole('radio', { name: /^color: blue$/i })
      .click();
    cy.get('@editCategoryDialog')
      .findByRole('radio', { name: /party icon/i })
      .click();
    cy.get('@editCategoryDialog')
      .findByRole('button', { name: /save changes/i })
      .click();
    // check changes
    cy.get('@newCat1').should('contain.text', editedCategoryName);
    cy.get('@newCat1').findByRole('button', { name: /edit/i }).click();
    // change parent
    cy.findByRole('dialog')
      .contains('h2', 'Edit category')
      .closest('[role=dialog]')
      .as('newParentCategoryDialog');
    cy.get('@newParentCategoryDialog')
      .findByRole('combobox', { name: /parent category/i })
      .type('{selectAll}Entertainment');
    cy.findByRole('option', { name: /Entertainment/i }).click();
    cy.get('@newParentCategoryDialog')
      .findByRole('button', { name: /save changes/i })
      .click();
    // check parent
    cy.contains(/Entertainment/i)
      .closest('[role=listitem]')
      .findByTestId(categoryTestId)
      .contains(editedCategoryName);
    // delete category
    cy.findByTestId(categoryTestId)
      .findByRole('button', { name: /delete category/i })
      .click();
    cy.findByRole('button', { name: /yes, delete category/i }).click();
    cy.findByTestId(categoryTestId).should('not.exist');
  });

  it('user should reassign category on delete when it has linked transactions', () => {
    cy.createTransaction({
      amount: 1000,
      type: 'income',
      category: 'Salary',
      date: '1/2/2025 15:00',
      wallet: 'My Wallet',
    });
    cy.createTransaction({
      amount: 500,
      type: 'expense',
      category: 'Movies / Games',
      date: '1/2/2025 15:00',
      wallet: 'My Wallet',
    });

    cy.findAddTransactionButton().click();
    cy.findByRole('button', { name: /manage categories/i }).click();
    // Delete first transaction's category
    cy.findByRole('dialog')
      .findByText('Salary')
      .closest('[role=listitem]')
      .findByRole('button', { name: /delete category/i })
      .click();
    cy.findByRole('button', { name: /yes, delete category/i }).click();
    cy.findByText(
      '1 transactions are using this category. Please assign a new category before continuing.'
    );
    cy.findByRole('combobox', { name: /new category/i }).type('Other income');
    cy.findByRole('option', { name: /other income/i }).click();
    cy.findByRole('button', { name: /reassign and delete/i })
      .should('be.enabled')
      .click();
    cy.findByRole('tab', { name: /expense/i }).click();
    // Delete second transaction's category
    cy.findByRole('dialog')
      .findByText('Movies / Games')
      .closest('[role=listitem]')
      .findByRole('button', { name: /delete category/i })
      .click();
    cy.findByRole('button', { name: /yes, delete category/i }).click();
    cy.findByText(
      '1 transactions are using this category. Please assign a new category before continuing.'
    );
    cy.findByRole('combobox', { name: /new category/i }).type(
      'Other / Miscellaneous'
    );
    cy.findByRole('option', { name: /Other \/ Miscellaneous/i }).click();
    cy.findByRole('button', { name: /reassign and delete/i })
      .should('be.enabled')
      .click();
    // Close dialogs and check
    cy.findByRole('button', { name: /Close categories dialog/i }).click();
    cy.findByRole('button', { name: /Close dialog/i }).click();
    cy.findByTestId('transaction_0').should('contain.text', 'Other Income');
    cy.findByTestId('transaction_1').should(
      'contain.text',
      'Other / Miscellaneous'
    );
  });

  it('user can add more users', () => {
    cy.findByRole('button', { name: /switch or create user/i }).contains(
      'User #1'
    );
    cy.findByRole('button', { name: /switch or create user/i }).click();
    cy.findByRole('button', { name: /add new user/i }).click();
    cy.findByLabelText('Name').type('User #2');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByRole('menuitemradio', { name: /User #2/i });
  });

  it('user can switch profile', () => {
    cy.findByRole('button', { name: /switch or create user/i }).click();
    cy.findByRole('button', { name: /add new user/i }).click();
    cy.findByLabelText('Name').type('User #2');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByRole('menuitemradio', { name: /User #2/i }).click();
    cy.findByRole('button', { name: /switch or create user/i }).contains(
      'User #2'
    );
  });
});
