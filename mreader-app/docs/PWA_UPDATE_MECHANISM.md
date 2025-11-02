# PWA Update Mechanism for iOS

## Overview

This document explains the PWA (Progressive Web App) update mechanism implemented for mreader, with special consideration for iOS devices where automatic updates don't work as reliably as on Android.

## Implementation Details

### 1. Update Strategy

We use the **'prompt'** strategy instead of 'autoUpdate' in the vite-plugin-pwa configuration:

```typescript
VitePWA({
  registerType: 'prompt',  // Shows manual update prompt
  workbox: {
    cleanupOutdatedCaches: true,
    clientsClaim: true
  }
})
```

This approach:
- **Works better on iOS**: iOS Safari has limitations with automatic service worker updates
- **Gives user control**: Users can choose when to update (important if they're in the middle of reading)
- **More reliable**: Ensures users are aware of updates and can apply them explicitly

### 2. Periodic Update Checks

The service worker registration checks for updates every hour:

```typescript
if (registration) {
  setInterval(() => {
    registration.update()
  }, 60 * 60 * 1000) // 1 hour
}
```

This ensures:
- Regular checks for new versions without being intrusive
- Battery-efficient (once per hour is reasonable)
- Users don't need to manually trigger checks

### 3. Update Prompt Component

When an update is available, users see a notification at the bottom of the screen with two options:

- **Later**: Dismiss the notification (it will appear again on next check)
- **Update Now**: Apply the update immediately (reloads the app with new version)

The prompt is:
- Non-intrusive (bottom notification, not a blocking modal)
- Accessible (proper ARIA labels and roles)
- Responsive (adapts to mobile and desktop)
- Dismissible (user can choose to update later)

### 4. Version Display

The app version is displayed in the bottom-right corner of the Library view:

- Shows current version (e.g., "v0.1.0")
- Helps users verify which version they're running
- Useful for support and debugging
- Styled to be subtle but visible when needed

## User Experience Flow

### On iOS Devices

1. **User opens the PWA** on their iOS device
2. **Background check runs** every hour to detect updates
3. **If update available**, a notification appears at the bottom:
   ```
   Update Available
   A new version of mreader is available. Refresh to update.
   [Later] [Update Now]
   ```
4. **User chooses**:
   - **Update Now**: App reloads with the new version
   - **Later**: Continue using current version, prompt reappears on next check

5. **Version confirmation**: User can check the version number in the bottom-right corner

### On Android Devices

The same mechanism works on Android, but Android devices also benefit from:
- More reliable automatic service worker updates
- Better background sync capabilities
- The manual prompt serves as a fallback

## Technical Components

### Files Created/Modified

1. **`src/composables/usePwaUpdate.ts`**
   - Composable that wraps service worker registration
   - Handles update checks and triggers
   - Provides reactive state for update availability

2. **`src/components/UpdatePrompt.vue`**
   - UI component for update notification
   - Accessible and responsive design
   - Smooth animations and transitions

3. **`vite.config.ts`**
   - Updated PWA plugin configuration
   - Changed from 'autoUpdate' to 'prompt'
   - Added workbox configuration for cache management

4. **`src/views/LibraryView.vue`**
   - Added version display in footer
   - Reads version from environment variable

5. **`src/App.vue`**
   - Integrated UpdatePrompt component
   - Shows globally across all views

6. **`src/env.d.ts`**
   - Added type definitions for PWA virtual modules
   - Added VITE_APP_VERSION environment variable type

## Testing the Update Mechanism

### Local Testing

1. Build the app: `npm run build`
2. Serve the production build: `npm run preview`
3. Open in browser and install as PWA
4. Make a code change and increment version in `package.json`
5. Build again: `npm run build`
6. The update prompt should appear in the running PWA

### iOS Testing

1. Deploy the updated app to your hosting service
2. Open the PWA on an iOS device
3. Wait for the hourly check or force close and reopen
4. Update prompt should appear if new version is available
5. Tap "Update Now" to apply the update

### Verification

- Check version number in bottom-right corner
- Open browser console to see service worker logs
- Use browser DevTools > Application > Service Workers to monitor registration

## Best Practices

### When to Increment Version

Update the version in `package.json` when:
- Adding new features
- Fixing bugs
- Updating dependencies that affect functionality
- Changing UI/UX significantly

Use semantic versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes

### Deployment

1. Update version in `package.json`
2. Build the app: `npm run build`
3. Deploy the `dist` folder to your hosting service
4. Users will be notified of the update within an hour

### Considerations

- **Reading session**: Users might be in the middle of reading. The "Later" option is important.
- **Offline usage**: Updates only trigger when online
- **Cache size**: Service worker caches all assets (currently ~140 KB)
- **iOS limitations**: Some iOS versions may require multiple app opens to detect updates

## Troubleshooting

### Update not detected

- Check service worker registration in DevTools
- Verify new build has different content hash
- Try unregistering old service worker and refresh
- Check browser console for errors

### Update fails on iOS

- Ensure iOS Safari is up to date (iOS 11.3+ required for PWA)
- Check if service worker is properly registered
- Try closing all tabs and reopening the PWA
- Verify hosting service serves proper MIME types

### Version not updating

- Clear browser cache
- Uninstall and reinstall the PWA
- Check that `VITE_APP_VERSION` is properly injected during build

## Future Enhancements

Potential improvements for the update mechanism:

1. **Update changelog**: Show what's new in the update
2. **Forced updates**: For critical security fixes
3. **Background download**: Download update in background, apply on next open
4. **Update history**: Track update installation history
5. **Network-aware**: Only download updates on WiFi for large updates

## References

- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [iOS PWA Limitations](https://firt.dev/notes/pwa-ios/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
