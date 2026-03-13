import { createRouter, createWebHistory } from 'vue-router';

import { HomePage } from '~/pages/home';
import Layout from './Layout.vue';

const SettingsPage = () =>
  import('~/pages/settings').then((module) => module.SettingsPage);

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL ?? '/'),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          component: HomePage,
        },
        {
          path: 'settings',
          component: SettingsPage,
        },
      ],
    },
  ],
});
