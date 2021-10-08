import user from '../fixtures/user.json';

describe('Login', () => {
  before(() => {
    // seed the database
    cy.exec('npm run db:seed');
  });

  it('can successfully log in', () => {
    cy.visit('/login');

    cy.get('#email').type(user.email);
    cy.get('#password').type(user.password);

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/app');
  });
});
