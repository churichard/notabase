const NOTE_ID = '2c1f8ccd-42ad-4f94-ab7d-c36abb1328ca';

describe('block menu', () => {
  beforeEach(() => {
    cy.setup();
  });

  it('can add a block below', function () {
    cy.visit(`/app/note/${NOTE_ID}`);

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

export {};
