import { createClient } from '@supabase/supabase-js';
import { Note } from 'types/supabase';
import user from '../../fixtures/user.json';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

describe('hovering toolbar', () => {
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

  it('toolbar appears when text is selected and disappears when text is deselected', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByTestId('editor-popover').should('be.visible');
    cy.findByLabelText('Bold').should('be.visible');

    cy.getEditor().setSelection('');

    cy.findByTestId('editor-popover').should('not.exist');
    cy.findByLabelText('Bold').should('not.exist');
  });

  it('can make text bold', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Bold').click();

    cy.getEditor().find('b').eq(0).should('have.text', 'This is');
  });

  it('can make text italics', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Italic').click();

    cy.getEditor().find('em').eq(0).should('have.text', 'This is');
  });

  it('can make text underlined', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Underline').click();

    cy.getEditor().find('u').eq(0).should('have.text', 'This is');
  });

  it('can make text strikethrough', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Strikethrough').click();

    cy.getEditor().find('s').eq(0).should('have.text', 'This is');
  });

  it('can make text code', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Code').click();

    cy.getEditor().find('code').eq(0).should('have.text', 'This is');
  });

  it('can make text highlighted', function () {
    cy.visit(`/app/note/${this.noteId}`);

    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Highlight').click();

    cy.getEditor().find('mark').eq(0).should('have.text', 'This is');
  });
});
