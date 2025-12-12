const { remote } = require('electron')

class NotificationService {
  constructor() {
    this.permissionGranted = true // Electron notifications are always available
  }

  /**
   * Show a notification
   * @param {Object} options - Notification options
   * @param {String} options.title - Notification title
   * @param {String} options.body - Notification body
   * @param {String} options.icon - Icon path (optional)
   */
  show(options) {
    try {
      const { Notification } = remote
      
      if (!Notification.isSupported()) {
        console.warn('Notifications are not supported on this platform')
        return null
      }

      const notification = new Notification({
        title: options.title || 'یادآوری',
        body: options.body || '',
        icon: options.icon || undefined,
        silent: false
      })

      notification.on('click', () => {
        if (options.onClick) {
          options.onClick()
        }
        // Focus the main window
        const mainWindow = remote.BrowserWindow.getAllWindows()[0]
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      })

      notification.show()
      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }

  /**
   * Show reminder notification
   * @param {Object} reminder - Reminder object
   */
  showReminder(reminder) {
    return this.show({
      title: reminder.title || 'یادآوری',
      body: reminder.description || reminder.title || 'یادآوری شما',
      onClick: () => {
        // Navigate to reminders page or show reminder details
        const { ipcRenderer } = require('electron')
        ipcRenderer.send('show-reminder', reminder)
      }
    })
  }

  /**
   * Request notification permission
   */
  requestPermission() {
    if (Notification.isSupported()) {
      // Electron notifications don't require explicit permission on most platforms
      this.permissionGranted = true
      return Promise.resolve('granted')
    }
    return Promise.reject('Notifications not supported')
  }
}

export default new NotificationService()

