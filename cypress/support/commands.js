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

import { createClient } from '@supabase/supabase-js';
import user from '../fixtures/user.json';
import notes from '../fixtures/notes.json';
import '@testing-library/cypress/add-commands';
import './selection';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

Cypress.Commands.add('setup', () => {
  cy.exec('npm run db:seed')
    .then(() =>
      supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })
    )
    .then(async (result) => {
      const data = notes.map((note) => ({
        ...note,
        user_id: result.data.user?.id,
      }));
      // insert completed notes to supabase
      await supabase.from('notes').insert(data);
    });

  cy.visit('/app');
});

Cypress.Commands.add(
  'paste',
  { prevSubject: true },
  (selector, data, type = 'text/plain') => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    cy.wrap(selector).then(($destination) => {
      const pasteEvent = Object.assign(
        new Event('paste', { bubbles: true, cancelable: true }),
        {
          clipboardData: {
            getData: () => data,
            types: [type],
          },
        }
      );

      $destination[0].dispatchEvent(pasteEvent);
    });
  }
);

Cypress.Commands.add('getEditor', () => cy.get('[data-testid="note-editor"]'));

// This is not a great way to target elements, but
// Toastify doesn't support adding data attributes
Cypress.Commands.add('getToastByContent', (content) =>
  cy.get('.Toastify__toast-body').should('be.visible').contains(content)
);

Cypress.Commands.add('getSidebarNoteLink', (noteTitle) => {
  cy.get('[data-testid="sidebar-note-link"]').contains(
    new RegExp('^' + noteTitle + '$')
  );
});

Cypress.Commands.add('getNoteLinkElement', (noteTitle) => {
  cy.get('[data-testid="note-link-element"]').should('contain', noteTitle);
});

// Gets the element where the note's title is editable
// contains() by default allows for partial matches
// But this RegExp finds the exact match of noteTitle
// '^' asserts position at start of the string
// '$' asserts position at end of string
Cypress.Commands.add('getNoteTitle', (noteTitle) => {
  cy.get('[data-testid="note-title"]').contains(
    new RegExp('^' + noteTitle + '$')
  );
});

// Gets a linked reference by the note's title
Cypress.Commands.add('getLinkedReference', (noteTitle) => {
  cy.get(`[data-testid="linked-reference"]`).contains(
    new RegExp('^' + noteTitle + '$')
  );
});

// Gets elements for each note in the linked references section
Cypress.Commands.add('getNumberOfNotesWithLinkedReferences', () => {
  cy.get('[data-testid="linked-reference"]');
});

// Gets the number of linked references to a page
Cypress.Commands.add('getNumberOfLinkedReferences', () => {
  cy.get('[contenteditable="false"] [data-testid="note-link-element"]');
});

// Uses within() to target elements within that page
// see: https://docs.cypress.io/api/commands/within

// Example:
//    cy.targetPage('noteTitle').within(() => {
//      // write test code here
//    })
Cypress.Commands.add('targetPage', (noteTitle) => {
  cy.getNoteTitle(noteTitle).parent();
});
