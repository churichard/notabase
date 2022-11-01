import { createClient } from '@supabase/supabase-js';
import user from '../fixtures/user.json';
import notes from '../fixtures/notes.json';

const supabase = createClient(
  Cypress.env('NEXT_PUBLIC_SUPABASE_URL'),
  Cypress.env('NEXT_PUBLIC_SUPABASE_KEY')
);

// These tests use the notes from the the 'notes.json fixture
// The note titles can be read as:
// {# of references}{# of notes referrencing it}{id}
// Example: Note '001' has 0 references from 0 notes
// and is the first of its kind
// Example: Note '002' has 0 references from 0 notes
// and it is the second of its kind
// Example: Note '421' has 4 references from 2 notes
// and is the first of its kind

// Links to other notes are indicated by '=>'
// Example: Note '001=>111' means this note has a
// note link element for note '111'. The result is
// note '111 'has a linked reference from '001=>111'

describe('linked references', () => {
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

        // insert completed notes to supabase
        await supabase.from('notes').insert(data);
      });
    cy.visit('/app');
  });

  it('should open an existing note after clicking on a note link element', () => {
    // open note '001=>111'
    cy.getSidebarNoteLink('001=>111').click();

    // target page '001=>111' so we can target elements inside
    cy.targetPage('001=>111').within(() => {
      // click on the link to note '111'
      cy.getNoteLinkElement('111').click();
    });

    // checks if note '111' displayed
    // if targetPage('111') succeeds, note '111' is visible
    cy.targetPage('111');
  });

  it('should show linked references from referring links', () => {
    // open note '111'
    cy.getSidebarNoteLink('111').click();

    // target page '001=>111' so we can target elements inside
    cy.targetPage('111').within(() => {
      // check note '111' has 1 linked reference
      cy.numberOfReferencesShouldEqual(1, 'linked');
      // check the linked reference is from '001=>111'
      cy.getReference('001=>111', 'linked');
    });
  });

  it('should change the note link element text when the source note title is changed', () => {
    // open note '001=>112'
    cy.getSidebarNoteLink('001=>112').click();

    // target page '001=>112' so we can target elements inside
    cy.targetPage('001=>112').within(() => {
      // click on the link to note '112'
      cy.getNoteLinkElement('112').click();
    });

    // intercept the next request trying to update the note
    cy.intercept('PATCH', '/rest/v1/notes?id=*').as('updateNote');

    // target page '112' so we can target elements inside
    cy.targetPage('112').within(() => {
      // change the title from '112' to '112x'
      cy.getNoteTitle('112').type('x');
    });

    // wait for the note to finish updating so the link can be found
    cy.wait('@updateNote').its('response.statusCode').should('eq', 200);

    // reference existing '001=>112' page to target the element inside
    cy.targetPage('001=>112').within(() => {
      // the link in note '001=>112' should have changed from '112' to '112x'
      cy.getNoteLinkElement('112x');
    });
  });

  it('should display link references in both notes that are bidirectionally linked', () => {
    // open note '111=>112'
    cy.getSidebarNoteLink('111=>112').click();

    // target page '111=>112' so we can target elements inside
    cy.targetPage('111=>112').within(() => {
      // check note '111=>112' has 1 linked reference
      cy.numberOfReferencesShouldEqual(1, 'linked');
      // check note '111=>112' is referenced by '112=>111'
      cy.getReference('112=>111', 'linked');
      // click on the link to '112=>111'
      cy.getNoteLinkElement('112=>111').click();
    });

    // target page '112=>111' so we can target elements inside
    cy.targetPage('112=>111').within(() => {
      // check note '112=>111' has 1 linked reference
      cy.numberOfReferencesShouldEqual(1, 'linked');
      // check note '112=>111' is referenced by '111=>112'
      cy.getReference('111=>112', 'linked');
      // check link to note '111=>112' exists
      cy.getNoteLinkElement('111=>112');
    });
  });

  it('should display multiple references from the same file in the same backlink note branch', () => {
    // open note '001=>211'
    cy.getSidebarNoteLink('001=>211').click();

    // target page '001=>211' so we can target elements inside
    cy.targetPage('001=>211').within(() => {
      // create a new note link element referencing note 211
      cy.getEditor().type('[[211]]');
      // click on the link to note '211'
      // first() is specified because there are multiple links to note 211
      cy.getNoteLinkElement('211').first().click();
    });

    // target page '211' so we can target elements inside
    cy.targetPage('211').within(() => {
      // check there is only 1 note referencing this note
      cy.numberOfReferencesShouldEqual(1, 'linked');
      // check note '211' is referenced by '001=>211'
      cy.getReference('001=>211', 'linked');
      // check there are 3 links within that note
      cy.getNoteLinkElement('211').should('have.length', 3);
    });
  });

  it('should display references from different pages in their own backlink note branch', () => {
    // open note '221'
    cy.getSidebarNoteLink('221').click();

    // target page '211' so we can target elements inside
    cy.targetPage('221').within(() => {
      // note should be referenced by two notes
      cy.numberOfReferencesShouldEqual(2, 'linked');
      // there should be 1 reference from note '001=>221'
      cy.getReference('001=>221', 'linked').should('have.length', 1);
      // there should be 1 reference from note '002=>221'
      cy.getReference('002=>221', 'linked').should('have.length', 1);
    });
  });

  it('should open note when you click on backlink note branch', () => {
    // open note '111'
    cy.getSidebarNoteLink('111').click();

    // target page '111' so we can target elements inside
    cy.targetPage('111').within(() => {
      // click on note '001=>111' in the linked reference section
      cy.getReference('001=>111', 'linked').click();
    });

    // check if note '001=>111' is displayed
    cy.targetPage('001=>111');
  });

  it('should remove note link elements when notes are deleted', () => {
    // open note '111'
    cy.getSidebarNoteLink('111').click();

    // intercept the next request trying to update the note
    cy.intercept('DELETE', '/rest/v1/notes?id=*').as('deleted');

    // click on the [...] button on the note page
    cy.get('[data-testid="note-menu-button"]').click();
    // click on the delete dropdown-menu-item
    cy.get('[data-testid="note-menu-button-dropdown"] button')
      .contains('Delete')
      .click();

    // wait for the note to be deleted
    cy.wait('@deleted').its('response.statusCode').should('eq', 200);

    // open note '001=>111'
    cy.getSidebarNoteLink('001=>111').click();

    // target page '001=>111' so we can target elements inside
    cy.targetPage('001=>111').within(() => {
      // check that the text '111' exists
      cy.getEditor().contains('111');
      // but the '111' text is no longer a note link element
      cy.getNoteLinkElement('111').should('not.exist');
    });
  });

  it('should remove linked reference when the reference is deleted', () => {
    // open note '001=>111'
    cy.getSidebarNoteLink('001=>111').click();

    // target page '001=>111' so we can target elements inside
    cy.targetPage('001=>111').within(() => {
      // delete the note link element for '111' using the keyboard
      cy.getEditor().type('{moveToEnd}{backspace}');
      // check '111' note link element was deleted
      cy.getNoteLinkElement('111').should('not.exist');
    });

    // open note '111'
    cy.getSidebarNoteLink('111').click();

    // target page '111' so we can target elements inside=
    cy.targetPage('111').within(() => {
      // note '001=>111' should no longer reference this note
      cy.numberOfReferencesShouldEqual(0, 'linked');
    });
  });
});
