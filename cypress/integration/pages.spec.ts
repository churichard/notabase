import { createClient } from '@supabase/supabase-js';
import user from '../fixtures/user.json';
import notes from '../fixtures/notes.json';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

describe('pages', () => {
  beforeEach(() => {
    cy.exec('npm run db:seed')
      .then(() =>
        supabase.auth.signIn({
          email: user.email,
          password: user.password,
        })
      )
      .then(async (result) => {
        const data = [];

        // insert returned user_id into '../fixtures/notes.json'
        for (const note of notes) {
          ((<any>note).user_id = result.user?.id), data.push(note);
        }
        await supabase.from('notes').insert(data);
      });
    cy.visit('/app');
  });

  it('should be able to target elements on different pages', () => {
    // open note '001=>421'
    cy.getSidebarNoteLink('001=>421').click();

    // click on the link to note '211'
    // first() is specified because there are multiple links to note 211
    cy.getNoteLinkElement('421').first().click();

    // target page '001=>421' so we can target elements inside
    cy.targetPage('001=>421').within(() => {
      cy.getEditor().type('l');
    });

    // target page '421' so we can target elements inside
    cy.targetPage('421').within(() => {
      cy.getEditor().type('r');
    });
  });
});
