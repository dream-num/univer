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

The Pro collaboration client supplies an adapter using the existing attachment upload/sign/read requests. It passes the explicit target Unit to the shared attachment uploader, independently of the currently focused Unit. The Pro exchange client supplies a converter using its JSON import endpoint and a temporary isolated read-only viewer. Product renderers are loaded on demand; preview does not create a persisted child Unit or use the embed model.

The isolated viewer sets the UI plugin's `portalContainer` to its preview container. Its menus and nested preview dialogs therefore remain inside the owning modal's interaction scope; closing a nested preview returns to its parent. The attachment glyph and caption remain Canvas content.

Applications may supply `ole.attachmentIo`, `ole.previewOffice`, `ole.convertOffice` or `ole.createOfficePreview` in `UniverDrawingPlugin` configuration. Server runtimes can use the transport helpers with their own attachment adapter. For an Office preview, `convertOffice` returns `{ type, data }` with UnitData. A custom preview handler must honor cancellation and keep preview results out of the host snapshot.

Load the normal styles for any product that the lazy Office viewer may display. PDF and raster images use local Blob previews. PDF display depends on the browser PDF renderer; the dialog includes a download link when native rendering is unavailable. Unknown binary objects remain downloadable and report that online preview is unavailable. External local-file links retain an unavailable placeholder; the importer never follows them. Download returns the extracted original file, or the opaque original OLE container when extraction is unavailable. Preview conversions never replace the retained source bytes.

## Unavailable attachments

External links and missing attachment records remain visible placeholders at their imported position and size. Canvas draws a warning badge and a localized unavailable caption; a known filename is retained, otherwise a linked attachment receives a localized fallback name. The toolbar keeps a focusable warning icon with the specific reason and, for editors, Delete. Preview, Download, Rename and online conversion are omitted for these placeholders. The warning tooltip does not intercept pointer input over adjacent actions. Opening preview through the public API or double-clicking also explains the reason without reading or converting a file.

When an interactive OLE drawing is first bound, the UI reports the document's unavailable attachment count once per open Unit. Thumbnail rendering, hovering and undo do not repeat the notice. Closing the Unit resets this local notice state. These hints do not add fields to the snapshot or change the preserved Office relationships, original bytes, export metadata or geometry. An external link is never followed automatically.

## Explicit conversion to an online document

The Pro exchange client supplies `ole.convertToOnline` using the existing `importFileToUnitId` endpoint and the link resolver registered with `IExchangeOperateService.registerLink`. It never uses the JSON preview endpoint for this action. `ole.isCollaborative(unitId)` checks whether that exact host Unit was loaded from the snapshot server; installing a collaboration plugin does not enable conversion for local JSON Units. Applications with custom collaboration integration may supply both callbacks.

Only supported Office attachments in a collaborative host show Convert to online spreadsheet/document/slides. PDF, unknown binaries and unavailable local links are retained as attachments. A read-only host cannot create a link. Existing saved links can still be opened, subject to normal destination authentication and permissions.

After a successful import, the host drawing command saves `oleOnlineUnit: { unitId, type, url }` alongside `oleAttachmentId`. Slides store this field on the OLE page element. These fields travel through the existing drawing mutations, collaboration and undo/redo. Snapshot transport preserves the metadata in both modes. The retained original file is unchanged; Office export continues to embed that original file rather than the online document's later edits. Online URLs are references and are not portable copies of the converted Unit.

The action reserves a new tab during the click and navigates it after link persistence. Subsequent clicks open the saved URL without importing again. If saving the link fails after the server creates a Unit, the same UI session retains that result and retries persistence without another import. Deleting the OLE drawing or closing its host cancels pending work; it does not delete an already created independent online Unit. If a browser blocks the new tab, the saved link remains available through the Open action.

Office preview remains an isolated read-only temporary Univer instance. It explicitly disables online conversion even when its parent is collaborative. All OLE action tooltips and error messages are defined in the 19 drawing UI locales.


## Compact attachment toolbar

The shared OLE toolbar is one row of icon buttons: Preview, Download, optional Convert/Open online, Rename, then a separator and Delete. Rename and Delete are hidden for read-only hosts. Attachment filenames remain in the Canvas caption and the toolbar's accessible name; they do not participate in toolbar layout. There is no filename hover tooltip. Clicking a caption selects the object and uses the same toolbar; it never opens a separate name viewer. Action tooltips remain above their buttons. The editable local toolbar is 159 × 40 CSS pixels; the collaborative Office toolbar is 195 × 40 CSS pixels.

File-type glyphs use built-in static vector paths and captions use Canvas text at the current zoom and device pixel ratio. Neither has a background panel. User-supplied SVG is never parsed by this renderer. Imported object geometry is retained; the glyph keeps its aspect ratio inside that geometry. Static artwork and captions remain on Canvas; only the explicit rename editor and action controls use temporary UI overlays.

Rename replaces the toolbar with an input above the object, with a fixed extension and explicit Save/Cancel buttons. Enter saves, Escape cancels, and composition Enter is ignored. Clipboard actions inside the input remain native text operations; they do not paste into the Slide canvas. Names must be nonempty, at most 255 Unicode characters including the extension, and cannot contain control/path characters or end in a dot. The per-occurrence `oleFileName` field overrides the displayed and default download name. The original file record, SHA-256 and bytes are unchanged, so other occurrences sharing those bytes retain their own names. Drawing commands persist the name through the normal mutations and undo/redo; both JSON and Unit snapshot transport retain it. Rename does not change an already converted online Unit's title. Office export retains original OLE binary and presentation parts; rewriting their native caption metadata to match the override is not implemented.

Online conversion shows an immediate progress indicator while its request is pending. Delete uses the danger hover color; normal, focus and dark colors use the existing theme tokens. All three product adapters position the toolbar above its attachment with an 8 px gap.
