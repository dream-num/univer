# OLE attachment resources

OLE drawings use `DrawingTypeEnum.DRAWING_OLE` and the versioned `UNIVER_OLE_ATTACHMENT_PLUGIN` resource. Each occurrence has its own object identity; files are addressed by SHA-256. The resource preserves the original Office part, a losslessly extracted independent file when available, presentation parts and relationships. The host converter does not execute or automatically import the attachment.

`UniverDrawingPlugin` registers the resource for Sheets, Docs and Slides, including headless runtimes. The respective drawing UI plugins expose icon buttons for Preview, Download, Rename and Delete, with localized tooltips. The menu opens above the drawing by default. Compact drawing captions may wrap or ellipsize while retaining the extension; captions do not open a separate popup. The drawing supports position and size changes through the existing mutation and undo pipeline. Imported rotation is retained; direct rotation, flipping and cropping are not offered by the OLE toolbar. Preview state belongs to the local UI.

## JSON and online Unit transport

```ts
import { prepareOleSnapshot } from '@univerjs/drawing';

// JSON is portable: original bytes and presentation resources remain in the snapshot.
const portable = await prepareOleSnapshot(snapshot, 'json', undefined, attachmentIo);

// Upload every retained binary through the existing attachment contract before saving the Unit.
const online = await prepareOleSnapshot(snapshot, 'unit', targetUnitId, attachmentIo);
await saveUnitSnapshot(online);

// Resolve online attachments to a portable model before passing it to the Office exporter.
const exportSnapshot = await prepareOleSnapshot(online, 'json', undefined, attachmentIo);
```

`attachmentIo.upload(file, targetUnitId)` returns the existing `IBaseAttachment` with a stable UUID source and matching size. `attachmentIo.read(attachment, signal)` uses the application's authenticated attachment reader and renews signed URLs as needed. The helper accepts UnitData or the native exchange JSON envelope; it updates encoded slide metadata too. It clones the input and publishes no partially rewritten snapshot after an upload failure. Uploads are sequential. The application owns Unit save/load and attachment retention; deleting one occurrence does not immediately delete shared or historical binaries.

Inline JSON requires no upload service. Online mode stores attachment identities rather than signed URLs. Use the helper at the import/export transport boundary; regular Unit saves retain these references. Office export requires all referenced files to be resolved; missing or corrupt bytes cause an explicit error. The version 1 resource has a 50 MiB limit including JSON/Base64 overhead.

### Server creation and export boundaries

The server must use the OLE-capable drawing model and native exchange implementation together. Upgrading the browser alone does not preserve OLE across server materialization or Office export. Register the drawing model plugin in headless runtimes so resource save/checkpoint operations retain attachment records.

When importing an Office file to an online Unit, allocate its final Unit ID first, transfer retained binaries through the application's attachment storage, then create the Unit from the prepared data. A server-side storage adapter can assign these files during creation, as it does for embedded images. Browser attachment endpoints that require an existing Unit must keep that validation; do not relax it to make a pre-creation upload succeed. Do not expose the new Unit until preparation and creation succeed. Upload failures may leave unreferenced files for the application's normal attachment cleanup, but must not publish a partially prepared model.

Before Office export, materialize the Unit through the Server SDK and call `prepareOleSnapshot(..., 'json', undefined, attachmentIo)` to resolve every UUID to validated bytes. Passing a snapshot containing unresolved UUIDs directly to the native exporter is not a complete export integration. JSON import/export keeps bytes inline and needs no attachment uploader. Native SDK envelopes may contain `Uint8Array` metadata, sheet blocks or UTF-8 resource data; the helper preserves those representations and copies their buffers without changing the caller's data. It does not reassign Unit identities.

## Preview integration

The Pro collaboration client supplies an adapter using the existing attachment upload/sign/read requests. It passes the explicit target Unit to the shared attachment uploader, independently of the currently focused Unit. Register the optional Pro `UniverOleExchangeClientPlugin` after `UniverExchangeClientPlugin`:

```ts
univer.registerPlugin(UniverExchangeClientPlugin, exchangeEndpoints);
univer.registerPlugin(UniverOleExchangeClientPlugin, {
    getLink: (unitId) => `/documents/${encodeURIComponent(unitId)}`,
});
```

Configure `getLink` once for all three hosts. It must synchronously return a relative or absolute HTTP(S) URL for the application's current route; use its second `type` argument when Sheet, Doc and Slide routes differ. There is no default application route. Without a resolver, online actions stay hidden while preview and download remain available.

The base exchange client remains independent of drawing UI. The optional plugin supplies the read-only Office viewer, `ole.convertToOnline` and `ole.getLink`. An online attachment submits its stable file ID and source Unit ID to the existing import/task endpoint; the browser does not read or upload its bytes. Inline JSON bytes are uploaded once. The server must authorize the persistent attachment reference and can use `UniverAttachmentImportService` with its normal attachment and Unit creation adapters. The JSON preview endpoint never creates a persisted Unit. `ole.isCollaborative(unitId)` checks the exact host Unit. Applications with custom integration may provide these callbacks directly.

Only supported Office attachments in a collaborative host show Convert to online spreadsheet/document/slides. PDF, unknown binaries and unavailable local links are retained as attachments. A read-only host cannot create an online Unit reference. Existing references can still be opened, subject to normal destination authentication and permissions.

After a successful import, the host drawing command saves only `oleOnlineUnit: { unitId, type }` alongside `oleAttachmentId`. Slides store this field on the OLE page element. These fields travel through the existing drawing mutations, collaboration and undo/redo. Snapshot transport preserves the metadata in both modes. URLs are not persisted: every explicit Open action calls the current `getLink(unitId, type)`, including the completion notification. Legacy stored `url` fields remain untouched and are ignored, with no fallback to their old addresses. The retained original file is unchanged; Office export continues to embed that original file rather than the online document's later edits. The Unit reference does not contain a portable copy of the converted document.

Conversion keeps progress on the source page and never pre-opens a tab or navigates automatically. After the Unit reference is saved, a persistent completion notification offers Open. Clicking it or the drawing toolbar's Open action resolves the current URL and opens a new tab without importing again. If saving the reference fails after the server creates a Unit, the same UI session retains that result and retries persistence without another import. Deleting the OLE drawing or closing its host stops local waiting; it does not delete an already created independent online Unit. If a browser blocks the new tab, the reference remains available through the Open action.

Office preview remains an isolated read-only temporary Univer instance. It explicitly disables online conversion even when its parent is collaborative. All OLE action tooltips and error messages are defined in the 19 drawing UI locales.


## Compact attachment toolbar

The shared OLE toolbar is one row of icon buttons: Preview, Download, optional Convert/Open online, Rename, then a separator and Delete. Rename and Delete are hidden for read-only hosts. Attachment filenames remain in the Canvas caption and the toolbar's accessible name; they do not participate in toolbar layout. There is no filename hover tooltip. Clicking a caption selects the object and uses the same toolbar; it never opens a separate name viewer. Action tooltips remain above their buttons. The editable local toolbar is 159 × 40 CSS pixels; the collaborative Office toolbar is 195 × 40 CSS pixels.

File-type glyphs use built-in static vector paths and captions use Canvas text at the current zoom and device pixel ratio. Neither has a background panel. User-supplied SVG is never parsed by this renderer. Imported object geometry is retained; the glyph keeps its aspect ratio inside that geometry. Static artwork and captions remain on Canvas; only the explicit rename editor and action controls use temporary UI overlays.

Rename replaces the toolbar with an input above the object, with a fixed extension and explicit Save/Cancel buttons. Enter saves, Escape cancels, and composition Enter is ignored. Clipboard actions inside the input remain native text operations; they do not paste into the Slide canvas. Names must be nonempty, at most 255 Unicode characters including the extension, and cannot contain control/path characters or end in a dot. The per-occurrence `oleFileName` field overrides the displayed and default download name. The original file record, SHA-256 and bytes are unchanged, so other occurrences sharing those bytes retain their own names. Drawing commands persist the name through the normal mutations and undo/redo; both JSON and Unit snapshot transport retain it. Rename does not change an already converted online Unit's title. Office export retains original OLE binary and presentation parts; rewriting their native caption metadata to match the override is not implemented.

Online conversion keeps an indeterminate progress bar and localized reading/uploading, converting, creating and saving stages visible in a source-page notification. Closing a Unit or deleting its drawing immediately clears this UI and stops waiting; committed server work is not rolled back. Configure the existing exchange task timeout for large documents. Delete uses the danger hover color; normal, focus and dark colors use the existing theme tokens. All three product adapters position the toolbar above its attachment with an 8 px gap.
