import supabase from 'cypress/support/supabaseCypress';
import user from '../fixtures/user.json';
import user_new from '../fixtures/user_new.json';

describe('User sign up, login, and logout', () => {
  beforeEach(() => {
    cy.exec('npm run db:seed');
  });

  it('can login using UI', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type(user.email);
    cy.get('input[type="password"]').type(user.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/app');
    cy.getCookie('supabase.auth.token');
  });

  it('displays built-in browser login validation errors', () => {
    cy.visit('/login');

    // These validations are generated using the required HTML attribute on the form inputs

    // Check input types are correct and required attributes are present
    cy.get('input[type="email"]:required');
    cy.get('input[type="password"]:required');

    // Submit form with empty username and password
    cy.get('button[type="submit"]').click();

    // Check for empty field validation error
    cy.get('input:invalid');

    // Since the validation error was present the form inputs were correctly setup

    // The browser will also correctly show the other validation errors for those input types
  });

  it('displays toastify login validation error for incorrect password', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type(user.email);
    cy.get('input[type="password"]').type('x');

    cy.get('button[type="submit"]').click();

    cy.getToastByContent('Invalid');
  });

  it('displays toastify login validation error for incorrect username', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('x@x.co');
    cy.get('input[type="password"').type(user.password);

    cy.get('button[type="submit"]').click();

    cy.getToastByContent('Invalid');
  });

  it('can sign up using UI', () => {
    cy.visit('/signup');

    cy.get('input[type="email"]').type(user_new.email);
    cy.get('input[type="password"]').type(user_new.password);
    cy.get('button[type="submit"').click();

    cy.get('[data-testid="email-confirmation-message"]').contains(
      'We just sent you a confirmation email.'
    );
  });

  it('can sign up but cannot login until email is confirmed', function () {
    // sign up using the API
    cy.visit('/login').then(() =>
      supabase.auth.signUp({
        email: user_new.email,
        password: user_new.password,
      })
    );

    // login using UI
    cy.get('input[type="email"]').type(user_new.email);
    cy.get('input[type="password"]').type(user_new.password);
    cy.get('button[type="submit"').click();

    cy.getToastByContent('Email not confirmed');
  });

  it('displays error if you try to sign up twice within 1 minute', () => {
    cy.visit('/signup');

    // first sign up
    cy.get('input[type="email"]').type(user_new.email);
    cy.get('input[type="password"]').type(user_new.password);
    cy.get('button[type="submit"').click();

    // error should not appear on first sign up
    cy.get('.Toastify__toast-body').should('not.exist');

    // second sign up
    cy.get('button[type="submit"').click();

    // error should appear on second sign up
    cy.getToastByContent('For security purposes');
  });

  it('displays error if password is less than 6 characters', () => {
    cy.visit('/signup');

    cy.get('input[type="email"]').type(user_new.email);
    cy.get('input[type="password"]').type('a');

    cy.get('button[type="submit"').click();

    cy.getToastByContent('Password should be at least 6 characters');
  });

  it('displays built-in browser signup validation errors', () => {
    cy.visit('/signup');

    // These validations are generated using the required HTML attribute on the form inputs

    // Check input types are correct and required attributes are present
    cy.get('input[type="email"]:required');
    cy.get('input[type="password"]:required');

    // Submit form with empty username and password
    cy.get('button[type="submit"]').click();

    // Check for empty field validation error
    cy.get('input:invalid');

    // Since the validation error was present the form inputs were correctly setup

    // The browser will also correctly show the other validation errors for those input types
  });

  it('removes cookie when user logs out', () => {
    cy.visit('/').then(() =>
      supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })
    );

    cy.visit('/login');
    cy.url().should('include', '/app');

    cy.getCookie('supabase.auth.token').then(() => {
      supabase.auth.signOut();
    });

    cy.visit('/login');

    cy.url().should('include', '/login');
    cy.getCookie('supabase.auth.token').should('not.exist');
  });
});
