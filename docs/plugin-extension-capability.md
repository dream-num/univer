# Plugin Extension Capability

Univer follows a "small core" + "multiple plugins" architecture pattern. The core code (mainly the core package) and plugins can provide extension points to enrich the functionality of Univer.

As mentioned in the Architecture Overview section, plugin extension points should be added to the dependency injection system as public modules.

The following section provides a brief introduction to the core package of Univer and some of the main extension points exposed by plugins. Detailed API documentation will be generated using a documentation generation tool later.

## Core Package

The core package, as the lowest-level package, provides the Univer container type and core extension points, including:

* Command System (ICommandService)
  * Registering commands/mutations/operations
  * Listening to command execution
* Context (IContextService)
  * Recording application runtime state information
* Configuration Management (IConfigService)
* Lifecycle (LifecycleService)
* Logging (ILogService)
  * Printing different types of logs
  * Controlling log storage and reporting methods
* Internationalization (ILocaleService)
* Permissions (IPermissionService)
  * Controlling execution permissions for commands
  * Controlling permissions for Univer documents
* Undo/Redo (IUndoRedoService)

## base-ui

Provides basic operations and UI capabilities:

* Provides basic React components
* Global interactions
  * Popup dialogs or notifications (INotificationService / IMessageService)
* Toolbar and menu (IMenuService)
  * Registering menu items in different locations (toolbar, context menu, etc.)
* Shortcuts (IShortcutService)
  * Registering keyboard shortcuts
  * Getting the shortcut keys associated with a command
* Component mounting point (IDesktopUIController)
  * Rendering custom content at specified locations
* Copy and paste (IClipboardService)
  * Supplementing clipboard content when copying to the clipboard, supplementing or modifying mutations when pasting from the clipboard
* Focus management (ILayoutService)

## base-render

Provides basic rendering capabilities:

* Custom rendering
* Handling mouse interactions
* Rendering rich text content
