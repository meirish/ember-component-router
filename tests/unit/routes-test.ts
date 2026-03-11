import { module, test } from 'qunit';
import { route, index, layout, prefix } from 'ember-component-router/routes';

const factory = () => Promise.resolve({ default: {} });

module('Unit | routes helpers', function () {
  test('route() creates correct definition', function (assert) {
    const def = route('users/:id', factory);
    assert.strictEqual(def._type, 'route');
    assert.strictEqual(def.pattern, 'users/:id');
    assert.strictEqual(def.moduleFactory, factory);
    assert.strictEqual(def.children, undefined);
  });

  test('route() with children stores children array', function (assert) {
    const child = index(factory);
    const def = route('dashboard', factory, [child]);
    assert.deepEqual(def.children, [child]);
  });

  test('index() sets _type: index and empty pattern', function (assert) {
    const def = index(factory);
    assert.strictEqual(def._type, 'index');
    assert.strictEqual(def.pattern, '');
    assert.strictEqual(def.moduleFactory, factory);
  });

  test('layout() sets _type: layout and empty pattern, stores children', function (assert) {
    const child = index(factory);
    const def = layout(factory, [child]);
    assert.strictEqual(def._type, 'layout');
    assert.strictEqual(def.pattern, '');
    assert.deepEqual(def.children, [child]);
  });

  test('prefix() returns array and prepends prefix to each child pattern', function (assert) {
    const defs = prefix('admin', [index(factory), route('users', factory)]);
    assert.strictEqual(defs.length, 2);
    assert.strictEqual(defs[0]!.pattern, 'admin');
    assert.strictEqual(defs[1]!.pattern, 'admin/users');
  });

  test('prefix() with index child sets pattern to the prefix itself', function (assert) {
    const defs = prefix('projects', [index(factory)]);
    assert.strictEqual(defs[0]!.pattern, 'projects');
    assert.notOk(defs[0]!.pattern.endsWith('/'));
  });
});
