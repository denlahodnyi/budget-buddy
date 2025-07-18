import PrimeVue from 'primevue/config';
import { createApp } from 'vue';

import './app/main.scss';
import App from './App.vue';

const app = createApp(App);
app.use(PrimeVue, { unstyled: true });
app.mount('#app');
