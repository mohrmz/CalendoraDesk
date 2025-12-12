<template>
  <div id="wrapper">
    <div class="dashboard">
      <div class="page-header">
        <h2 class="page-title">یادآورها</h2>
        <button class="btn-primary" @click="showAddModal = true">
          <i class="fa fa-plus"></i>
          یادآور جدید
        </button>
      </div>

      <div class="reminders-grid" v-if="reminders.length > 0">
        <div
          v-for="reminder in reminders"
          :key="reminder._id"
          class="reminder-card"
          :class="{ disabled: !reminder.enabled }"
        >
          <div class="reminder-header">
            <h3 class="reminder-title">{{ reminder.title }}</h3>
            <div class="reminder-actions">
              <button class="icon-btn" @click="editReminder(reminder)" title="ویرایش">
                <i class="fa fa-edit"></i>
              </button>
              <button class="icon-btn danger" @click="deleteReminder(reminder._id)" title="حذف">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="reminder-description" v-if="reminder.description">
            {{ reminder.description }}
          </p>
          <div class="reminder-meta">
            <span class="reminder-date">
              <i class="fa fa-calendar"></i>
              {{ formatReminderDate(reminder) }}
            </span>
            <span class="reminder-time" v-if="reminder.time">
              <i class="fa fa-clock-o"></i>
              {{ formatTime(reminder.time) }}
            </span>
            <span class="reminder-status" :class="{ active: reminder.enabled }">
              {{ reminder.enabled ? 'فعال' : 'غیرفعال' }}
            </span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <i class="fa fa-bell-o"></i>
        <p>هیچ یادآوری ثبت نشده است</p>
        <button class="btn-primary" @click="showAddModal = true">
          ایجاد اولین یادآور
        </button>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" v-if="showAddModal || editingReminder" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ editingReminder ? 'ویرایش یادآور' : 'یادآور جدید' }}</h3>
            <button class="icon-btn" @click="closeModal">
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>عنوان</label>
              <input
                type="text"
                v-model="formData.title"
                placeholder="عنوان یادآور"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>توضیحات (اختیاری)</label>
              <textarea
                v-model="formData.description"
                placeholder="توضیحات یادآور"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>نوع تقویم</label>
              <select v-model="formData.calendar" class="form-control">
                <option value="jalali">شمسی (جلالی)</option>
                <option value="gregorian">میلادی</option>
                <option value="hijri">قمری</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>سال</label>
                <input
                  type="number"
                  v-model.number="formData.date.year"
                  class="form-control"
                  :placeholder="getYearPlaceholder()"
                  @input="formData.date.day = null"
                />
              </div>
              <div class="form-group">
                <label>ماه</label>
                <select v-model.number="formData.date.month" class="form-control" @change="formData.date.day = null">
                  <option :value="null">انتخاب کنید</option>
                  <option v-for="(month, index) in getMonths()" :key="index" :value="index + 1">
                    {{ month }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>روز</label>
                <select v-model.number="formData.date.day" class="form-control">
                  <option :value="null">انتخاب کنید</option>
                  <option v-for="d in getDaysInMonth()" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>ساعت (اختیاری)</label>
                <select
                  v-model.number="formData.time.hour"
                  class="form-control"
                >
                  <option :value="null">انتخاب نشده</option>
                  <option v-for="h in 24" :key="h" :value="h">{{ h }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>دقیقه (اختیاری)</label>
                <select
                  v-model.number="formData.time.minute"
                  class="form-control"
                >
                  <option :value="null">انتخاب نشده</option>
                  <option v-for="m in 60" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.enabled" />
                <span>فعال</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">انصراف</button>
            <button class="btn-primary" @click="saveReminder">
              {{ editingReminder ? 'ذخیره تغییرات' : 'ایجاد' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script>
import Sidebar from '../Partials/Sidebar.vue'
import ReminderService from '../../services/ReminderService'

export default {
  name: 'Reminders',
  components: {
    Sidebar
  },
  data() {
    return {
      reminders: [],
      showAddModal: false,
      editingReminder: null,
      formData: {
        title: '',
        description: '',
        calendar: 'jalali',
        date: {
          year: null,
          month: null,
          day: null
        },
        time: {
          hour: null,
          minute: null
        },
        enabled: true
      }
    }
  },
  mounted() {
    this.loadReminders()
    this.initFormData()
    this.checkQueryParams()
  },
  methods: {
    async loadReminders() {
      try {
        this.reminders = await ReminderService.getAll()
        this.reminders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateB - dateA
        })
      } catch (error) {
        console.error('Error loading reminders:', error)
        this.$root.$emit('show-notification', {
          type: 'error',
          title: 'خطا',
          message: 'خطا در بارگذاری یادآورها'
        })
      }
    },
    initFormData() {
      const today = new window.persianDate()
      this.formData.date = {
        year: today.year(),
        month: today.month(),
        day: today.date()
      }
    },
    async saveReminder() {
      if (!this.formData.title.trim()) {
        this.$root.$emit('show-notification', {
          type: 'warning',
          title: 'هشدار',
          message: 'لطفا عنوان را وارد کنید'
        })
        return
      }

      if (!this.formData.date.year || !this.formData.date.month || !this.formData.date.day) {
        this.$root.$emit('show-notification', {
          type: 'warning',
          title: 'هشدار',
          message: 'لطفا تاریخ را کامل وارد کنید'
        })
        return
      }

      try {
        const reminderData = {
          title: this.formData.title,
          description: this.formData.description,
          calendar: this.formData.calendar,
          date: { ...this.formData.date },
          time: this.formData.time.hour !== null && this.formData.time.minute !== null
            ? { hour: this.formData.time.hour, minute: this.formData.time.minute }
            : null,
          enabled: this.formData.enabled
        }

        if (this.editingReminder) {
          await ReminderService.update(this.editingReminder._id, reminderData)
          this.$root.$emit('show-notification', {
            type: 'success',
            title: 'موفق',
            message: 'یادآور با موفقیت ویرایش شد'
          })
        } else {
          await ReminderService.create(reminderData)
          this.$root.$emit('show-notification', {
            type: 'success',
            title: 'موفق',
            message: 'یادآور با موفقیت ایجاد شد'
          })
        }

        this.closeModal()
        this.loadReminders()
      } catch (error) {
        console.error('Error saving reminder:', error)
        this.$root.$emit('show-notification', {
          type: 'error',
          title: 'خطا',
          message: 'خطا در ذخیره یادآور'
        })
      }
    },
    editReminder(reminder) {
      this.editingReminder = reminder
      this.formData = {
        title: reminder.title,
        description: reminder.description || '',
        calendar: reminder.calendar || 'jalali',
        date: { ...reminder.date },
        time: reminder.time ? { ...reminder.time } : { hour: null, minute: null },
        enabled: reminder.enabled !== false
      }
      this.showAddModal = true
    },
    async deleteReminder(id) {
      if (!confirm('آیا از حذف این یادآور اطمینان دارید؟')) {
        return
      }

      try {
        await ReminderService.delete(id)
        this.$root.$emit('show-notification', {
          type: 'success',
          title: 'موفق',
          message: 'یادآور با موفقیت حذف شد'
        })
        this.loadReminders()
      } catch (error) {
        console.error('Error deleting reminder:', error)
        this.$root.$emit('show-notification', {
          type: 'error',
          title: 'خطا',
          message: 'خطا در حذف یادآور'
        })
      }
    },
    closeModal() {
      this.showAddModal = false
      this.editingReminder = null
      this.initFormData()
      this.formData.title = ''
      this.formData.description = ''
    },
    formatReminderDate(reminder) {
      const date = reminder.date
      if (reminder.calendar === 'jalali') {
        const persianDate = new window.persianDate([date.year, date.month, date.day])
        return persianDate.format('D MMMM YYYY')
      } else if (reminder.calendar === 'gregorian') {
        return `${date.year}/${date.month}/${date.day}`
      } else {
        return `${date.year}/${date.month}/${date.day}`
      }
    },
    formatTime(time) {
      const hour = String(time.hour).padStart(2, '0')
      const minute = String(time.minute).padStart(2, '0')
      return `${hour}:${minute}`
    },
    getMonths() {
      if (this.formData.calendar === 'jalali') {
        return [
          'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
          'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ]
      } else if (this.formData.calendar === 'gregorian') {
        return [
          'ژانویه', 'فوریه', 'مارس', 'آوریل', 'می', 'ژوئن',
          'جولای', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
        ]
      } else {
        return [
          'محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی', 'جمادی الاول', 'جمادی الثانیه',
          'رجب', 'شعبان', 'رمضان', 'شوال', 'ذوالقعده', 'ذوالحجه'
        ]
      }
    },
    getYearPlaceholder() {
      if (this.formData.calendar === 'jalali') {
        return new window.persianDate().year()
      } else if (this.formData.calendar === 'gregorian') {
        return new Date().getFullYear()
      } else {
        return '1445'
      }
    },
    getDaysInMonth() {
      if (!this.formData.date.month || !this.formData.date.year) {
        return []
      }

      let daysInMonth = 31

      if (this.formData.calendar === 'jalali') {
        // شمسی: 6 ماه اول 31 روز، 5 ماه بعدی 30 روز، اسفند 29 یا 30 روز (کبیسه)
        const persianDate = new window.persianDate([this.formData.date.year, this.formData.date.month, 1])
        daysInMonth = persianDate.daysInMonth()
      } else if (this.formData.calendar === 'gregorian') {
        // میلادی: استفاده از Date
        const date = new Date(this.formData.date.year, this.formData.date.month, 0)
        daysInMonth = date.getDate()
      } else {
        // قمری: استفاده از moment-hijri
        if (window.moment && typeof window.moment === 'function') {
          try {
            const hijriDate = window.moment(`${this.formData.date.year}/${this.formData.date.month}/1`, 'iYYYY/iM/iD')
            if (hijriDate && hijriDate.isValid()) {
              if (typeof window.moment.iDaysInMonth === 'function') {
                daysInMonth = window.moment.iDaysInMonth(this.formData.date.year, this.formData.date.month - 1)
              } else if (typeof hijriDate.iDaysInMonth === 'function') {
                daysInMonth = hijriDate.iDaysInMonth()
              } else {
                const endOfMonth = hijriDate.clone().endOf('iMonth')
                daysInMonth = parseInt(endOfMonth.format('iDD'))
              }
            }
          } catch (e) {
            console.error('Error calculating hijri days:', e)
            daysInMonth = 30 // Default for hijri
          }
        } else {
          daysInMonth = 30 // Default for hijri
        }
      }

      // Generate array of days
      const days = []
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }
      return days
    },
    getMaxDays() {
      const days = this.getDaysInMonth()
      return days.length > 0 ? days.length : 31
    },
    checkQueryParams() {
      const query = this.$route.query
      if (query.calendar && query.year && query.month && query.day) {
        // Set calendar type
        this.formData.calendar = query.calendar
        
        // Set date
        this.formData.date = {
          year: parseInt(query.year),
          month: parseInt(query.month),
          day: parseInt(query.day)
        }
        
        // Open modal
        this.showAddModal = true
        
        // Clear query parameters after using them
        this.$nextTick(() => {
          this.$router.replace({ query: {} })
        })
      }
    }
  },
  watch: {
    '$route.query': {
      handler() {
        this.checkQueryParams()
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.reminders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 20px;
}

.reminder-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all 0.2s;
}

.reminder-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.reminder-card.disabled {
  opacity: 0.6;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.reminder-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.reminder-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.icon-btn.danger:hover {
  background: var(--danger-color);
  color: white;
}

.reminder-description {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.reminder-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.reminder-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reminder-status {
  margin-right: auto;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  font-size: 12px;
}

.reminder-status.active {
  background: var(--success-color);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 24px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-secondary {
  padding: 10px 20px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--border-color);
}
</style>

