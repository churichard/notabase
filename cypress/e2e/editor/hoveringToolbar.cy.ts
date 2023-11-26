const NOTE_ID = '2c1f8ccd-42ad-4f94-ab7d-c36abb1328ca';

describe('hovering toolbar', () => {
  beforeEach(() => {
    cy.setup();
  });

  it('toolbar appears when text is selected and disappears when text is deselected', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByTestId('editor-popover').should('be.visible');
    cy.findByLabelText('Bold').should('be.visible');

    cy.getEditor().setSelection('');

    cy.findByTestId('editor-popover').should('not.exist');
    cy.findByLabelText('Bold').should('not.exist');
  });

  it('can make text bold', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Bold').click();

    cy.getEditor().find('b').eq(0).should('have.text', 'This is');
  });

  it('can make text italics', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Italic').click();

    cy.getEditor().find('em').eq(0).should('have.text', 'This is');
  });

  it('can make text underlined', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Underline').click();

    cy.getEditor().find('u').eq(0).should('have.text', 'This is');
  });

  it('can make text strikethrough', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Strikethrough').click();

    cy.getEditor().find('s').eq(0).should('have.text', 'This is');
  });

  it('can make text code', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Code').click();

    cy.getEditor().find('code').eq(0).should('have.text', 'This is');
  });

  it('can make text highlighted', function () {
    cy.visitNote(NOTE_ID);

    cy.getEditor().focus();
    cy.getEditor().type('{movetostart}This is a test');

    cy.getEditor().setSelection('This is');

    cy.findByLabelText('Highlight').click();

    cy.getEditor().find('mark').eq(0).should('have.text', 'This is');
  });
});

export {};
