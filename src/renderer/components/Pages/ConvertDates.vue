<template>
  <div id="wrapper">
    <div class="dashboard">
      <div class="page-header">
        <h2 class="page-title">تبدیل تاریخ</h2>
        <p class="page-subtitle">تبدیل تاریخ بین تقویم‌های شمسی، میلادی و قمری</p>
      </div>
      <div class="convert-container">
        <div class="convert-form">

          <div class="form-group full-width">
            <label for="type">نوع تبدیل</label>
            <select id="type" @change="changeType()" class="form-control" v-model="type">
              <option selected="selected" value="1">خورشیدی (جلالی) به میلادی و قمری</option>
              <option value="0">میلادی به خورشیدی (جلالی) و قمری</option>
              <option value="2">قمری به خورشیدی (جلالی) و میلادی</option>
            </select>
          </div>
          <div class="form-row">
          <div class="form-group">
            <label for="day">روز</label>
            <select id="day" v-model="day" class="form-control">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
              <option value="31">31</option>
            </select>
          </div>
          <div class="form-group">
            <label>ماه</label>
            <select v-model="jalali_month" class="form-control" v-show="type === '1' ">
              <option value="1">فروردین-ماه اول</option>
              <option value="2">اردیبهشت-ماه دوم</option>
              <option value="3">خرداد-ماه سوم</option>
              <option value="4">تیر-ماه چهارم</option>
              <option value="5">مرداد-ماه پنجم</option>
              <option value="6">شهریور-ماه ششم</option>
              <option value="7">مهر-ماه هفتم</option>
              <option value="8">آبان-ماه هشتم</option>
              <option value="9">آذر-ماه نهم</option>
              <option value="10">دی-ماه دهم</option>
              <option value="11">بهمن-ماه یازدهم</option>
              <option value="12">اسفند-ماه دوازدهم</option>
            </select>
            <select v-model="gregorian_month" class="form-control" v-show="type === '0'">
              <option value="1">January-ماه اول</option>
              <option value="2">February-ماه دوم</option>
              <option value="3">March-ماه سوم</option>
              <option value="4">April-ماه چهارم</option>
              <option value="5">May-ماه پنجم</option>
              <option value="6">June-ماه ششم</option>
              <option value="7">July-ماه هفتم</option>
              <option value="8">August-ماه هشتم</option>
              <option value="9">September-ماه نهم</option>
              <option value="10">October-ماه دهم</option>
              <option value="11">November-ماه یازدهم</option>
              <option value="12">December-ماه دوازدهم</option>
            </select>
            <select v-model="hijri_month" class="form-control" v-show="type === '2'">
              <option value="1">محرم-ماه اول</option>
              <option value="2">صفر-ماه دوم</option>
              <option value="3">ربیع الاول-ماه سوم</option>
              <option value="4">ربیع الثانی-ماه چهارم</option>
              <option value="5">جمادی الاول-ماه پنجم</option>
              <option value="6">جمادی الثانیه-ماه ششم</option>
              <option value="7">رجب-ماه هفتم</option>
              <option value="8">شعبان-ماه هشتم</option>
              <option value="9">رمضان-ماه نهم</option>
              <option value="10">شوال-ماه دهم</option>
              <option value="11">ذوالقعده-ماه یازدهم</option>
              <option value="12">ذوالحجه-ماه دوازدهم</option>
            </select>
          </div>
          <div class="form-group">
            <label for="year">سال</label>
            <input type="number" id="year" v-model.number="year" class="form-control">
          </div>
          </div>
          <button @click="convert()" class="btn-convert">
            <i class="fa fa-exchange"></i>
            تبدیل
          </button>
        </div>
        <div class="results-grid">
          <div class="result-card">
            <div class="result-label">شمسی (جلالی)</div>
            <div class="result-date">{{ jalali_convert_date || '--' }}</div>
            <div class="result-numeral">{{ jalali_convert_numeral || '--' }}</div>
          </div>
          <div class="result-card">
            <div class="result-label">قمری</div>
            <div class="result-date">{{ hijri_convert_date || '--' }}</div>
            <div class="result-numeral">{{ hijri_convert_numeral || '--' }}</div>
          </div>
          <div class="result-card">
            <div class="result-label">میلادی</div>
            <div class="result-date">{{ gregorian_convert_date || '--' }}</div>
            <div class="result-numeral">{{ gregorian_convert_numeral || '--' }}</div>
          </div>
        </div>
      </div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script>
import Sidebar from '../Partials/Sidebar';

export default {
  name: "convert-dates",
  components: {
    Sidebar
  },
  data() {
    return {
      // Type 0 => Gregorian Calendar , Type 1 => Jalali Calendar , Type 2 => Hijri Calendar
      type: "1",
      day: 1,
      //
      jalali_month: 1,
      jalali_convert_date: "",
      jalali_convert_numeral: "",
      //
      gregorian_month: 1,
      gregorian_convert_date: "",
      gregorian_convert_numeral: "",
      //
      hijri_month: 1,
      hijri_convert_date: "",
      hijri_convert_numeral: "",
      //
      year: "1400",
    }
  },
  mounted() {
    let today = new persianDate();
    this.day = today.date();
    this.jalali_month = today.month();
    this.year = today.year();
    let date = this.convertJalaliDate();
    this.convertGregorianDate(date);
    this.convertHijriDate(date);
  },
  methods: {
    changeType() {
      let today = new persianDate();
      if (this.type === '0') {
        this.day = today.toCalendar('gregorian').date();
        this.gregorian_month = today.toCalendar('gregorian').month();
        this.year = today.toCalendar('gregorian').year();
      } else if (this.type === '1') {
        this.day = today.date();
        this.jalali_month = today.month();
        this.year = today.year();
      } else {
        let hijri_date = moment().subtract(1, 'days');
        this.day = hijri_date.iDate();
        this.hijri_month = fixNumbers(hijri_date.format("iM"));
        this.year = hijri_date.iYear();
      }
    },
    convert() {
      // Jalali Date
      if (this.type === '1') {
        let date = this.convertJalaliDate();
        this.convertGregorianDate(date);
        this.convertHijriDate(date);
      } else if (this.type === '0') {
        let date = this.convertGregorianDate();
        this.convertJalaliDate(date);
        this.convertHijriDate(date);
      } else {
        let date = this.convertHijriDate();
        this.convertJalaliDate(date);
        this.convertGregorianDate(date);
      }
    },
    convertJalaliDate(my_date) {
      if (my_date == null) {
        my_date = new persianDate([parseInt(this.year), parseInt(this.jalali_month), parseInt(this.day)]);
      } else {
        my_date.toCalendar('persian').toLocale('fa');
      }
      this.jalali_convert_date = my_date.format('dddd ، D MMMM YYYY');
      this.jalali_convert_numeral = my_date.format("YYYY/MM/D");
      return my_date;
    },
    convertGregorianDate(my_date) {
      if (my_date == null) {
        persianDate.toCalendar('gregorian');
        my_date = new persianDate([parseInt(this.year), parseInt(this.gregorian_month), parseInt(this.day)]);
        persianDate.toCalendar('persian');
      }
      this.gregorian_convert_date = my_date.toCalendar('gregorian').toLocale('en').format("dddd , MMMM D , YYYY");
      this.gregorian_convert_numeral = my_date.toCalendar('gregorian').toLocale('en').format("L");
      return my_date;
    },
    convertHijriDate(my_date) {
      let hijri_date;
      let dayOfWeek;
      if (my_date == null) {
        my_date = moment(`${parseInt(this.year)}/${parseInt(this.hijri_month)}/${parseInt(this.day)}`, 'iYYYY/iM/iD');
        hijri_date = my_date;
        dayOfWeek = new persianDate(new Date(my_date.clone().locale('en').format('YYYY/MM/DD'))).day();
      } else {
        my_date.toCalendar('gregorian').toLocale('en');
        hijri_date = moment(`${my_date.year()}-${my_date.month()}-${my_date.date()}`).subtract(1, 'days');
        dayOfWeek = my_date.day();
      }
      this.hijri_convert_date = this.getHijriWeekDay(dayOfWeek) + hijri_date.format(" ، iD iMMMM iYYYY");
      this.hijri_convert_numeral = hijri_date.format(`iYYYY/iMM/${hijri_date.iDate()}`);

      let returnDate = hijri_date.add('days', 1).locale('en').format('YYYY/MM/DD');
      return new persianDate(new Date(returnDate));
    },
    getHijriWeekDay(day) {
      let days = ["الأحد", "الأثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعه", "السبت"];
      return days[day - 1];
    }
  },


}
</script>

<style scoped>
.page-header {
  padding: 24px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.convert-container {
  padding: 0 24px 24px;
}

.convert-form {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.btn-convert {
  width: 100%;
  padding: 14px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-convert:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.result-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  transition: all 0.2s;
}

.result-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.result-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-date {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 12px;
  line-height: 1.4;
}

.result-numeral {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}

</style>