import type { TemplateOnlyComponent } from '@ember/component/template-only';

interface Signature {
  Args: {
    queryParams: URLSearchParams;
  };
}

const qp = (qp: URLSearchParams, val: string) => {
  return qp.get(val);
};

const AboutRoute: TemplateOnlyComponent<Signature> = <template>
  <h2 data-test-about>About</h2>
  <p>This demo showcases ember-component-router using the Navigation API.</p>
  <h5>queryParams.query</h5>
  {{qp @queryParams "query"}}
  <h5>queryParams.sort</h5>
  {{qp @queryParams "sort"}}
</template>;

export default AboutRoute;
