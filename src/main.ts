import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';
import {
  VueQueryPlugin,
  type VueQueryPluginOptions,
} from '@tanstack/vue-query';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';

import './app/main.scss';
import { router } from './app/router';
import App from './App.vue';
import { exchangeRateQuery } from './entities/currency';

const persister = experimental_createQueryPersister({
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  storage: window.localStorage,
  filters: {
    queryKey: exchangeRateQuery.queryKey,
  },
});

const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        persister: persister.persisterFn,
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  },
};

const app = createApp(App);
app.use(VueQueryPlugin, vueQueryOptions);
app.use(router);
app.use(PrimeVue, { unstyled: true });
app.mount('#app');
