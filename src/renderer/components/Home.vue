<template>
  <div id="wrapper">
    <div class="dashboard d-flex">
      <div class="date-table">
        <!-- Calendar Type Selector -->
        <div class="calendar-type-selector">
          <button
            v-for="type in calendarTypes"
            :key="type.value"
            @click="selectCalendarType(type.value)"
            class="type-btn"
            :class="{ active: selectedCalendarType === type.value }"
          >
            <i :class="type.icon"></i>
            <span>{{ type.label }}</span>
          </button>
        </div>

        <!-- Calendar Header -->
        <div class="date-table-header">
          <div class="month-next" @click="prevMonth()">
            <i class="fa fa-angle-right"></i>
            <span>ماه قبل</span>
          </div>
          <div class="month-now">
            <div class="month-selector" @click.stop="showMonthPicker = !showMonthPicker">
              <span class="month-title">{{ currentMonthTitle }}</span>
              <i class="fa fa-chevron-down date-picker-icon"></i>
            </div>
            <div class="year-selector" @click.stop="showYearPicker = !showYearPicker">
              <i class="fa fa-chevron-down date-picker-icon"></i>
              <span class="month-year">{{ formatYear(currentYear) }}</span>
            </div>
          </div>
          <div class="month-last" @click="nextMonth()">
            <span>ماه بعد</span>
            <i class="fa fa-angle-left"></i>
          </div>
        </div>

        <!-- Month Picker Modal -->
        <div class="date-picker-modal" v-if="showMonthPicker" @click.self="showMonthPicker = false">
          <div class="date-picker-content month-picker-content">
            <h4>انتخاب ماه</h4>
            <div class="months-grid">
              <button
                v-for="(month, index) in availableMonths"
                :key="index"
                @click="selectMonth(index + 1)"
                class="month-btn"
                :class="{ active: month === currentMonthTitle }"
              >
                {{ month }}
              </button>
            </div>
          </div>
        </div>

        <!-- Year Picker Modal -->
        <div class="date-picker-modal" v-if="showYearPicker" @click.self="showYearPicker = false">
          <div class="date-picker-content year-picker-content">
            <h4>انتخاب سال</h4>
            <div class="years-scroll" ref="yearsScroll">
              <button
                v-for="year in availableYears"
                :key="year"
                @click="selectYear(year)"
                class="year-btn"
                :class="{ active: year === currentYear }"
              >
                {{ formatYear(year) }}
              </button>
                </div>
              </div>
            </div>

        <!-- Days Header -->
        <div class="days-head">
          <div class="days-head-cell" v-for="day in weekDays" :key="day">
            <span>{{ day }}</span>
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="days-body" :class="{ 'gregorian-calendar': selectedCalendarType === 'gregorian' }">
          <div
            class="day-cell"
            @click="selectDate(day)"
            @contextmenu.prevent="showContextMenu($event, day)"
            v-for="day in day_of_calendar"
            :key="`${day.year}-${day.month}-${day.day}`"
          >
            <div
              class="day-cell-item-inner"
              :class="{
                day_selected: day.isSelected,
                disableStyle: day.isOtherMonth,
                vacationStyle: day.isVacation,
                isToday: day.isToday
              }"
            >
              <span class="day-number" :dir="selectedCalendarType === 'gregorian' ? 'ltr' : 'rtl'">{{ day.displayDay }}</span>
      </div>
          </div>
        </div>

        <!-- Context Menu -->
        <div 
          class="context-menu" 
          v-if="contextMenu.visible"
          :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
          @click.stop
        >
          <div class="context-menu-item" @click="addReminderFromContext">
            <i class="fa fa-bell"></i>
            <span>افزودن یادآور</span>
          </div>
        </div>
        <div 
          class="context-menu-overlay" 
          v-if="contextMenu.visible"
          @click="hideContextMenu"
        ></div>

        <div class="go_today" @click="goToday()" v-if="show_go_today_btn">
          <button class="btn rounded-circle">
            <i class="fa fa-calendar"></i>
          </button>
        </div>
      </div>

      <!-- Date Details Sidebar -->
      <div class="dd-calendar">
        <div class="selected-date-header">
          <h3>تاریخ انتخاب شده</h3>
          </div>

        <div class="dd-calendar-in">
          <div class="calendar-in" v-if="selectedDate">
            <div class="calendar-label">شمسی (جلالی)</div>
            <span class="calendar-in-span">{{ selectedDate.jalali }}</span>
            <span class="calendar-in-span small_header">{{ selectedDate.jalaliNumeral }}</span>
          </div>
          <div class="calendar-in" v-if="selectedDate">
            <div class="calendar-label">میلادی</div>
            <span dir="ltr" class="calendar-in-span gregorian">{{ selectedDate.gregorian }}</span>
            <span class="calendar-in-span small_header gregorian">{{ selectedDate.gregorianNumeral }}</span>
          </div>
          <div class="calendar-in" v-if="selectedDate">
            <div class="calendar-label">قمری</div>
            <span class="calendar-in-span">{{ selectedDate.hijri }}</span>
            <span class="calendar-in-span small_header">{{ selectedDate.hijriNumeral }}</span>
        </div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--border-color); margin: 24px 0;">

        <!-- Events List -->
        <div class="events-section" v-if="events.length > 0">
          <h4 class="events-title">رویدادها</h4>
        <ul class="list-class-date">
            <li v-for="event in events" :key="event._id || event.Title">
              <div class="event-item">
                <i class="fa fa-calendar"></i>
                <span class="event-title">{{ event.Title }}</span>
                <span v-if="event.IsVacation === 1" class="event-vacation">تعطیل</span>
              </div>
          </li>
        </ul>
        </div>

        <div class="empty-events" v-else>
          <i class="fa fa-calendar-o"></i>
          <p>رویدادی برای این تاریخ ثبت نشده است</p>
        </div>

        <!-- Month Events Section -->
        <div class="month-events-section" v-if="monthEvents.length > 0">
          <h4 class="events-title">رویدادهای ماه</h4>
          <div class="month-events-list">
            <div 
              v-for="event in monthEvents" 
              :key="event._id || `${event.Day}-${event.Month}-${event.Title}`"
              class="month-event-item"
            >
              <span class="month-event-date">{{ event.Day }}</span>
              <span class="month-event-title">{{ event.Title }}</span>
              <span v-if="event.IsVacation === 1" class="month-event-vacation">تعطیل</span>
            </div>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--border-color); margin: 24px 0;">

        <!-- Day Reminders Section -->
        <div class="reminders-section" v-if="selectedDate">
          <h4 class="events-title">یادآورهای روز</h4>
          <div v-if="dayReminders.length > 0" class="reminders-list">
            <div 
              v-for="reminder in dayReminders" 
              :key="reminder._id"
              class="reminder-item"
            >
              <div class="reminder-item-header">
                <i class="fa fa-bell"></i>
                <span class="reminder-item-title">{{ reminder.title }}</span>
                <span v-if="reminder.time" class="reminder-item-time">
                  {{ formatReminderTime(reminder.time) }}
                </span>
              </div>
              <p v-if="reminder.description" class="reminder-item-description">{{ reminder.description }}</p>
            </div>
          </div>
          <div v-else class="empty-reminders">
            <i class="fa fa-bell-o"></i>
            <p>یادآوری برای این روز ثبت نشده است</p>
          </div>
        </div>

        <!-- Month Reminders Section -->
        <div class="reminders-section">
          <h4 class="events-title">یادآورهای ماه</h4>
          <div v-if="monthReminders.length > 0" class="reminders-list">
            <div 
              v-for="reminder in monthReminders" 
              :key="reminder._id"
              class="reminder-item"
            >
              <div class="reminder-item-header">
                <i class="fa fa-bell"></i>
                <span class="reminder-item-title">{{ reminder.title }}</span>
                <span class="reminder-item-date">{{ formatReminderDateShort(reminder) }}</span>
                <span v-if="reminder.time" class="reminder-item-time">
                  {{ formatReminderTime(reminder.time) }}
                </span>
              </div>
              <p v-if="reminder.description" class="reminder-item-description">{{ reminder.description }}</p>
            </div>
          </div>
          <div v-else class="empty-reminders">
            <i class="fa fa-bell-o"></i>
            <p>یادآوری برای این ماه ثبت نشده است</p>
          </div>
        </div>
      </div>
    </div>
    <sidebar/>
  </div>
</template>

<script>
import Sidebar from './Partials/Sidebar';
import find from "pouchdb-find";
import PouchDB from "pouchdb";
import ReminderService from '../services/ReminderService';

PouchDB.plugin(find);
const eventsDb = new PouchDB('events');

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      selectedCalendarType: 'jalali', // 'jalali', 'gregorian', 'hijri'
      calendarTypes: [
        { value: 'jalali', label: 'شمسی', icon: 'fa fa-sun-o' },
        { value: 'gregorian', label: 'میلادی', icon: 'fa fa-calendar' },
        { value: 'hijri', label: 'قمری', icon: 'fa fa-moon-o' }
      ],
      events: [],
      monthEvents: [], // All events for the current month
      vacations: [],
      // Current calendar state
      year: null,
      month: null,
      day: null,
      day_of_calendar: [],
      show_go_today_btn: false,
      selectedDate: null,
      showMonthPicker: false,
      showYearPicker: false,
      // Week days based on calendar type
      weekDays: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
      // Context menu
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        day: null
      },
      // Reminders
      dayReminders: [],
      monthReminders: []
    }
  },
  computed: {
    currentMonthTitle() {
      if (!this.year || !this.month) return '';
      
      if (this.selectedCalendarType === 'jalali') {
        const jalaliMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                             'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        return jalaliMonths[this.month - 1];
      } else if (this.selectedCalendarType === 'gregorian') {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[this.month - 1];
      } else {
        // Hijri
        const hijriMonths = ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانیه',
                            'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعده', 'ذوالحجه'];
        return hijriMonths[this.month - 1];
      }
    },
    currentYear() {
      return this.year || '';
    },
    availableMonths() {
      if (this.selectedCalendarType === 'jalali') {
        return ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
      } else if (this.selectedCalendarType === 'gregorian') {
        return ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
      } else {
        return ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانیه',
                'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعده', 'ذوالحجه'];
      }
    },
    availableYears() {
      const years = [];
      let currentYear;
      
      if (this.selectedCalendarType === 'jalali') {
        currentYear = new window.persianDate().year();
      } else if (this.selectedCalendarType === 'gregorian') {
        currentYear = new Date().getFullYear();
      } else {
        const today = new window.persianDate();
        const hijri = this.jalaliToHijri(today.year(), today.month(), today.date());
        currentYear = hijri.year;
      }
      
      const startYear = currentYear - 50;
      const endYear = currentYear + 50;
      
      for (let i = startYear; i <= endYear; i++) {
        years.push(i);
      }
      
      return years;
    }
  },
  mounted() {
    this.initCalendar();
    this.loadReminders();
  },
  methods: {
    initCalendar() {
      const today = new window.persianDate();
    this.year = today.year();
    this.month = today.month();
    this.day = today.date();
      this.selectedCalendarType = 'jalali';
      this.updateWeekDays();
      this.createCalendar();
      this.selectToday();
    },
    selectCalendarType(type) {
      if (this.selectedCalendarType === type) return;
      
      this.selectedCalendarType = type;
      this.updateWeekDays();
      
      // Convert current date to selected calendar
      if (type === 'jalali') {
        const today = new window.persianDate();
        this.year = today.year();
        this.month = today.month();
        this.day = today.date();
      } else if (type === 'gregorian') {
        const today = new window.persianDate();
        const greg = today.toCalendar('gregorian').toLocale('en');
        this.year = parseInt(greg.format('YYYY'));
        this.month = parseInt(greg.format('MM'));
        this.day = parseInt(greg.format('DD'));
      } else {
        // Hijri - use getCurrentHijriDate() directly for accurate date
        const hijri = this.getCurrentHijriDate();
        this.year = hijri.year;
        this.month = hijri.month;
        this.day = hijri.day;
      }
      
      this.createCalendar();
      this.selectToday();
    },
    updateWeekDays() {
      if (this.selectedCalendarType === 'gregorian') {
        this.weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      } else {
        this.weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
      }
    },
    async createCalendar() {
      this.day_of_calendar = [];
      
      if (this.selectedCalendarType === 'jalali') {
        await this.createJalaliCalendar();
      } else if (this.selectedCalendarType === 'gregorian') {
        await this.createGregorianCalendar();
      } else {
        await this.createHijriCalendar();
      }
      
      await this.findVacations();
      this.getMonthEvents();
    },
    async createJalaliCalendar() {
      const persianDate = new window.persianDate([this.year, this.month, 1]);
      const daysInMonth = persianDate.daysInMonth();
      const firstDayOfWeek = parseInt(persianDate.toLocale('en').format('d')); // 0 = Saturday, 6 = Friday
      
      // Get previous month days
      const prevMonth = persianDate.subtract('M', 1);
      const prevMonthDays = prevMonth.daysInMonth();
      
      // Add previous month days
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const date = new window.persianDate([prevMonth.year(), prevMonth.month(), day]);
        this.addDayToCalendar(date, true, false);
      }
      
      // Add current month days
      const today = new window.persianDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new window.persianDate([this.year, this.month, day]);
        const isToday = today.year() === this.year && today.month() === this.month && today.date() === day;
        this.addDayToCalendar(date, false, isToday);
      }
      
      // Add next month days to fill the grid
      const totalDays = this.day_of_calendar.length;
      const remainingDays = 42 - totalDays; // 6 weeks * 7 days
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = persianDate.add('M', 1);
        const date = new window.persianDate([nextMonth.year(), nextMonth.month(), day]);
        this.addDayToCalendar(date, true, false);
      }
    },
    async createGregorianCalendar() {
      const date = new Date(this.year, this.month - 1, 1);
      const firstDayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const daysInMonth = new Date(this.year, this.month, 0).getDate();
      
      // Adjust for Monday start (convert Sunday=0 to Monday=0)
      const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      
      // Get previous month days
      const prevMonth = new Date(this.year, this.month - 1, 0);
      const prevMonthDays = prevMonth.getDate();
      
      // Add previous month days
      for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dateObj = new Date(this.year, this.month - 2, day);
        this.addGregorianDayToCalendar(dateObj, true, false);
      }
      
      // Add current month days
      const today = new Date();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(this.year, this.month - 1, day);
        const isToday = today.getFullYear() === this.year && 
                       today.getMonth() === this.month - 1 && 
                       today.getDate() === day;
        this.addGregorianDayToCalendar(dateObj, false, isToday);
      }
      
      // Add next month days
      const totalDays = this.day_of_calendar.length;
      const remainingDays = 42 - totalDays;
      for (let day = 1; day <= remainingDays; day++) {
        const dateObj = new Date(this.year, this.month, day);
        this.addGregorianDayToCalendar(dateObj, true, false);
      }
    },
    async createHijriCalendar() {
      try {
        // Ensure moment is available
        if (!window.moment) {
          console.error('moment is not loaded');
          return;
        }
        
        // Check if moment-hijri is properly extended
        const testMoment = window.moment();
        if (typeof testMoment.iYear !== 'function') {
          console.error('moment-hijri is not properly extended. iYear method not found.');
          // Try to get current hijri date using fallback
          const currentHijri = this.getCurrentHijriDate();
          this.year = currentHijri.year;
          this.month = currentHijri.month;
        }
        
        // Validate year and month
        if (!this.year || !this.month || isNaN(this.year) || isNaN(this.month) || this.month < 1 || this.month > 12) {
          console.error('Invalid hijri year or month:', this.year, this.month);
          // Set default to today's hijri date
          const currentHijri = this.getCurrentHijriDate();
          this.year = currentHijri.year;
          this.month = currentHijri.month;
        }
        
        // Use moment-hijri for accurate calculation
        // moment-hijri extends moment, so we can use iYear, iMonth, iDaysInMonth, etc.
        let hijriDate;
        try {
          // Try creating hijri date with strict parsing
          hijriDate = window.moment(`${this.year}/${this.month}/1`, 'iYYYY/iM/iD', true);
          // If that doesn't work, try without strict parsing
          if (!hijriDate || !hijriDate.isValid()) {
            hijriDate = window.moment(`${this.year}/${this.month}/1`, 'iYYYY/iM/iD');
          }
        } catch (e) {
          console.error('Error creating hijri moment:', e);
          // Fallback: try to create a valid date
          const currentHijri = this.getCurrentHijriDate();
          this.year = currentHijri.year;
          this.month = currentHijri.month;
          try {
            hijriDate = window.moment(`${this.year}/${this.month}/1`, 'iYYYY/iM/iD', true);
            if (!hijriDate || !hijriDate.isValid()) {
              hijriDate = window.moment(`${this.year}/${this.month}/1`, 'iYYYY/iM/iD');
            }
          } catch (e2) {
            console.error('Error in fallback hijri moment creation:', e2);
          }
        }
        
        if (!hijriDate || !hijriDate.isValid()) {
          console.error('Invalid hijri date:', this.year, this.month);
          // Fallback: try to create a valid date using current hijri date
          const currentHijri = this.getCurrentHijriDate();
          this.year = currentHijri.year;
          this.month = currentHijri.month;
          try {
            hijriDate = window.moment(`${this.year}/${this.month}/1`, 'iYYYY/iM/iD', true);
            if (!hijriDate || !hijriDate.isValid()) {
              hijriDate = window.moment(`${this.year}/${this.month}/1`, 'iYYYY/iM/iD');
            }
            if (!hijriDate || !hijriDate.isValid()) {
              console.error('Cannot create valid hijri date');
              return;
            }
          } catch (e) {
            console.error('Final fallback failed:', e);
            return;
          }
        }
        
        // Verify hijri date has valid hijri components
        const hijriYear = hijriDate.iYear();
        const hijriMonth = hijriDate.iMonth() + 1; // iMonth is 0-based
        const hijriDay = hijriDate.iDate();
        
        if (isNaN(hijriYear) || isNaN(hijriMonth) || isNaN(hijriDay)) {
          console.error('Invalid hijri date components:', hijriYear, hijriMonth, hijriDay);
          return;
        }
        
        // Use static method iDaysInMonth(year, month) as fallback, or instance method
        let daysInMonth;
        if (typeof window.moment.iDaysInMonth === 'function') {
          // Try static method first (more reliable)
          daysInMonth = window.moment.iDaysInMonth(hijriYear, hijriMonth - 1); // month is 0-based for static method
        } else if (typeof hijriDate.iDaysInMonth === 'function') {
          // Fallback to instance method
          daysInMonth = hijriDate.iDaysInMonth();
        } else {
          console.error('iDaysInMonth method not available');
          return;
        }
        
        if (!daysInMonth || isNaN(daysInMonth) || daysInMonth < 29 || daysInMonth > 30) {
          console.error('Invalid days in month:', daysInMonth, 'for year:', hijriYear, 'month:', hijriMonth);
          // Try to get days using endOf month
          try {
            const endOfMonth = hijriDate.clone().endOf('iMonth');
            daysInMonth = parseInt(endOfMonth.format('iDD'));
            if (isNaN(daysInMonth) || daysInMonth < 29 || daysInMonth > 30) {
              console.error('Still invalid days in month after endOf:', daysInMonth);
              return;
            }
          } catch (e) {
            console.error('Error getting days in month:', e);
            return;
          }
        }
        
        // Convert hijri to gregorian to get day of week
        const gregMoment = hijriDate.clone().locale('en');
        const gregDateStr = gregMoment.format('YYYY-MM-DD');
        const gregDate = new Date(gregDateStr);
        
        if (isNaN(gregDate.getTime())) {
          console.error('Invalid gregorian date conversion:', gregDateStr);
          return;
        }
        
        const firstDayOfWeek = gregDate.getDay(); // 0=Sunday, 6=Saturday
        
        // Convert to Saturday=0 format (like jalali calendar)
        // Saturday = 6, Sunday = 0, Monday = 1, ..., Friday = 5
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        // Get previous month
        const prevMonth = hijriDate.clone().subtract(1, 'iMonth');
        const prevYear = prevMonth.iYear();
        const prevMonthNum = prevMonth.iMonth() + 1; // iMonth is 0-based
        
        let prevMonthDays;
        if (typeof window.moment.iDaysInMonth === 'function' && !isNaN(prevYear) && !isNaN(prevMonthNum)) {
          // Use static method (more reliable)
          prevMonthDays = window.moment.iDaysInMonth(prevYear, prevMonthNum - 1); // month is 0-based for static method
        } else if (typeof prevMonth.iDaysInMonth === 'function') {
          // Fallback to instance method
          prevMonthDays = prevMonth.iDaysInMonth();
        } else {
          // Last resort: use endOf month
          try {
            const endOfPrevMonth = prevMonth.clone().endOf('iMonth');
            prevMonthDays = parseInt(endOfPrevMonth.format('iDD'));
          } catch (e) {
            console.error('Error getting previous month days:', e);
            prevMonthDays = 30; // Default fallback
          }
        }
        
        if (isNaN(prevMonthDays) || prevMonthDays < 29 || prevMonthDays > 30) {
          prevMonthDays = 30; // Default fallback
        }
        
        // Add previous month days
        if (!isNaN(prevYear) && !isNaN(prevMonthNum)) {
          for (let i = adjustedFirstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            if (day > 0 && day <= prevMonthDays) {
              this.addHijriDayToCalendar(
                prevYear,
                prevMonthNum,
                day,
                true,
                false
              );
            }
          }
        }
        
        // Add current month days
        // Use getCurrentHijriDate() directly for accurate today's date
        const todayHijri = this.getCurrentHijriDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const isToday = todayHijri.year === this.year && 
                         todayHijri.month === this.month && 
                         todayHijri.day === day;
          this.addHijriDayToCalendar(this.year, this.month, day, false, isToday);
        }
        
        // Add next month days
        const totalDays = this.day_of_calendar.length;
        const remainingDays = 42 - totalDays;
        if (remainingDays > 0) {
          const nextMonth = hijriDate.clone().add(1, 'iMonth');
          const nextYear = nextMonth.iYear();
          const nextMonthNum = nextMonth.iMonth() + 1;
          if (!isNaN(nextYear) && !isNaN(nextMonthNum)) {
            for (let day = 1; day <= remainingDays; day++) {
              this.addHijriDayToCalendar(
                nextYear,
                nextMonthNum,
                day,
                true,
                false
              );
            }
          }
        }
      } catch (error) {
        console.error('Error creating hijri calendar:', error);
        console.error('Error details:', {
          year: this.year,
          month: this.month,
          error: error.message,
          stack: error.stack
        });
      }
    },
    addDayToCalendar(persianDate, isOtherMonth, isToday) {
      const day = persianDate.date();
      const month = persianDate.month();
      const year = persianDate.year();
      
      // Get equivalents for date selection (not displayed in calendar cells)
      const greg = persianDate.toCalendar('gregorian').toLocale('en');
      const hijri = this.jalaliToHijri(year, month, day);
      
      this.day_of_calendar.push({
        year,
        month,
        day,
        displayDay: day,
        isOtherMonth,
        isToday,
        isSelected: false,
        isVacation: false,
        jalaliDate: { year, month, day },
        gregorianDate: {
          year: parseInt(greg.format('YYYY')),
          month: parseInt(greg.format('MM')),
          day: parseInt(greg.format('DD'))
        },
        hijriDate: hijri
      });
    },
    addGregorianDayToCalendar(date, isOtherMonth, isToday) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Convert to jalali and hijri for date selection
      const persianDate = new window.persianDate(date);
      const jalali = {
        year: persianDate.year(),
        month: persianDate.month(),
        day: persianDate.date()
      };
      const hijri = this.jalaliToHijri(jalali.year, jalali.month, jalali.day);
      
      // For Gregorian calendar, ensure numbers are displayed in English
      const displayDay = this.selectedCalendarType === 'gregorian' ? String(day) : day;
      
      this.day_of_calendar.push({
        year,
        month,
        day,
        displayDay: displayDay,
        isOtherMonth,
        isToday,
        isSelected: false,
        isVacation: false,
        jalaliDate: jalali,
        gregorianDate: { year, month, day },
        hijriDate: hijri
      });
    },
    addHijriDayToCalendar(year, month, day, isOtherMonth, isToday) {
      try {
        // Validate input
        if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
          console.error('Invalid input for addHijriDayToCalendar:', year, month, day);
          return;
        }
        
        // Check if moment-hijri is available
        if (!window.moment) {
          console.error('moment is not available');
          return;
        }
        
        // Use moment-hijri for conversion
        const hijriMoment = window.moment(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
        
        if (!hijriMoment || !hijriMoment.isValid()) {
          console.error('Invalid hijri moment:', year, month, day);
          return;
        }
        
        // Convert hijri to gregorian using moment's date methods to avoid timezone issues
        const gregMoment = hijriMoment.clone().locale('en');
        const gregYear = gregMoment.year();
        const gregMonth = gregMoment.month() + 1; // month() is 0-based
        const gregDay = gregMoment.date();
        
        // Create date in local timezone
        const gregDate = new Date(gregYear, gregMonth - 1, gregDay);
        
        if (isNaN(gregDate.getTime())) {
          console.error('Invalid gregorian date:', gregYear, gregMonth, gregDay);
          return;
        }
        
        const greg = {
          year: gregYear,
          month: gregMonth,
          day: gregDay
        };
        
        // Create persian date from gregorian date object
        // persianDate can accept a Date object and will convert it correctly
        const persianDate = new window.persianDate(gregDate);
        const jalali = {
          year: persianDate.year(),
          month: persianDate.month(),
          day: persianDate.date()
        };
        
        this.day_of_calendar.push({
          year,
          month,
          day,
          displayDay: day,
          isOtherMonth,
          isToday,
          isSelected: false,
          isVacation: false,
          jalaliDate: jalali,
          gregorianDate: greg,
          hijriDate: { year, month, day }
        });
      } catch (error) {
        console.error('Error adding hijri day to calendar:', error, { year, month, day });
      }
    },
    selectDate(dayData) {
      // Reset previous selection
      this.day_of_calendar.forEach(d => d.isSelected = false);
      dayData.isSelected = true;
      
      // Update selected date info
      const jalaliDate = dayData.jalaliDate;
      const gregDate = dayData.gregorianDate;
      const hijriDate = dayData.hijriDate;
      
      // Format dates
      const jalaliPD = new window.persianDate([jalaliDate.year, jalaliDate.month, jalaliDate.day]);
      const gregPD = new window.persianDate(new Date(gregDate.year, gregDate.month - 1, gregDate.day));
      
      const jalaliMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
                           'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
      const gregorianMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
      
      this.selectedDate = {
        jalali: jalaliPD.format('D') + ' ' + jalaliMonths[jalaliDate.month - 1] + ' ' + jalaliPD.year(),
        jalaliNumeral: jalaliPD.format('YYYY/MM/DD'),
        gregorian: gregorianMonths[gregDate.month - 1] + ' ' + gregDate.day + ', ' + gregDate.year,
        gregorianNumeral: `${gregDate.year}/${String(gregDate.month).padStart(2, '0')}/${String(gregDate.day).padStart(2, '0')}`,
        hijri: this.formatHijriDate(hijriDate),
        hijriNumeral: `${hijriDate.year}/${String(hijriDate.month).padStart(2, '0')}/${String(hijriDate.day).padStart(2, '0')}`,
        jalaliDate: jalaliDate,
        gregorianDate: gregDate,
        hijriDate: hijriDate
      };
      
      this.getEvents(jalaliDate.year, jalaliDate.month, jalaliDate.day, hijriDate);
      this.getMonthEvents();
      this.loadDayReminders();
    },
    selectToday() {
      const today = new window.persianDate();
      let todayDay = null;
      
      if (this.selectedCalendarType === 'jalali') {
        todayDay = this.day_of_calendar.find(d => 
          !d.isOtherMonth && d.year === today.year() && d.month === today.month() && d.day === today.date()
        );
      } else if (this.selectedCalendarType === 'gregorian') {
        const now = new Date();
        todayDay = this.day_of_calendar.find(d => 
          !d.isOtherMonth && d.year === now.getFullYear() && d.month === now.getMonth() + 1 && d.day === now.getDate()
        );
      } else {
        // Use getCurrentHijriDate() directly for accurate today's date
        const hijri = this.getCurrentHijriDate();
        todayDay = this.day_of_calendar.find(d => 
          !d.isOtherMonth && d.year === hijri.year && d.month === hijri.month && d.day === hijri.day
        );
      }
      
      if (todayDay) {
        this.selectDate(todayDay);
      }
    },
    prevMonth() {
      this.show_go_today_btn = true;
      
      if (this.selectedCalendarType === 'jalali') {
        const prev = new window.persianDate([this.year, this.month, 1]).subtract('M', 1);
        this.year = prev.year();
        this.month = prev.month();
      } else if (this.selectedCalendarType === 'gregorian') {
        this.month--;
        if (this.month < 1) {
          this.month = 12;
          this.year--;
        }
      } else {
        this.month--;
        if (this.month < 1) {
          this.month = 12;
          this.year--;
        }
      }
      
      this.createCalendar();
      this.loadMonthReminders();
    },
    nextMonth() {
      this.show_go_today_btn = true;
      
      if (this.selectedCalendarType === 'jalali') {
        const next = new window.persianDate([this.year, this.month, 1]).add('M', 1);
        this.year = next.year();
        this.month = next.month();
      } else if (this.selectedCalendarType === 'gregorian') {
        this.month++;
        if (this.month > 12) {
          this.month = 1;
          this.year++;
        }
      } else {
        this.month++;
        if (this.month > 12) {
          this.month = 1;
          this.year++;
        }
      }
      
      this.createCalendar();
      this.loadMonthReminders();
    },
    goToday() {
      this.show_go_today_btn = false;
      
      // Go to today in the current calendar type
      if (this.selectedCalendarType === 'jalali') {
        const today = new window.persianDate();
        this.year = today.year();
        this.month = today.month();
        this.day = today.date();
      } else if (this.selectedCalendarType === 'gregorian') {
        const today = new Date();
        this.year = today.getFullYear();
        this.month = today.getMonth() + 1;
        this.day = today.getDate();
      } else {
        // Hijri - use getCurrentHijriDate() directly for accurate date
        const todayHijri = this.getCurrentHijriDate();
        this.year = todayHijri.year;
        this.month = todayHijri.month;
        this.day = todayHijri.day;
      }
      
      this.createCalendar();
      this.selectToday();
    },
    getEvents(year, month, day, hijriDate = null) {
      let self = this;
      self.events = [];
      const persian_date = new window.persianDate([year, month, day]);
      
      eventsDb.createIndex({
        index: { fields: ['Calendar', 'Day', 'Month'] }
      }).then(function () {
        // Persian events
        eventsDb.find({
          selector: {
            Calendar: 'PersianCalendar',
            Day: persian_date.date(),
            Month: persian_date.month()
          },
        }).then(function (result) {
          self.events = [...result.docs, ...self.events];
        }).catch(console.error);
        
        // Gregorian events
        const greg = persian_date.toCalendar('gregorian').toLocale('en');
        eventsDb.find({
          selector: {
            Calendar: 'GregorianCalendar',
            Day: parseInt(greg.format('D')),
            Month: parseInt(greg.format('M')),
          },
        }).then(function (result) {
          self.events = [...self.events, ...result.docs];
        }).catch(console.error);
        
        // Hijri events - use provided hijriDate if available, otherwise convert
        let hijri = hijriDate;
        if (!hijri || !hijri.year || !hijri.month || !hijri.day) {
          hijri = self.jalaliToHijri(year, month, day);
        }
        eventsDb.find({
          selector: {
            Calendar: 'ObservedHijriCalendar',
            Day: parseInt(fixNumbers(String(hijri.day))),
            Month: parseInt(fixNumbers(String(hijri.month))),
          },
        }).then(function (result) {
          self.events = [...self.events, ...result.docs];
        }).catch(console.error);
      });
    },
    getMonthEvents() {
      let self = this;
      self.monthEvents = [];
      
      // Get all events for the current month based on selected calendar type
      eventsDb.createIndex({
        index: { fields: ['Calendar', 'Day', 'Month'] }
      }).then(function () {
        if (self.selectedCalendarType === 'jalali') {
          // Persian calendar events
          eventsDb.find({
            selector: {
              Calendar: 'PersianCalendar',
              Month: self.month
            },
          }).then(function (result) {
            self.monthEvents = result.docs.sort((a, b) => a.Day - b.Day);
          }).catch(console.error);
        } else if (self.selectedCalendarType === 'gregorian') {
          // Gregorian calendar events
          eventsDb.find({
            selector: {
              Calendar: 'GregorianCalendar',
              Month: self.month
            },
          }).then(function (result) {
            self.monthEvents = result.docs.sort((a, b) => a.Day - b.Day);
          }).catch(console.error);
        } else {
          // Hijri calendar events
          eventsDb.find({
            selector: {
              Calendar: 'ObservedHijriCalendar',
              Month: self.month
            },
          }).then(function (result) {
            self.monthEvents = result.docs.sort((a, b) => a.Day - b.Day);
          }).catch(console.error);
        }
      });
    },
    async findVacations() {
      // Mark Fridays and known vacations
      for (const day of this.day_of_calendar) {
        if (day.isOtherMonth) continue;
        
        const jalaliDate = day.jalaliDate;
        const persianDate = new window.persianDate([jalaliDate.year, jalaliDate.month, jalaliDate.day]);
        
        // Check if Friday
        if (persianDate.format('dddd') === 'جمعه') {
          day.isVacation = true;
        }
      }
    },
    jalaliToHijri(year, month, day) {
      try {
        // Validate input
        if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
          console.error('Invalid input for jalaliToHijri:', year, month, day);
          // Return current hijri date using moment directly
          return this.getCurrentHijriDate();
        }
        
        // Check if moment-hijri is properly extended
        if (!window.moment || typeof window.moment().iYear !== 'function') {
          console.error('moment-hijri is not properly extended');
          return this.getCurrentHijriDate();
        }
        
        // Convert jalali to gregorian without subtract to avoid date offset issues
        const gregorian_date = new window.persianDate([year, month, day]).toCalendar('gregorian').toLocale('en');
        const gregYear = parseInt(gregorian_date.format("YYYY"));
        const gregMonth = parseInt(gregorian_date.format("MM"));
        const gregDay = parseInt(gregorian_date.format("DD"));
        
        // Create date in local timezone to avoid UTC issues
        const gregDate = new Date(gregYear, gregMonth - 1, gregDay);
        
        if (isNaN(gregDate.getTime())) {
          console.error('Invalid gregorian date:', gregYear, gregMonth, gregDay);
          return this.getCurrentHijriDate();
        }
        
        // Use moment with the date object, ensuring local timezone
        const hijri = window.moment(gregDate);
        
        if (!hijri || !hijri.isValid()) {
          console.error('Invalid hijri conversion for:', year, month, day);
          return this.getCurrentHijriDate();
        }
        
        // Check if hijri methods are available
        if (typeof hijri.iYear !== 'function' || typeof hijri.format !== 'function') {
          console.error('moment-hijri methods not available');
          return this.getCurrentHijriDate();
        }
        
        const hijriYear = hijri.iYear();
        const hijriMonth = hijri.iMonth() + 1; // iMonth is 0-based
        const hijriDay = hijri.iDate();
        
        // Validate result
        if (isNaN(hijriYear) || isNaN(hijriMonth) || isNaN(hijriDay) || hijriYear < 1 || hijriMonth < 1 || hijriMonth > 12 || hijriDay < 1 || hijriDay > 30) {
          console.error('Invalid hijri conversion result:', hijriYear, hijriMonth, hijriDay);
          return this.getCurrentHijriDate();
        }
        
        return {
          year: hijriYear,
          month: hijriMonth,
          day: hijriDay
        };
      } catch (error) {
        console.error('Error converting jalali to hijri:', error);
        return this.getCurrentHijriDate();
      }
    },
    getCurrentHijriDate() {
      try {
        if (!window.moment) {
          return { year: 1445, month: 1, day: 1 };
        }
        
        // Use moment() to get current date/time, then set to start of day to avoid timezone issues
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const hijriMoment = window.moment(today).startOf('day');
        
        if (!hijriMoment || !hijriMoment.isValid()) {
          return { year: 1445, month: 1, day: 1 };
        }
        
        // Check if moment-hijri is properly extended
        if (typeof hijriMoment.iYear === 'function') {
          const hijriYear = hijriMoment.iYear();
          const hijriMonth = hijriMoment.iMonth() + 1;
          const hijriDay = hijriMoment.iDate();
          
          // Validate the result
          if (!isNaN(hijriYear) && !isNaN(hijriMonth) && !isNaN(hijriDay) && 
              hijriYear > 0 && hijriMonth > 0 && hijriMonth <= 12 && hijriDay > 0 && hijriDay <= 30) {
            return {
              year: hijriYear,
              month: hijriMonth,
              day: hijriDay
            };
          }
        }
        
        // Fallback: try format method
        try {
          const year = parseInt(hijriMoment.format('iYYYY'));
          const month = parseInt(hijriMoment.format('iM'));
          const day = parseInt(hijriMoment.format('iD'));
          
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && 
              year > 0 && month > 0 && month <= 12 && day > 0 && day <= 30) {
            return { year, month, day };
          }
        } catch (e) {
          console.error('Error formatting hijri date:', e);
        }
        
        return { year: 1445, month: 1, day: 1 };
      } catch (error) {
        console.error('Error getting current hijri date:', error);
        return { year: 1445, month: 1, day: 1 };
      }
    },
    getHijriMonthDays(year, month) {
      // Calculate hijri month days using moment-hijri
      const hijriDate = window.moment(`${year}/${month}/1`, 'iYYYY/iM/iD');
      const daysInMonth = hijriDate.iDaysInMonth();
      return daysInMonth;
    },
    formatHijriDate(hijri) {
      const months = ['محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانیه',
                     'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعده', 'ذوالحجه'];
      return `${hijri.day} ${months[hijri.month - 1]} ${hijri.year}`;
    },
    selectMonth(monthIndex) {
      this.month = monthIndex;
      this.showMonthPicker = false;
      this.createCalendar();
      this.selectToday();
    },
    selectYear(year) {
      this.year = year;
      this.showYearPicker = false;
      this.createCalendar();
      this.selectToday();
    },
    formatYear(year) {
      // For Gregorian calendar, ensure year is displayed in English numerals
      if (this.selectedCalendarType === 'gregorian') {
        return String(year);
      }
      return year;
    },
    showContextMenu(event, day) {
      this.contextMenu.visible = true;
      this.contextMenu.x = event.clientX;
      this.contextMenu.y = event.clientY;
      this.contextMenu.day = day;
    },
    hideContextMenu() {
      this.contextMenu.visible = false;
      this.contextMenu.day = null;
    },
    addReminderFromContext() {
      if (!this.contextMenu.day) {
        this.hideContextMenu();
        return;
      }

      const day = this.contextMenu.day;
      let dateData = {};
      
      // Get date based on selected calendar type
      if (this.selectedCalendarType === 'jalali') {
        dateData = {
          calendar: 'jalali',
          year: day.jalaliDate.year,
          month: day.jalaliDate.month,
          day: day.jalaliDate.day
        };
      } else if (this.selectedCalendarType === 'gregorian') {
        dateData = {
          calendar: 'gregorian',
          year: day.gregorianDate.year,
          month: day.gregorianDate.month,
          day: day.gregorianDate.day
        };
      } else {
        dateData = {
          calendar: 'hijri',
          year: day.hijriDate.year,
          month: day.hijriDate.month,
          day: day.hijriDate.day
        };
      }

      // Navigate to reminders page with query parameters
      this.$router.push({
        name: 'reminders',
        query: dateData
      });

      this.hideContextMenu();
    },
    async loadReminders() {
      try {
        await this.loadDayReminders();
        await this.loadMonthReminders();
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    },
    async loadDayReminders() {
      if (!this.selectedDate) {
        this.dayReminders = [];
        return;
      }

      try {
        const allReminders = await ReminderService.getAll();
        this.dayReminders = [];

        // Check reminders for the selected date in all calendar types
        for (const reminder of allReminders) {
          if (!reminder.enabled) continue;

          let matches = false;

          if (reminder.calendar === 'jalali') {
            matches = reminder.date.year === this.selectedDate.jalaliDate.year &&
                     reminder.date.month === this.selectedDate.jalaliDate.month &&
                     reminder.date.day === this.selectedDate.jalaliDate.day;
          } else if (reminder.calendar === 'gregorian') {
            matches = reminder.date.year === this.selectedDate.gregorianDate.year &&
                     reminder.date.month === this.selectedDate.gregorianDate.month &&
                     reminder.date.day === this.selectedDate.gregorianDate.day;
          } else if (reminder.calendar === 'hijri') {
            matches = reminder.date.year === this.selectedDate.hijriDate.year &&
                     reminder.date.month === this.selectedDate.hijriDate.month &&
                     reminder.date.day === this.selectedDate.hijriDate.day;
          }

          if (matches) {
            this.dayReminders.push(reminder);
          }
        }
      } catch (error) {
        console.error('Error loading day reminders:', error);
        this.dayReminders = [];
      }
    },
    async loadMonthReminders() {
      try {
        const allReminders = await ReminderService.getAll();
        this.monthReminders = [];

        // Get current month based on selected calendar type
        let currentYear, currentMonth;

        if (this.selectedCalendarType === 'jalali') {
          currentYear = this.year;
          currentMonth = this.month;
        } else if (this.selectedCalendarType === 'gregorian') {
          currentYear = this.year;
          currentMonth = this.month;
        } else {
          currentYear = this.year;
          currentMonth = this.month;
        }

        // Filter reminders for current month
        for (const reminder of allReminders) {
          if (!reminder.enabled) continue;

          // Convert reminder date to current calendar type for comparison
          let reminderYear, reminderMonth;

          if (reminder.calendar === this.selectedCalendarType) {
            reminderYear = reminder.date.year;
            reminderMonth = reminder.date.month;
          } else {
            // Need to convert
            if (this.selectedCalendarType === 'jalali') {
              if (reminder.calendar === 'gregorian') {
                const gregDate = new Date(reminder.date.year, reminder.date.month - 1, reminder.date.day);
                const jalali = new window.persianDate(gregDate);
                reminderYear = jalali.year();
                reminderMonth = jalali.month();
              } else if (reminder.calendar === 'hijri') {
                // Convert hijri to jalali
                const gregDate = this.hijriToGregorian(reminder.date);
                const jalali = new window.persianDate(gregDate);
                reminderYear = jalali.year();
                reminderMonth = jalali.month();
              }
            } else if (this.selectedCalendarType === 'gregorian') {
              if (reminder.calendar === 'jalali') {
                const persianDate = new window.persianDate([reminder.date.year, reminder.date.month, reminder.date.day]);
                const greg = persianDate.toCalendar('gregorian').toLocale('en');
                reminderYear = parseInt(greg.format('YYYY'));
                reminderMonth = parseInt(greg.format('MM'));
              } else if (reminder.calendar === 'hijri') {
                const gregDate = this.hijriToGregorian(reminder.date);
                reminderYear = gregDate.getFullYear();
                reminderMonth = gregDate.getMonth() + 1;
              }
            } else {
              // Hijri calendar
              if (reminder.calendar === 'jalali') {
                const hijri = this.jalaliToHijri(reminder.date.year, reminder.date.month, reminder.date.day);
                reminderYear = hijri.year;
                reminderMonth = hijri.month;
              } else if (reminder.calendar === 'gregorian') {
                const gregDate = new Date(reminder.date.year, reminder.date.month - 1, reminder.date.day);
                const hijri = this.gregorianToHijri(gregDate);
                reminderYear = hijri.year;
                reminderMonth = hijri.month;
              }
            }
          }

          if (reminderYear === currentYear && reminderMonth === currentMonth) {
            this.monthReminders.push(reminder);
          }
        }

        // Sort by day
        this.monthReminders.sort((a, b) => {
          const dayA = a.date.day || 0;
          const dayB = b.date.day || 0;
          return dayA - dayB;
        });
      } catch (error) {
        console.error('Error loading month reminders:', error);
        this.monthReminders = [];
      }
    },
    hijriToGregorian(hijriDate) {
      if (!window.moment) {
        return new Date();
      }
      const hijriMoment = window.moment(`${hijriDate.year}/${hijriDate.month}/${hijriDate.day}`, 'iYYYY/iM/iD');
      const gregMoment = hijriMoment.clone().locale('en');
      return new Date(gregMoment.year(), gregMoment.month(), gregMoment.date());
    },
    gregorianToHijri(gregDate) {
      if (!window.moment) {
        return { year: 1445, month: 1, day: 1 };
      }
      const hijriMoment = window.moment(gregDate);
      return {
        year: hijriMoment.iYear(),
        month: hijriMoment.iMonth() + 1,
        day: hijriMoment.iDate()
      };
    },
    formatReminderTime(time) {
      const hour = String(time.hour).padStart(2, '0');
      const minute = String(time.minute).padStart(2, '0');
      return `${hour}:${minute}`;
    },
    formatReminderDateShort(reminder) {
      return `${reminder.date.day}/${reminder.date.month}`;
    }
  },
  watch: {
    showYearPicker(newVal) {
      if (newVal && this.$refs.yearsScroll) {
        this.$nextTick(() => {
          // Scroll to current year
          const currentYearBtn = this.$refs.yearsScroll.querySelector(`.year-btn.active`);
          if (currentYearBtn) {
            currentYearBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    }
  },
  beforeDestroy() {
    // Hide context menu when component is destroyed
    this.hideContextMenu();
  }
}
</script>

<style>
.date-table {
  width: 60%;
  padding: 20px;
  position: relative;
  cursor: default;
}

.calendar-type-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.type-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.type-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  box-shadow: var(--shadow-sm);
}

.date-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.month-last,
.month-next {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
  user-select: none;
}

.month-last:hover,
.month-next:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.month-now {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.month-selector,
.year-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.month-selector:hover,
.year-selector:hover {
  background: var(--bg-tertiary);
}

.month-selector {
  margin-right: auto;
}

.year-selector {
  margin-left: auto;
  flex-direction: row-reverse;
}

.month-title {
  font-size: 20px;
  color: var(--text-primary);
  font-weight: 700;
}

.month-year {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.days-head {
  width: 100%;
  height: 48px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  margin-bottom: 12px;
  border: 1px solid var(--border-color);
}

.days-head-cell {
  flex: 1;
  height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.days-head-cell span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  user-select: none;
}

.days-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
}

.day-cell-item-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  position: relative;
  padding: 4px;
}

.day-cell-item-inner:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.day-cell-item-inner.day_selected {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.day-cell-item-inner.isToday {
  border: 2px solid var(--accent-color);
}

.day-cell-item-inner.day_selected .day-number {
  color: white;
  font-weight: 700;
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  user-select: none;
  font-variant-numeric: tabular-nums;
}

/* Ensure English numerals for Gregorian calendar */
.gregorian-calendar .day-number {
  font-variant-numeric: normal;
  font-feature-settings: normal;
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
}

.day-sub-dates {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 2px;
  padding: 0 4px;
  gap: 4px;
}

.equivalent-date {
  font-size: 9px;
  color: var(--text-muted);
  font-weight: 400;
}

.day-cell-item-inner.day_selected .equivalent-date {
  color: rgba(255, 255, 255, 0.8);
}

.disableStyle {
  opacity: 0.3;
}

.vacationStyle .day-number {
  color: var(--danger-color) !important;
}

.dd-calendar {
  position: relative;
  background: var(--bg-secondary);
  padding: 24px;
  width: 40%;
  border-right: 1px solid var(--border-color);
  height: 100vh;
  overflow-y: auto;
}

.selected-date-header {
  margin-bottom: 24px;
}

.selected-date-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.dd-calendar-in {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.calendar-in {
  text-align: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.calendar-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.calendar-in-span {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 8px;
  line-height: 1.4;
}

.calendar-in-span.small_header {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 8px;
  font-family: 'Courier New', monospace;
}

.events-section {
  margin-top: 24px;
}

.events-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.list-class-date {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-class-date li {
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.list-class-date li:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(-4px);
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-item i {
  color: var(--accent-color);
  font-size: 16px;
}

.event-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.event-vacation {
  font-size: 12px;
  color: var(--danger-color);
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
}

.month-events-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.month-events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.month-event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.month-event-item:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(-2px);
}

.month-event-date {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--accent-color);
  background: var(--accent-light);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.month-event-title {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

.month-event-vacation {
  font-size: 11px;
  color: var(--accent-color);
  background: var(--accent-light);
  padding: 3px 6px;
  border-radius: var(--radius-sm);
}

.empty-events {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-events i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-events p {
  font-size: 14px;
  margin: 0;
}

.go_today {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

.go_today button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.go_today button:hover {
  background: var(--accent-hover);
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.gregorian {
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
}

.date-picker-icon {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  transition: transform 0.2s;
}


.date-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.date-picker-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.date-picker-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  text-align: center;
}

.month-picker-content {
  max-width: 400px;
  width: 90%;
}

.year-picker-content {
  max-width: 300px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.month-btn {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
}

.month-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
}

.month-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.years-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.year-btn {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: center;
  margin-bottom: 4px;
}

.year-btn:hover {
  background: var(--bg-tertiary);
}

.year-btn.active {
  background: var(--accent-color);
  color: white;
}

.years-scroll::-webkit-scrollbar {
  width: 6px;
}

.years-scroll::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.years-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.years-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.reminders-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reminder-item {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.reminder-item:hover {
  box-shadow: var(--shadow-sm);
  transform: translateX(-2px);
}

.reminder-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.reminder-item-header i {
  color: var(--accent-color);
  font-size: 16px;
  width: 16px;
  text-align: center;
}

.reminder-item-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.reminder-item-date {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.reminder-item-time {
  font-size: 12px;
  color: var(--accent-color);
  background: var(--accent-light);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.reminder-item-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  margin-top: 8px;
}

.empty-reminders {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-secondary);
}

.empty-reminders i {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.3;
}

.empty-reminders p {
  font-size: 13px;
  margin: 0;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

.context-menu {
  position: fixed;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 180px;
  padding: 4px;
  direction: rtl;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.context-menu-item:hover {
  background: var(--bg-tertiary);
}

.context-menu-item i {
  color: var(--accent-color);
  width: 16px;
  text-align: center;
}
</style>
