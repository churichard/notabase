import { createClient } from '@supabase/supabase-js';
import { Note } from 'types/supabase';
import user from '../../fixtures/user.json';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

describe('block reference', () => {
  beforeEach(() => {
    // seed the database and create a new note
    cy.exec('npm run db:seed')
      .then(() =>
        supabase.auth.signIn({
          email: user.email,
          password: user.password,
        })
      )
      .then(async (result) => {
        const { data } = await supabase
          .from<Note>('notes')
          .upsert(
            { title: 'Test', user_id: result.user?.id },
            { onConflict: 'user_id, title' }
          )
          .single();
        cy.wrap(data?.id).as('noteId');
      });
  });

  it('can add a block reference by copying and pasting the block ref', function () {
    cy.visit(`/app/note/${this.noteId}`);

    // Type some text into the editor, then click the 3 dots to the left
    cy.get('[data-slate-editor=true]')
      .type('{movetostart}This is a test')
      .findAllByRole('button')
      .eq(0)
      .click();

    // Copy the block reference
    cy.findByText('Copy block reference').click();

    // Create a new block, then paste the block reference in it
    cy.window()
      .then((win) => win.navigator.clipboard.readText())
      .then((text) => {
        cy.get('[data-slate-editor=true]')
          .type('{movetoend}{enter}')
          .paste(text);
      });

    // Assert that there are now two blocks with the same content
    cy.findAllByText('This is a test').should('have.length', 2);
  });
});
