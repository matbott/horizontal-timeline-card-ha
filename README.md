### [Lovelace] Horizontal Timeline Card - A new way to visualize your calendar events!

Hello everyone!

I'm excited to share a new custom card I've been working on: the **Horizontal Timeline Card**.

Its purpose is to provide a clean and simple way to visualize events from a calendar entity over a specific period. It's perfect for tracking project deadlines, upcoming birthdays, vacations, or any sequence of events you want to keep an eye on.

Here's a quick look at what it does:

<img width="522" height="551" alt="image" src="https://github.com/user-attachments/assets/31353758-d8ed-49b2-aad6-4a375f2bfe53" />

### ✨ Features

* **Direct Calendar Integration**: Displays events from any Home Assistant `calendar` entity.
* **Customizable Date Range**: You define the start and end dates for the timeline.
* **"Today" Marker**: Automatically shows a vertical line for the current day.
* **Interactive Event Points**: Hover over any event on the timeline to see its name and date.
* **Collapsible Event List**: Includes an optional, expandable list below the timeline showing all event details.
* **Easy Configuration**: Fully configurable through the UI Editor, no YAML needed to get started.
* **Highly Customizable Look**:
    * Adjust colors for the timeline, event dots, and "today" marker.
    * Choose to show event labels permanently or only on hover.
    * Place labels above or below the timeline.
    * Set a fixed card height to fit your layout perfectly.
* **Smart & Manual Event Styling**:
    * **Auto-Color**: Automatically assigns a unique color to each event.
    * **Manual Override**: Customize the color and icon for specific events by adding a simple note in the event's description field in your calendar (e.g., `color: #ff4081` or `icon: mdi:cake-variant`).

### 📸 Screenshots

Here is the card's UI editor, which makes setup a breeze:

<img width="472" height="245" alt="image" src="https://github.com/user-attachments/assets/d9601ebc-0d61-4353-a905-9116b217d60e" />

<img width="514" height="823" alt="image" src="https://github.com/user-attachments/assets/9ae496bf-858f-464a-9bfa-297d97fbd35a" />



### 📥 Installation

#### **HACS (Recommended Method)**

This card is not yet in the default HACS repository, but you can add it easily as a custom repository.

1.  Go to your HACS page in Home Assistant.
2.  Click on "Frontend", then the three dots in the top right, and select "**Custom repositories**".
3.  In the "Repository" field, paste your GitHub repository URL.
4.  Select the category "**Lovelace**".
5.  Click "**Add**". You should now see the "Horizontal Timeline Card" in your HACS frontend list to install.
6.  Finally, add the resource to your Lovelace configuration as instructed by HACS.

### ⚙️ Configuration

The easiest way to configure the card is through the Visual Editor after adding it to your dashboard.

Here is a basic YAML configuration to get you started:

<img width="647" height="733" alt="image" src="https://github.com/user-attachments/assets/d0925267-5600-4e52-b6ca-1033c5226381" />

```yaml
type: custom:horizontal-timeline-card
entity: calendar.birthdays
title: Upcoming Birthdays
start_date: '2025-10-01'
end_date: '2026-01-31'
