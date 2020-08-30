---
title: Тестирование с удовольствием Cypress.io
date: "2019-03-13T22:12:03.284Z"
---

![hey](./jstreet.jpg)

### Cypress.io пакет для тестирование, краткий обзор

we could take some info from documantation


### Что такое E2E тестирование

### Фичи Cypress
1. Time travel
2. Debuggability
3. Real time reloads
4. Automatic waiting

5. Понятное API 
6. Удобное UI для тестирования
7. Что означают платные планы и что в них входит

### Пару примеров на использование



### USE resilent components with data attributes for writing test cases

 Best Practice: Use data-* attributes to provide context to your selectors and insulate them from CSS or JS changes.

Every test you write will include selectors for elements. To save yourself a lot of headaches, you should write selectors that are resilient to changes.

Oftentimes we see users run into problems targeting their elements because:

cy.get('[data-cy=submit]').click()	 Always	Best. Insulated from all changes.
