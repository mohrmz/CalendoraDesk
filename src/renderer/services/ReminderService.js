import PouchDB from 'pouchdb'
import find from 'pouchdb-find'
import NotificationService from './NotificationService'

PouchDB.plugin(find)
const remindersDb = new PouchDB('reminders')

class ReminderService {
  constructor() {
    this.checkInterval = null
    this.startChecking()
  }

  /**
   * Create a new reminder
   * @param {Object} reminder - Reminder data
   */
  async create(reminder) {
    try {
      const doc = {
        _id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: reminder.title,
        description: reminder.description || '',
        date: reminder.date, // Jalali date: {year, month, day}
        time: reminder.time || null, // {hour, minute}
        calendar: reminder.calendar || 'jalali', // 'jalali', 'gregorian', 'hijri'
        enabled: reminder.enabled !== false,
        createdAt: new Date().toISOString(),
        notified: false
      }
      const result = await remindersDb.put(doc)
      return { ...doc, _rev: result.rev }
    } catch (error) {
      console.error('Error creating reminder:', error)
      throw error
    }
  }

  /**
   * Get all reminders
   */
  async getAll() {
    try {
      const result = await remindersDb.allDocs({ include_docs: true })
      return result.rows.map(row => row.doc).filter(doc => !doc._deleted)
    } catch (error) {
      console.error('Error fetching reminders:', error)
      throw error
    }
  }

  /**
   * Get reminders for a specific date
   * @param {Object} date - Date object {year, month, day, calendar}
   */
  async getByDate(date) {
    try {
      const result = await remindersDb.find({
        selector: {
          'date.year': date.year,
          'date.month': date.month,
          'date.day': date.day,
          calendar: date.calendar || 'jalali',
          enabled: true
        }
      })
      return result.docs
    } catch (error) {
      console.error('Error fetching reminders by date:', error)
      return []
    }
  }

  /**
   * Update a reminder
   * @param {String} id - Reminder ID
   * @param {Object} updates - Updates to apply
   */
  async update(id, updates) {
    try {
      const doc = await remindersDb.get(id)
      const updatedDoc = {
        ...doc,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      const result = await remindersDb.put(updatedDoc)
      return { ...updatedDoc, _rev: result.rev }
    } catch (error) {
      console.error('Error updating reminder:', error)
      throw error
    }
  }

  /**
   * Delete a reminder
   * @param {String} id - Reminder ID
   */
  async delete(id) {
    try {
      const doc = await remindersDb.get(id)
      await remindersDb.remove(doc)
      return true
    } catch (error) {
      console.error('Error deleting reminder:', error)
      throw error
    }
  }

  /**
   * Convert Jalali date to Gregorian for comparison
   */
  jalaliToGregorian(jalaliDate) {
    const persianDate = new window.persianDate([jalaliDate.year, jalaliDate.month, jalaliDate.day])
    const gregorian = persianDate.toCalendar('gregorian').toLocale('en')
    return {
      year: parseInt(gregorian.format('YYYY')),
      month: parseInt(gregorian.format('MM')),
      day: parseInt(gregorian.format('DD'))
    }
  }

  /**
   * Check if reminder should be triggered
   */
  async checkReminders() {
    try {
      const allReminders = await this.getAll()
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const todayJalali = new window.persianDate()
      
      const today = {
        year: todayJalali.year(),
        month: todayJalali.month(),
        day: todayJalali.date()
      }

      for (const reminder of allReminders) {
        if (!reminder.enabled || reminder.notified) continue

        let reminderDate = null
        if (reminder.calendar === 'jalali') {
          reminderDate = reminder.date
        } else if (reminder.calendar === 'gregorian') {
          // Convert gregorian to jalali for comparison
          const gregDate = new Date(reminder.date.year, reminder.date.month - 1, reminder.date.day)
          const jalali = new window.persianDate(gregDate)
          reminderDate = {
            year: jalali.year(),
            month: jalali.month(),
            day: jalali.date()
          }
        }

        // Check if date matches
        const dateMatches = reminderDate &&
          reminderDate.year === today.year &&
          reminderDate.month === today.month &&
          reminderDate.day === today.day

        if (dateMatches) {
          // If no time specified, notify immediately
          if (!reminder.time) {
            await this.triggerReminder(reminder)
          } else {
            // Check if time matches (within 1 minute tolerance)
            const reminderHour = reminder.time.hour
            const reminderMinute = reminder.time.minute
            const timeDiff = Math.abs(
              (currentHour * 60 + currentMinute) - (reminderHour * 60 + reminderMinute)
            )
            
            if (timeDiff <= 1) {
              await this.triggerReminder(reminder)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }

  /**
   * Trigger a reminder notification
   */
  async triggerReminder(reminder) {
    try {
      NotificationService.showReminder(reminder)
      await this.update(reminder._id, { notified: true })
    } catch (error) {
      console.error('Error triggering reminder:', error)
    }
  }

  /**
   * Start checking reminders periodically
   */
  startChecking() {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkReminders()
    }, 60000) // 60 seconds

    // Also check immediately
    this.checkReminders()
  }

  /**
   * Stop checking reminders
   */
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
}

export default new ReminderService()

