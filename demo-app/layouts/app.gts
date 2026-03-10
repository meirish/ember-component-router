import { Outlet } from 'ember-component-router';

<template>
  <div class="app-layout">
    <header data-test-app-header>
      <strong>ember-component-router</strong>
    </header>
    <main>
      <Outlet />
    </main>
  </div>
</template>
