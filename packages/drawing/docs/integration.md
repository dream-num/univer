# @univerjs/drawing integration

See the [package README](../README.md) for installation and basic setup.

## OLE online references

An OLE drawing retains its `oleAttachmentId`, which identifies the original attachment's resource record. After explicit online conversion, `oleOnlineUnit` stores only the new Unit's `unitId` and `type`; it does not store a URL or embed the converted Unit's snapshot.

Configure `ole.getLink(unitId, type)` on `UniverDrawingPlugin` to resolve the application's current URL on each explicit Open action. There is no default application route. The existing Pro `UniverExchangeClientPlugin` supplies conversion callbacks without adding a separate OLE plugin or owning navigation. Legacy stored `url` fields remain unchanged and are ignored when opening. See the [OLE integration guide](ole-attachments.md) for configuration and transport boundaries.
