declare namespace Cypress {
  interface Chainable {
    /**
     * Selects a Toastify element by its content
     * @example cy.selectToastByContent('content')
     */
    selectToastByContent(content: string);
    /**
     * Gets the Slate editor element.
     * @example cy.getEditor()
     */
    getEditor(): Chainable<JQuery<HTMLElement>>;
    /**
     * Custom command to paste text.
     * @example cy.paste('value')
     */
    paste(value: string, type?: string): Chainable<Element>;
    /**
     * Sets the selection.
     * @param query Beginning text
     * @param endQuery End text
     */
    setSelection(
      query:
        | string
        | {
            anchorQuery: string;
            anchorOffset?: number;
            focusQuery?: string;
            focusOffset?: number;
          },
      endQuery?: string
    ): Chainable<Element>;
  }
}
