declare namespace Cypress {
  interface Chainable {
    /**
     * Target a page to test elements within it
     * @example cy.targetPage('title')
     */
    targetPage(noteTitle: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Assert there is a certain amount of backlinks
     * @example cy.numberOfReferencesShouldEqual('linked', 5)
     */
    numberOfReferencesShouldEqual(amount: number, referenceType: string);

    /**
     * Get linked or unlinked reference based its note title
     * @example cy.getReference('linked', 'title')
     */
    getReference(
      noteTitle: string,
      referenceType: string
    ): Chainable<JQuery<HTMLElement>>;

    /**
     * Get note link element in the editor
     * @example cy.clickNoteLinkElement('title')
     */
    getNoteLinkElement(noteTitle: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Get the editable title of a note on its note page
     * @example cy.getNoteTitle('title')
     */
    getNoteTitle(noteTitle: string): Chainable<JQuery<HTMLElement>>;

    /**
     * Gets a note in the sidebar by its title
     * @example cy.getSidebarNoteLink('title')
     */
    getSidebarNoteLink(noteTitle: string): Chainable<JQuery<HTMLElement>>;

    /**
     * * Selects a Toastify element by its content
     * @example cy.getToastByContent('content')
     */
    getToastByContent(content: string): Chainable<JQuery<HTMLElement>>;

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
