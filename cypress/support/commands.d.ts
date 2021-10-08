declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to paste text.
     * @example cy.paste('value')
     */
    paste(value: string): Chainable<Element>;
  }
}
