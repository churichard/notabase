describe('pages', () => {
  beforeEach(() => {
    cy.setup();
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

export {};
