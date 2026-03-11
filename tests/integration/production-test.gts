import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor, settled } from '@ember/test-helpers';
import { RoutePortal } from 'ember-component-router';
import { index } from 'ember-component-router/routes';

module('Integration | Production Hardening', function (hooks) {
  setupRenderingTest(hooks);

  test('multiple RoutePortals with different @base only respond to their own base', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    const HomeComponent = <template>
      <p data-test-home>Home</p>
    </template>;
    const AdminComponent = <template>
      <p data-test-admin>Admin</p>
    </template>;

    const rootRoutes = [
      index(() => Promise.resolve({ default: HomeComponent })),
    ];
    const adminRoutes = [
      index(() => Promise.resolve({ default: AdminComponent })),
    ];

    await render(
      <template>
        <RoutePortal @config={{rootRoutes}} @base="/" />
        <RoutePortal @config={{adminRoutes}} @base="/admin" />
      </template>,
    );

    await window.navigation.navigate('/').finished;
    await settled();
    await waitFor('[data-test-home]', { timeout: 2000 });

    assert.dom('[data-test-home]').exists('root portal renders for /');
    assert
      .dom('[data-test-admin]')
      .doesNotExist('admin portal does not render for /');

    await window.navigation.navigate('/admin').finished;
    await settled();
    await waitFor('[data-test-admin]', { timeout: 2000 });

    assert.dom('[data-test-admin]').exists('admin portal renders for /admin');
  });

  test('error boundary: renders ErrorBoundary when loader throws', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    interface ErrorSig {
      Args: { loaderData: Error };
    }
    const ErrorBoundary: TemplateOnlyComponent<ErrorSig> = <template>
      <p data-test-error>Error: {{@loaderData.message}}</p>
    </template>;

    const loaderRoutes = [
      index(() =>
        Promise.resolve({
          default: {},
          ErrorBoundary,
          loader() {
            throw new Error('loader failed');
          },
        }),
      ),
    ];

    await render(
      <template><RoutePortal @config={{loaderRoutes}} @base="/" /></template>,
    );

    await window.navigation.navigate('/').finished;
    await settled();

    await waitFor('[data-test-error]', { timeout: 2000 });
    assert.dom('[data-test-error]').exists();
    assert.dom('[data-test-error]').containsText('Error');
  });
});
