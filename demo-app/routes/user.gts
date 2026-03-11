import type { LoaderArgs } from 'ember-component-router';
import type { TemplateOnlyComponent } from '@ember/component/template-only';

export function loader({ params }: LoaderArgs) {
  return { id: params['id'] };
}

interface Signature {
  Args: {
    loaderData: Awaited<ReturnType<typeof loader>>;
    params: Record<string, string | undefined>;
  };
}

const UserRoute: TemplateOnlyComponent<Signature> = <template>
  <h2 data-test-user>User</h2>
  {{#if @loaderData.id}}
    <p>User ID: {{@loaderData.id}}</p>
  {{else}}
    <p>No user selected! Try going to <a href="/users/1">User 1</a></p>
  {{/if}}
</template>;

export default UserRoute;
