import { createApp } from 'vue';
import PrimeVue from 'primevue/config';

import './app/main.scss';
import './store';
import App from './App.vue';

const app = createApp(App);
app.use(PrimeVue, { unstyled: true });
app.mount('#app');
