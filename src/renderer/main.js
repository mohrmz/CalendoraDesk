import Vue from 'vue'
import axios from 'axios'
import migrations from './migration/runner-migrations';
import swal from 'sweetalert';
import App from './App'
import router from './router'
import store from './store'
import persian_date from "persian-date";
import helpers from './helpers';

const moment = require("moment");
const momentHijri = require("moment-hijri");

window.persianDate = persian_date;
window.moment = momentHijri || moment;

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
