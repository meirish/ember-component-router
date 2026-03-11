import { module, test } from 'qunit';
import { flattenRoutes } from '../../src/router.ts';
import { route, index, layout } from 'ember-component-router/routes';
import { ArrayMatcher } from '@remix-run/route-pattern';

const factory = () => Promise.resolve({ default: {} });

module('Unit | Router | flattenRoutes', function () {
  test('flattens flat config with base /', function (assert) {
    const config = [
      index(factory),
      route('about', factory),
      route('users/:id', factory),
    ];
    const resolved = flattenRoutes(config, '/');
    assert.strictEqual(resolved.length, 3);
    assert.strictEqual(resolved[0]!.fullPattern, '/');
    assert.strictEqual(resolved[1]!.fullPattern, '/about');
    assert.strictEqual(resolved[2]!.fullPattern, '/users/:id');
  });

  test('flattens config with base /app prepends base to all patterns', function (assert) {
    const config = [index(factory), route('about', factory)];
    const resolved = flattenRoutes(config, '/app');
    assert.strictEqual(resolved[0]!.fullPattern, '/app');
    assert.strictEqual(resolved[1]!.fullPattern, '/app/about');
  });

  test('nested route emits parent AND child entries', function (assert) {
    const config = [
      route('dashboard', factory, [index(factory), route('settings', factory)]),
    ];
    const resolved = flattenRoutes(config, '/');
    assert.strictEqual(resolved.length, 3);
    assert.strictEqual(resolved[0]!.fullPattern, '/dashboard');
    assert.strictEqual(resolved[1]!.fullPattern, '/dashboard');
    assert.strictEqual(resolved[2]!.fullPattern, '/dashboard/settings');
  });

  test('layout() skips layout node but includes all its children', function (assert) {
    const config = [layout(factory, [index(factory), route('about', factory)])];
    const resolved = flattenRoutes(config, '/');
    assert.strictEqual(resolved.length, 2);
    assert.strictEqual(resolved[0]!.fullPattern, '/');
    assert.strictEqual(resolved[1]!.fullPattern, '/about');
  });

  test('prefix() children resolve to correct full patterns', function (assert) {
    const config = [
      route('projects', factory, [index(factory), route(':id', factory)]),
    ];
    const resolved = flattenRoutes(config, '/');
    assert.strictEqual(resolved.length, 3);
    assert.strictEqual(resolved[0]!.fullPattern, '/projects');
    assert.strictEqual(resolved[1]!.fullPattern, '/projects');
    assert.strictEqual(resolved[2]!.fullPattern, '/projects/:id');
  });

  module('ArrayMatcher.matchAll nesting verification', function () {
    test('matchAll returns only the matching route for a given URL', function (assert) {
      const matcher = new ArrayMatcher<string>();
      matcher.add('/dashboard', 'parent');
      matcher.add('/dashboard/settings', 'child');

      const settingsMatches = matcher.matchAll(
        'https://example.com/dashboard/settings',
      );
      assert.strictEqual(settingsMatches.length, 1);
      assert.strictEqual(settingsMatches[0]!.data, 'child');

      const dashboardMatches = matcher.matchAll(
        'https://example.com/dashboard',
      );
      assert.strictEqual(dashboardMatches.length, 1);
      assert.strictEqual(dashboardMatches[0]!.data, 'parent');
    });
  });
});
