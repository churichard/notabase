import { createClient } from '@supabase/supabase-js';
import { Note } from 'types/supabase';
import user from '../../fixtures/user.json';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

describe('block menu', () => {
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

  it('can add a block below', function () {
    cy.visit(`/app/note/${this.noteId}`);

    // Type some text into the editor, then click the 3 dots to the left
    cy.getEditor()
      .focus()
      .type('{movetostart}This is a test')
      .findByTestId('dropdown-button')
      .eq(0)
      .click();

    // Assert that there is one paragraph
    cy.findAllByTestId('paragraph').should('have.length', 1);

    // Add block below
    cy.findByText('Add block below').click();

    // Assert that there are now two paragraphs
    cy.findAllByTestId('paragraph').should('have.length', 2);
  });
});
