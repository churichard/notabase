declare namespace Cypress {
  interface Chainable {
    /**
     * Gets the Slate editor element.
     * @example cy.getEditor()
     */
    getEditor(): Chainable<Element>;
    /**
     * Custom command to paste text.
     * @example cy.paste('value')
     */
    paste(value: string): Chainable<Element>;
  }
}
