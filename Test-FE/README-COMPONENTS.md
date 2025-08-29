# Frontend Component Structure

## Overview
The Frontend has been refactored into modular components for better maintainability and code organization.

## Component Structure

### Main Components
- **`App.js`** - Main application component that manages state and renders tabs
- **`Header.js`** - Application header with title and description
- **`TabNavigation.js`** - Tab navigation buttons

### Tab Components
- **`AuthTab.js`** - Authentication functionality (login, register, logout, refresh)
- **`UsersTab.js`** - User profile management (get profile, update profile, upload avatar)
- **`PostsTab.js`** - Posts management (create, list, update, delete posts)
- **`UploadsTab.js`** - File upload functionality (upload, get meta, delete files)
- **`GoogleOAuthTab.js`** - Google OAuth integration

### Utility Files
- **`utils/helpers.js`** - Helper functions for file handling and data normalization
- **`services/api.js`** - API service functions organized by feature

## File Organization

```
src/
├── components/
│   ├── index.js              # Component exports
│   ├── Header.js             # App header
│   ├── TabNavigation.js      # Tab navigation
│   ├── AuthTab.js            # Authentication tab
│   ├── UsersTab.js           # Users tab
│   ├── PostsTab.js           # Posts tab
│   ├── UploadsTab.js         # Uploads tab
│   └── GoogleOAuthTab.js     # Google OAuth tab
├── services/
│   └── api.js                # API service functions
├── utils/
│   └── helpers.js            # Helper functions
├── App.js                    # Main app component
└── App.css                   # Styles
```

## Benefits of This Structure

1. **Modularity** - Each tab is a separate component with its own logic
2. **Maintainability** - Easier to find and modify specific functionality
3. **Reusability** - Components can be reused in other parts of the app
4. **Testing** - Individual components can be tested in isolation
5. **Code Organization** - Clear separation of concerns

## Usage

### Adding New Tabs
1. Create a new component in `components/` folder
2. Add it to `components/index.js`
3. Import it in `App.js`
4. Add tab button in `TabNavigation.js`
5. Add case in `renderActiveTab()` function

### Modifying Existing Tabs
- Each tab component is self-contained
- Props are passed down from the main App component
- State is managed at the App level for cross-tab communication

### API Calls
- All API calls are centralized in `services/api.js`
- Organized by feature (auth, users, posts, uploads)
- Consistent error handling and response formatting

## State Management
- Main state is managed in `App.js`
- Props are passed down to child components
- Event handlers are defined in App and passed as props
- This ensures consistent state across all tabs
