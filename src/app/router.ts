import { createRouter, createWebHistory } from 'vue-router';

import { HomePage } from '~/pages/home';
import { SettingsPage } from '~/pages/settings';
import Layout from './Layout.vue';

export const router = createRouter({
  history: createWebHistory(),
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
