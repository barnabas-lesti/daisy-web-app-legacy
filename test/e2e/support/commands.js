const data = require('../data');

Cypress.Commands.add('auth/registerUser', () => {
  const user = data.generateUser();
  cy.request('PUT', '/api/auth/register', user)
    .then(({ body }) => {
      return { ...body, ...user };
    });
});

Cypress.Commands.add('auth/signIn', () => {
  cy['auth/registerUser']()
    .then(user => {
      cy.request('POST', '/api/auth/sign-in', user)
        .then(({ body }) => {
          const { authHeader } = body;
          window.localStorage.setItem('core/authHeader', JSON.stringify(authHeader));
          return user;
        });
    });
});

Cypress.Commands.add('auth/signOut', () => {
  window.localStorage.removeItem('core/authHeader');
});

Cypress.Commands.add('health/diet/createFood', (foodArray) => {
  const authHeader = window.localStorage.getItem('core/authHeader');
  for (const food of foodArray) {
    cy.request({
      url: '/api/health/diet/food',
      body: food,
      method: 'PUT',
      headers: { 'authorization': authHeader },
    });
  }
});
