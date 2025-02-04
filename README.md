# Digital Signage Electron App

## Description

This Electron-based application allows users to display and manage digital signage content.
The app connects to a WebSocket server for real-time content synchronization, with offline capabilities that store content locally when the app is disconnected from the internet. 

### Key features include:
- Real-time content updates via WebSocket.
- Offline mode with content storage and synchronization when back online.
- Auto-sync toggle via system tray.

## Features

- **WebSocket Integration**: Connects to a WebSocket server to fetch content in real-time.
- **Offline Mode**: Stores content locally and syncs it when internet access is restored.
- **Auto-Sync Toggle**: Allows users to enable or disable auto-sync from the system tray.
- **System Tray Support**: Provides an easy access menu for managing the app's state, including WebSocket reconnection and syncing.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Ramankauldhar/electronApp.git
    ```
2. Navigate to the project directory:
    ```bash
   cd electronApp
    ```
3. Install the required dependencies:
    ```bash
    npm install
    ```

## Usage

1. Start the Electron app:
    ```bash
    npm run electron .
    ```
2. The app will open in a new window and connect to the WebSocket server at `ws://localhost:5000`.
3. The tray icon will be created, and you can interact with it to enable/disable auto-sync or reconnect to the WebSocket server.

## Configuration

- **WebSocket URL**: By default, the WebSocket server is set to `ws://localhost:5000`. If needed, you can modify the `websocketURL` constant in the main file.
- **Offline Storage**: Content is stored in a local file (`content.json`) located in the user's data directory.

## Auto-Sync Feature

- **Enable Auto-Sync**: The app automatically syncs content with the WebSocket server if the connection is active and auto-sync is enabled.
- **Disable Auto-Sync**: You can disable auto-sync from the tray menu to prevent automatic synchronization.

## Technologies Used

- **Electron**: A framework to build cross-platform desktop applications using web technologies.
- **WebSocket**: For real-time data synchronization.
- **Node.js**: For backend functionality and file system operations.
- **React** : Can be used for the frontend UI if the app uses it.

## Troubleshooting

- **WebSocket not connecting**: Ensure that the WebSocket server is running and accessible at the specified URL.
- **Offline Mode**: If you are using the app without an internet connection, the app will store content locally and sync it when the connection is restored.

## ScreenShots
![Screen Shot 2025-02-03 at 11 05 02 PM](https://github.com/user-attachments/assets/2064dbf5-2115-4890-8de5-687851777132)
![Screen Shot 2025-02-03 at 11 05 18 PM](https://github.com/user-attachments/assets/db42f086-2e33-4ee6-8094-17506fef9137)
![Screen Shot 2025-02-03 at 11 05 39 PM](https://github.com/user-attachments/assets/b5604e71-2fbd-4c76-b15d-a819276d5010)
![Screen Shot 2025-02-03 at 11 05 49 PM](https://github.com/user-attachments/assets/9fa5f3b7-594d-4085-aa1a-87d6aac9688e)





## Contact

For inquiries or suggestions, please contact:
Name: Ramandeep
Email: Rmnkaul979697@gmail.com
