import Vue from 'vue'
import axios from 'axios'
import migrations from './migration/runner-migrations';
import swal from 'sweetalert';
import App from './App'
import router from './router'
import store from './store'
import persian_date from "persian-date";
import helpers from './helpers';

// Use CommonJS require for moment and moment-hijri to ensure they share the same instance
// moment-hijri requires moment internally and returns the extended moment
// This is critical for moment-hijri to properly extend moment
const moment = require("moment");
// moment-hijri extends moment and returns the extended version
const momentHijri = require("moment-hijri");

window.persianDate = persian_date;
// Use the extended moment returned by moment-hijri
// moment-hijri's factory function extends moment and returns it
window.moment = momentHijri || moment;

// Verify moment-hijri extension
if (typeof window.moment().iYear !== 'function') {
  console.error('moment-hijri failed to extend moment. iYear method not found.');
  console.error('Available methods:', Object.getOwnPropertyNames(window.moment().__proto__));
} else {
  console.log('moment-hijri successfully extended moment');
}

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app')
