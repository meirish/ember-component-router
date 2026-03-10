import { pageTitle } from 'ember-page-title';
import { RoutePortal } from 'ember-component-router';
import routeConfig from '../routes/config';

<template>
  {{pageTitle "ember-component-router demo"}}

  <nav>
    <a href="/">Home</a>
    |
    <a href="/about">About</a>
    |
    <a href="/users/42">User 42</a>
    |
    <a href="/missing">404</a>
  </nav>

  <RoutePortal @config={{routeConfig}} @base="/" />
</template>
