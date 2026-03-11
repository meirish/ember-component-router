import type { TemplateOnlyComponent } from '@ember/component/template-only';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor, settled } from '@ember/test-helpers';
import { RoutePortal, Outlet } from 'ember-component-router';
import { route, index, layout } from 'ember-component-router/routes';

module('Integration | Component | Outlet', function (hooks) {
  setupRenderingTest(hooks);

  test('layout wraps child route via <Outlet>', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    const HomeComponent = <template>
      <p data-test-home>Home</p>
    </template>;
    const AppLayout = <template>
      <div data-test-layout>
        <Outlet />
      </div>
    </template>;

    const routes = [
      layout(
        () => Promise.resolve({ default: AppLayout }),
        [index(() => Promise.resolve({ default: HomeComponent }))],
      ),
    ];

    await render(
      <template><RoutePortal @config={{routes}} @base="/" /></template>,
    );

    await window.navigation.navigate('/').finished;
    await settled();

    await waitFor('[data-test-layout]', { timeout: 2000 });
    await waitFor('[data-test-home]', { timeout: 2000 });
    assert.dom('[data-test-layout]').exists();
    assert.dom('[data-test-home]').exists();
    assert.dom('[data-test-layout]').containsText('Home');
  });

  test('navigating between children re-uses the layout DOM', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    const HomeComponent = <template>
      <p data-test-home>Home</p>
    </template>;
    const AboutComponent = <template>
      <p data-test-about>About</p>
    </template>;
    const AppLayout = <template>
      <div data-test-layout>
        <Outlet />
      </div>
    </template>;

    const routes = [
      layout(
        () => Promise.resolve({ default: AppLayout }),
        [
          index(() => Promise.resolve({ default: HomeComponent })),
          route('about', () => Promise.resolve({ default: AboutComponent })),
        ],
      ),
    ];

    await render(
      <template><RoutePortal @config={{routes}} @base="/" /></template>,
    );

    await window.navigation.navigate('/').finished;
    await settled();
    await waitFor('[data-test-home]', { timeout: 2000 });

    const layoutEl = document.querySelector('[data-test-layout]');
    assert.dom('[data-test-layout]').exists();

    await window.navigation.navigate('/about').finished;
    await settled();
    await waitFor('[data-test-about]', { timeout: 2000 });

    assert.dom('[data-test-about]').exists();
    assert.dom('[data-test-home]').doesNotExist();
    assert.strictEqual(
      document.querySelector('[data-test-layout]'),
      layoutEl,
      'layout DOM element is reused',
    );
  });

  test('layout with its own loader passes loaderData to layout', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    interface LayoutSig {
      Args: { loaderData: { title: string } };
    }
    const AppLayout: TemplateOnlyComponent<LayoutSig> = <template>
      <div data-test-layout>
        <h1 data-test-title>{{@loaderData.title}}</h1>
        <Outlet />
      </div>
    </template>;
    const HomeComponent = <template>
      <p data-test-home>Home</p>
    </template>;

    const routes = [
      layout(
        () =>
          Promise.resolve({
            default: AppLayout,
            loader() {
              return { title: 'My App' };
            },
          }),
        [index(() => Promise.resolve({ default: HomeComponent }))],
      ),
    ];

    await render(
      <template><RoutePortal @config={{routes}} @base="/" /></template>,
    );

    await window.navigation.navigate('/').finished;
    await settled();

    await waitFor('[data-test-title]', { timeout: 2000 });
    assert.dom('[data-test-title]').hasText('My App');
    assert.dom('[data-test-home]').exists();
  });

  test('nested layouts: layout inside a layout', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    const HomeComponent = <template>
      <p data-test-home>Home</p>
    </template>;
    const OuterLayout = <template>
      <div data-test-outer>
        <Outlet />
      </div>
    </template>;
    const InnerLayout = <template>
      <div data-test-inner>
        <Outlet />
      </div>
    </template>;

    const routes = [
      layout(
        () => Promise.resolve({ default: OuterLayout }),
        [
          layout(
            () => Promise.resolve({ default: InnerLayout }),
            [index(() => Promise.resolve({ default: HomeComponent }))],
          ),
        ],
      ),
    ];

    await render(
      <template><RoutePortal @config={{routes}} @base="/" /></template>,
    );

    await window.navigation.navigate('/').finished;
    await settled();

    await waitFor('[data-test-outer]', { timeout: 2000 });
    await waitFor('[data-test-inner]', { timeout: 2000 });
    await waitFor('[data-test-home]', { timeout: 2000 });

    assert.dom('[data-test-outer]').exists();
    assert.dom('[data-test-inner]').exists();
    assert.dom('[data-test-home]').exists();
  });
});
