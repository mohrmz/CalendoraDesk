# Calendora Desk

Calendora Desk is a lightweight and modern **desktop application built with Vue.js**, designed to showcase development speed, UI creativity, and clean architectural skills.  
Inspired by the structure of *Loutos*, this project focuses on delivering a smooth, minimal, and elegant multi-calendar experience for desktop environments.

---

## 🌐 Overview

The application provides full support for **Jalali (Solar Hijri), Hijri (Lunar), and Gregorian** calendars, complete with monthly views, date conversion, and reminders.  
Although functional, Calendora Desk is **not intended for production use**—its sole purpose is to represent versatility, design ability, and rapid development capability.

---

## ✨ Features

### 📅 Multi-Calendar Support
- Full monthly calendars for:
  - **Jalali (Iranian Solar Calendar)**
  - **Hijri (Islamic Lunar Calendar)**
  - **Gregorian**
- Independent navigation for each calendar (month/year switching)
- Minimal and clean calendar layout

### 🔄 Smart Date Conversion
- Select a single date in one calendar
- Instantly view its **equivalent date** in the other two calendars
- Uses custom conversion logic and precise algorithms

### 🔔 In-App Reminders
- Create reminders for any date
- Receive **local in-app notifications**
- Lightweight and simple for quick use

### 🎨 Minimalistic UI
- Fully custom, elegant, and modern interface  
- Not based on templates or UI kits  
- Smooth micro-interactions and a distraction-free layout

### 🌓 Theme System
- Built-in **Light / Dark mode**
- User preference stored locally and applied automatically on startup

### ⚙️ Desktop Ready
- Built using **Vue.js + Vite**  
- Packaged for desktop use via **Electron**

---

## 🛠️ Tech Stack

- **Vue.js 3**
- **Vite**
- **Electron** (desktop packaging)
- **Day.js** or custom date utilities

---

## 📁 Installation & Setup

Clone the repository:

```bash
git clone https://github.com/mohrmz/CalendoraDesk
cd CalendoraDesk

# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build