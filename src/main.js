// From panache
// import '@babel/polyfill'
// import 'mutationobserver-shim'

// Original
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// Structural Variation Vuetify
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';

// Pangenome Selection Vuestic
import { VuesticPlugin } from 'vuestic-ui'; // <-
import 'vuestic-ui/dist/vuestic-ui.css'; // <-

// Panache Bootstrap
// import './plugins/bootstrap-vue'

loadFonts();

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(VuesticPlugin)
  .mount('#app');
