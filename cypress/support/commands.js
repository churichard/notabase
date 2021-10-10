// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';

Cypress.Commands.add(
  'paste',
  { prevSubject: true },
  (selector, pastePayload) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    cy.wrap(selector).then(($destination) => {
      const pasteEvent = Object.assign(
        new Event('paste', { bubbles: true, cancelable: true }),
        {
          clipboardData: {
            getData: () => pastePayload,
            types: ['text/plain'],
          },
        }
      );
      $destination[0].dispatchEvent(pasteEvent);
    });
  }
);

Cypress.Commands.add('getEditor', () => cy.get('[data-slate-editor=true]'));
