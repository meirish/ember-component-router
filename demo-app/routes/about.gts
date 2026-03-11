import type { TemplateOnlyComponent } from '@ember/component/template-only';

interface Signature {
  Args: {
    queryParams: URLSearchParams;
  };
}

const AboutRoute: TemplateOnlyComponent<Signature> = <template>
  <h2 data-test-about>About</h2>
  <p>This demo showcases ember-component-router using the Navigation API.</p>
  <h5>queryParams.query</h5>
  {{@queryParams.get "query"}}
  <h5>queryParams.sort</h5>
  {{@queryParams.get "sort"}}
</template>;

export default AboutRoute;
