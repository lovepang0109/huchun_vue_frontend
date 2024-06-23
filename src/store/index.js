import { createStore } from 'vuex';
import getters from './getters';
import user from './modules/user';
import dashboard from './modules/dashboard';
import routing from './modules/routing';
import pricing from './modules/pricing';
import billing from './modules/billing';
import clearing from './modules/clearing';
import quality from './modules/quality';
import configuration from './modules/configuration';


const store = createStore({
  modules: {
    user,
    dashboard,
    routing,
    pricing,
    billing,
    clearing,
    quality,
    configuration,
  },
  getters
});

export default store
