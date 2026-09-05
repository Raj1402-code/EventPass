
# EventPass: Project Report

## Overview
EventPass is a full-stack, real-time event registration and check-in platform. It is designed to handle secure ticket distribution, group registrations, and live capacity tracking. The platform operates on a robust architecture featuring a Node.js/Express backend with WebSockets and a modern React/Vite frontend.

## Key Features
- **Dynamic TOTP QR Codes**: Anti-screenshot QR codes that refresh every 30 seconds to prevent ticket fraud.
- **Group Registrations**: Organizers can set minimum and maximum group sizes, and attendees can bulk-register their members.
- **Live Telemetry & Dashboard**: Real-time websocket updates push check-in stats directly to the Organizer dashboard.
- **Offline Mode Validation**: Check-in scanners continue to work locally and automatically flush sync queues to the server when connection is restored.
- **CSV Exports & Editing**: Organizers can update live events, set registration deadlines, and securely export attendee lists.

## Screenshots

### 1. Login Authentication
![Login Screen](login.png)

### 2. Organizer Dashboard
![Organizer Dashboard](dashboard.png)

### 3. Attendee Dashboard
![Attendee Dashboard](attendee.png)
  