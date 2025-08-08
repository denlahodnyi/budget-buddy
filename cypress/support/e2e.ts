// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

const IDB_NAME = 'budget_store';
const QUERY_CLIENT_KEY = 'tanstack-query-["exchangeRates"]';

beforeEach(() => {
  // Clear persisted TanstackQuery client
  cy.clearLocalStorage(QUERY_CLIENT_KEY);
  cy.wrap(
    new Promise((resolve, reject) => {
      // Clear persisted Tinybase store
      const IDBOpenDBRequest = window.indexedDB.deleteDatabase(IDB_NAME);
      IDBOpenDBRequest.onsuccess = () => {
        resolve(true);
      };
      IDBOpenDBRequest.onerror = () => {
        console.error('Error deleting IndexedDB:', IDBOpenDBRequest.error);
        reject(IDBOpenDBRequest.error);
      };
    })
  );
  cy.intercept('https://api.exchangerate.host/live*', {
    fixture: 'rates.json',
  }).as('getLiveRates');
});
