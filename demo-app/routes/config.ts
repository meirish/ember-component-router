import { route, index, layout } from 'ember-component-router/routes';

export default [
  layout(() => import('../layouts/app.gts'), [
    index(() => import('./home.gts')),
    route('about', () => import('./about.gts')),
    route('users(/:id)', () => import('./user.gts')),
    route('*', () => import('./not-found.gts')),
  ]),
];
