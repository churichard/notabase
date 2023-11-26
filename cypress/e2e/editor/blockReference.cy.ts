const BLANK_NOTE_ID = '2c1f8ccd-42ad-4f94-ab7d-c36abb1328ca';
const NOTE_WITH_BLOCK_REF_ID = 'c5e7a286-5ee7-40fa-bd36-5df278ba9575';

describe('block reference', () => {
  beforeEach(() => {
    cy.setup();
  });

  it('can add a block reference by copying and pasting the block ref', () => {
    cy.visit(`/app/note/${BLANK_NOTE_ID}`);

    // Type some text into the editor, then click the 3 dots to the left
    cy.getEditor()
      .focus()
      .type('{movetostart}This is a test')
      .findByTestId('dropdown-button')
      .eq(0)
      .click();

    // Copy the block reference
    cy.findByText('Copy block reference').click();

    // Create a new block, then paste the block reference in it
    cy.window()
      .then((win) => win.navigator.clipboard.readText())
      .then((text) => {
        cy.getEditor().focus().type('{movetoend}{enter}').paste(text);
      });

    // Assert that there are now two blocks with the same content
    cy.findAllByText('This is a test').should('have.length', 2);

    // Assert that there is no error with the block reference
    cy.contains('Error: no block with id').should('have.length', 0);
  });

  it('can edit a block and have its references update', () => {
    cy.visit(`/app/note/${NOTE_WITH_BLOCK_REF_ID}`);

    cy.getEditor()
      .focus()
      .type('{moveToStart}{downArrow}{rightArrow}{end} Hello');

    cy.getEditor()
      .findAllByText('This paragraph will be referenced. Hello')
      .should('have.length', 2);
  });
});

export {};
