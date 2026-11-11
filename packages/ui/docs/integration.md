# @univerjs/ui integration

See the [package README](../README.md) for installation and basic setup.

## Format painter

The desktop Start ribbon has one format painter entry. A single click captures a detached
format snapshot for one application; a double click keeps it active until Escape or another
click on the entry. Unsupported targets do not consume the snapshot. The canvas displays a
brush cursor on supported targets and an unavailable cursor elsewhere.

`FormatPainterSessionService` coordinates the local session. Host adapters claim the active
editing context and apply formatting through their domain commands. A higher-priority shape
selection prevents a stale cell selection from becoming the source. Changing the focused
Unit or disposing the source Unit cancels the session. The session itself is not persisted.

The icon-only clear-formatting button below the format painter resets the active domain's
formatting without removing content. Clearing cancels an active brush; each domain applies
the change through its undoable commands.
