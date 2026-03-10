import Component from '@glimmer/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitFor, settled } from '@ember/test-helpers';
import { RoutePortal } from 'ember-component-router';
import { route, index } from 'ember-component-router/routes';

const HomeComponent = <template><p data-test-home>Home</p></template>;
const AboutComponent = <template><p data-test-about>About</p></template>;

const testRoutes = [
  index(() => Promise.resolve({ default: HomeComponent })),
  route('about', () => Promise.resolve({ default: AboutComponent })),
];

module('Integration | Component | RoutePortal', function (hooks) {
  setupRenderingTest(hooks);

  test('renders the index route after navigating to /', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    await render(<template>
      <RoutePortal @config={{testRoutes}} @base="/" />
    </template>);

    await window.navigation.navigate('/').finished;
    await settled();

    await waitFor('[data-test-home]', { timeout: 2000 });
    assert.dom('[data-test-home]').exists();
  });

  test('navigating to /about renders the about route', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    await render(<template>
      <RoutePortal @config={{testRoutes}} @base="/" />
    </template>);

    await window.navigation.navigate('/about').finished;
    await settled();

    await waitFor('[data-test-about]', { timeout: 2000 });
    assert.dom('[data-test-about]').exists();
    assert.dom('[data-test-home]').doesNotExist();
  });

  test('navigating cleans up previous render', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    await render(<template>
      <RoutePortal @config={{testRoutes}} @base="/" />
    </template>);

    await window.navigation.navigate('/').finished;
    await settled();
    await waitFor('[data-test-home]');

    await window.navigation.navigate('/about').finished;
    await settled();

    await waitFor('[data-test-about]');
    assert.dom('[data-test-home]').doesNotExist();
  });

  test('@base scoping: portal with /admin base does not render on / navigation', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    const AdminComponent = <template><p data-test-admin>Admin</p></template>;
    const adminRoutes = [
      index(() => Promise.resolve({ default: AdminComponent })),
    ];

    await render(<template>
      <RoutePortal @config={{testRoutes}} @base="/" />
      <RoutePortal @config={{adminRoutes}} @base="/admin" />
    </template>);

    await window.navigation.navigate('/').finished;
    await settled();

    assert.dom('[data-test-admin]').doesNotExist();
    assert.dom('[data-test-home]').exists();
  });

  test('route with a loader: loader result is passed as @loaderData', async function (assert) {
    if (!window.navigation) {
      assert.ok(true, 'Navigation API not available — skipping');
      return;
    }

    interface DataSig {
      Args: { loaderData: { message: string } };
    }
    class DataComponent extends Component<DataSig> {
      <template>
        <p data-test-data>{{@loaderData.message}}</p>
      </template>
    }

    const loaderRoutes = [
      index(async () => ({
        default: DataComponent,
        async loader() {
          return { message: 'hello from loader' };
        },
      })),
    ];

    await render(<template>
      <RoutePortal @config={{loaderRoutes}} @base="/" />
    </template>);

    await window.navigation.navigate('/').finished;
    await settled();

    await waitFor('[data-test-data]', { timeout: 2000 });
    assert.dom('[data-test-data]').hasText('hello from loader');
  });
});
