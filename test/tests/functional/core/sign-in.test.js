import mocks from '../../../support/mocks';
import stubs from '../../../support/stubs';

describe('Functional / Core / Sign in', () => {
  beforeEach(() => {
    cy.viewport('iphone-6');
  });

  it('Register page should be accessible from the page', () => {
    cy.visit('/sign-in');
    cy.get('.sign-in-form__register-link')
      .click();
    cy.url()
      .should('include', '/register');
  });

  it('App should navigate to the sign in page if user has no auth. tokens stored', () => {
    cy.visit('/');
    cy.url()
      .should('include', '/sign-in');
  });

  it('Page should display a "session expired" error if auth. tokens are invalid', () => {
    cy.server()
      .route({ method: 'GET', url: '/api/auth/profile', status: 401, response: { error: 'UNAUTHORIZED' } });
    localStorage.setItem('core/authHeader', '"ah"');
    cy.visit('/');

    cy.get('.sign-in-form')
      .contains(/session.*expired/i).should('be.visible');
  });

  it('Page should navigate to the original page if token authentication is successful', () => {
    stubs['core/user']();
    localStorage.setItem('core/authHeader', JSON.stringify(mocks.authHeader()));
    cy.visit('/?test=10');
    cy.url()
      .should('not.include', '/sign-in');
    cy.url()
      .should('include', '?test=10');
  });

  it('Form should be validated before submit', () => {
    const { email, password } = mocks.user();
    cy.visit('/sign-in');

    cy.get('.sign-in-form').as('form')
      .submit();
    cy.get('@form')
      .contains(/email.*required/i).should('be.visible');
    cy.get('@form')
      .contains(/password.*required/i).should('be.visible');

    cy.get('input[name="email"]')
      .type(email);
    cy.get('input[name="password"]')
      .type(password);
    cy.get('@form')
      .contains(/email.*required/i).should('not.be.visible');
    cy.get('@form')
      .contains(/password.*required/i).should('not.be.visible');
  });

  it('Should display "invalid credentials" error if user is not found', () => {
    const user = mocks.user();
    cy.visit('/sign-in');

    cy.server()
      .route({ method: 'POST', url: '/api/auth/sign-in', status: 404, response: { error: 'NOT_FOUND' } });
    cy.get('input[name="email"]')
      .type(user.email);
    cy.get('input[name="password"]')
      .type(user.password);
    cy.get('button[type="submit"]')
      .click();
    cy.get('.sign-in-form').as('form')
      .contains(/invalid.*credentials/i).should('be.visible');
  });

  it('Should display "invalid credentials" error if credentials are invalid', () => {
    const user = mocks.user();
    cy.server()
      .route({ method: 'POST', url: '/api/auth/sign-in', status: 401, response: { error: 'INVALID_CREDENTIALS' } });
    cy.visit('/sign-in');

    cy.get('input[name="email"]')
      .type(user.email);
    cy.get('input[name="password"]')
      .type(user.password);
    cy.get('.sign-in-form')
      .submit();

    cy.get('.sign-in-form').as('form')
      .contains(/invalid.*credentials/i).should('be.visible');
  });

  it('Should sign in the user', () => {
    const user = mocks.user();
    const authHeader = mocks.authHeader();
    cy.visit('/sign-in');

    cy.server()
      .route({ method: 'POST', url: '/api/auth/sign-in', status: 200, response: { user, authHeader }, delay: 64 });
    cy.get('input[name="email"]')
      .type(user.email);
    cy.get('input[name="password"]')
      .type(user.password);
    cy.get('button[type="submit"]')
      .click()
      .should('have.class', 'v-btn--loading');

    cy.get('.notifications')
      .contains(new RegExp(`signed.*in.*${user.email}`, 'i')).should('be.visible');
    cy.url()
      .should('not.include', '/sign-in');
    cy.window()
      .then(window => {
        expect(JSON.parse(window.localStorage.getItem('core/authHeader'))).to.equal(authHeader);
      });
  });
});