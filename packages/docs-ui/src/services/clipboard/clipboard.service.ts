/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { DocumentDataModel, IDisposable, IDocumentBody, IDocumentData, IUndoRedoItem } from '@univerjs/core';
import type { IDocImage } from '@univerjs/docs-drawing';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import type { DocPasteMode, IDocPasteStyle } from './paste-options';
import {
    BuildTextUtils,
    CommandType,
    createIdentifier,
    createParagraphId,
    createSectionId,
    DataStreamTreeTokenType,
    Disposable,
    DOC_RANGE_TYPE,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    DrawingTypeEnum,
    ErrorService,
    generateRandomId,
    getBodySlice,
    ICommandService,
    ILogService,
    ImageSourceType,
    Inject,
    IPermissionService,
    isInternalEditorID,
    IUndoRedoService,
    IUniverInstanceService,
    NAMED_STYLE_MAP,
    normalizeBody,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    RedoCommand,
    SliceBodyType,
    toDisposable,
    Tools,
    UndoCommand,
    UniverInstanceType,
    validateDocBodyStructure,
} from '@univerjs/core';
import {
    canEditDocumentTargets,
    DocSelectionManagerService,
    DocStateChangeManagerService,
    getDocumentEditTargetObjectIds,
    getDocumentPermissionValue,
} from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import {
    FILE__BMP_CLIPBOARD_MIME_TYPE,
    FILE__JPEG_CLIPBOARD_MIME_TYPE,
    FILE__WEBP_CLIPBOARD_MIME_TYPE,
    FILE_PNG_CLIPBOARD_MIME_TYPE,
    HTML_CLIPBOARD_MIME_TYPE,
    IClipboardInterfaceService,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { isTopLevelStructuralGap } from '../../basics/paragraph';
import { CutContentCommand, InnerPasteCommand } from '../../commands/commands/clipboard.inner.command';
import { getCursorWhenDelete } from '../../commands/commands/doc-delete.command';
import { getStyleInTextRange } from '../../commands/commands/inline-format.command';
import { DocMenuStyleService } from '../doc-menu-style.service';
import { copyContentCache, extractId } from './copy-content-cache';
import { HtmlToUDMService } from './html-to-udm/converter';
import LarkPastePlugin from './html-to-udm/paste-plugins/plugin-lark';
import UniverPastePlugin from './html-to-udm/paste-plugins/plugin-univer';
import WordPastePlugin from './html-to-udm/paste-plugins/plugin-word';
import {
    createInternalClipboardDocData,
    createInternalClipboardDocDataList,
    createInternalClipboardFragment,
    DOC_INTERNAL_FRAGMENT_MIME,
    embedInternalClipboardFragment,
    extractInternalClipboardFragmentFromHtml,
    omitClipboardNotes,
    parseInternalClipboardFragment,
    wrapClipboardHtml,
} from './internal-fragment';
import { applyDocPasteMode, getClipboardPlainText } from './paste-options';
import { UDMToHtmlService } from './udm-to-html/convertor';
import { DocHtmlExportService } from './udm-to-html/doc-html-export.service';

HtmlToUDMService.use(LarkPastePlugin);
HtmlToUDMService.use(UniverPastePlugin);
HtmlToUDMService.use(WordPastePlugin);

export function convertClipboardHtmlToDocumentData(html: string, unitId = ''): Partial<IDocumentData> {
    const documentData = new HtmlToUDMService().convert(html, { unitId });
    const body = finalizeClipboardDocumentBody(documentData.body);
    if (!body?.dataStream) {
        return documentData;
    }

    if (validateDocBodyStructure(body).length === 0) {
        return documentData;
    }

    const plainText = [
        DataStreamTreeTokenType.COLUMN_GROUP_START,
        DataStreamTreeTokenType.COLUMN_START,
        DataStreamTreeTokenType.COLUMN_END,
        DataStreamTreeTokenType.COLUMN_GROUP_END,
        DataStreamTreeTokenType.CUSTOM_RANGE_START,
        DataStreamTreeTokenType.CUSTOM_RANGE_END,
        DataStreamTreeTokenType.COLUMN_BREAK,
        DataStreamTreeTokenType.PAGE_BREAK,
        DataStreamTreeTokenType.DOCS_END,
        DataStreamTreeTokenType.CUSTOM_BLOCK,
    ].reduce(
        (text, token) => text.replaceAll(token, ''),
        BuildTextUtils.transform.getPlainText(body.dataStream)
    );
    return {
        id: documentData.id,
        body: finalizeClipboardDocumentBody(BuildTextUtils.transform.fromPlainText(plainText)),
        documentStyle: documentData.documentStyle,
    };
}

function finalizeClipboardDocumentBody(body: IDocumentBody | undefined): IDocumentBody | undefined {
    if (!body?.dataStream) {
        return body;
    }

    if (!body.dataStream.endsWith('\r\n')) {
        if (!body.dataStream.endsWith('\r')) {
            body.dataStream += '\r';
        }
        body.dataStream += '\n';
    }

    normalizeBody(body);

    const paragraphs = body.paragraphs ?? [];
    const paragraphIndex = body.dataStream.length - 2;
    if (!paragraphs.some((paragraph) => paragraph.startIndex === paragraphIndex)) {
        paragraphs.push({
            paragraphId: createParagraphId(new Set(paragraphs.map((paragraph) => paragraph.paragraphId))),
            startIndex: paragraphIndex,
        });
        body.paragraphs = paragraphs;
    }

    const sectionBreaks = body.sectionBreaks ?? [];
    const sectionBreakIndex = body.dataStream.length - 1;
    if (!sectionBreaks.some((sectionBreak) => sectionBreak.startIndex === sectionBreakIndex)) {
        sectionBreaks.push({
            sectionId: createSectionId(new Set(sectionBreaks.map((sectionBreak) => sectionBreak.sectionId))),
            startIndex: sectionBreakIndex,
        });
        body.sectionBreaks = sectionBreaks;
    }

    return body;
}

export function removeClipboardHtmlImages(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('img, svg').forEach((image) => image.remove());
    return /<(?:html|head)\b/i.test(html) ? doc.documentElement.outerHTML : doc.body.innerHTML;
}

export interface IClipboardPropertyItem { }

export interface IDocClipboardCopyDocDataContext {
    sourceDocuments: IDocumentData[];
}

export interface IDocClipboardCopyContentContext {
    body: IDocumentBody;
    segmentId?: string;
    unitId: string;
}

export interface IDocClipboardPasteContext {
    documentData: Partial<IDocumentData>;
    targetUnitId: string;
}

export interface IDocClipboardHook {
    onCopyDocData?(doc: Partial<IDocumentData>, context: IDocClipboardCopyDocDataContext): Partial<IDocumentData>;
    onCopyProperty?(start: number, end: number): IClipboardPropertyItem;
    onCopyContent?(start: number, end: number, context: IDocClipboardCopyContentContext): string;
    onBeforePaste?: (body: IDocumentBody, context: IDocClipboardPasteContext) => IDocumentBody;
    onBeforePasteImage?: (file: File) => Promise<{ source: string; imageSourceType: ImageSourceType } | null>;
}

export interface IDocClipboardPayload {
    html?: string;
    text?: string;
    internalJson?: string;
    files: File[];
    unitId?: string;
    mode?: DocPasteMode;
}

export interface IDocPasteOptionsState {
    unitId: string;
    mode: DocPasteMode;
    range: ITextRangeWithStyle;
}

interface IDocPasteSession {
    payload: IDocClipboardPayload;
    source?: Partial<IDocumentData>;
    style: IDocPasteStyle;
    history: IUndoRedoItem;
    selectionKey: string;
}

export interface IDocClipboardService {
    copy(sliceType?: SliceBodyType, ranges?: ITextRangeWithStyle[]): Promise<boolean>;
    cut(ranges?: ITextRangeWithStyle[]): Promise<boolean>;
    paste(items?: ClipboardItem[], mode?: DocPasteMode): Promise<boolean>;
    pasteFromClipboard(mode?: DocPasteMode): Promise<boolean>;
    legacyPaste(options: IDocClipboardPayload): Promise<boolean>;
    readonly pasteOptions$: Observable<IDocPasteOptionsState | null>;
    setNextPasteMode(mode: DocPasteMode): void;
    dismissPasteOptions(): void;
    changePasteMode(mode: DocPasteMode): Promise<boolean>;
    addClipboardHook(hook: IDocClipboardHook): IDisposable;
}

export function getTableClipboardBodySlice(body: IDocumentBody, range: IRectRangeWithStyle): IDocumentBody {
    const { startOffset, endOffset, spanEntireTable, tableId } = range;

    if (startOffset == null || endOffset == null) {
        return { dataStream: '' };
    }

    if (spanEntireTable) {
        const tableRange = body.tables?.find((table) => table.tableId === tableId);
        if (tableRange) {
            return getBodySlice(body, tableRange.startIndex, tableRange.endIndex, false, SliceBodyType.copy);
        }
    }

    return getTableCellContentClipboardBodySlice(body, startOffset, endOffset);
}

function getTableCellContentClipboardBodySlice(body: IDocumentBody, start: number, end: number): IDocumentBody {
    const bodySlice = getBodySlice(body, start, end + 2); // +2 for '\r\n in last cell'

    const dataStream = DataStreamTreeTokenType.TABLE_START +
        DataStreamTreeTokenType.TABLE_ROW_START +
        DataStreamTreeTokenType.TABLE_CELL_START +
        bodySlice.dataStream +
        DataStreamTreeTokenType.TABLE_CELL_END +
        DataStreamTreeTokenType.TABLE_ROW_END +
        DataStreamTreeTokenType.TABLE_END;

    bodySlice.dataStream = dataStream;
    bodySlice.textRuns?.forEach((textRun) => {
        const { st, ed } = textRun;
        textRun.st = st + 3;
        textRun.ed = ed + 3;
    });

    bodySlice.tables?.forEach((table) => {
        const { startIndex, endIndex } = table;
        table.startIndex = startIndex + 3;
        table.endIndex = endIndex + 3;
    });

    bodySlice.paragraphs?.forEach((paragraph) => {
        const { startIndex } = paragraph;
        paragraph.startIndex = startIndex + 3;
    });

    return bodySlice;
}

export const IDocClipboardService = createIdentifier<IDocClipboardService>('doc.clipboard-service');

export class DocClipboardService extends Disposable implements IDocClipboardService {
    private readonly _pasteOptions$ = new BehaviorSubject<IDocPasteOptionsState | null>(null);
    readonly pasteOptions$ = this._pasteOptions$.asObservable();
    private _pasteSession: IDocPasteSession | null = null;
    private _applyingPaste = false;
    private _pasteGeneration = 0;
    private _nextPasteMode: DocPasteMode = 'source';
    private _lastSelectionKey = '';

    private _clipboardHooks: IDocClipboardHook[] = [];
    private _memoryClipboardData: Partial<IDocumentData> | null = null;

    private _htmlToUDM = new HtmlToUDMService();
    private readonly _umdToHtml: UDMToHtmlService;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ILogService private readonly _logService: ILogService,
        @ICommandService private readonly _commandService: ICommandService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @Inject(ErrorService) private readonly _errorService: ErrorService,
        @Inject(DocHtmlExportService) docHtmlExportService: DocHtmlExportService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @Inject(DocStateChangeManagerService) private readonly _stateChangeManager: DocStateChangeManagerService,
        @Inject(DocMenuStyleService) private readonly _menuStyleService: DocMenuStyleService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService
    ) {
        super();
        this._umdToHtml = new UDMToHtmlService(docHtmlExportService);
        this.disposeWithMe(this._commandService.beforeCommandExecuted((command) => {
            if (!this._applyingPaste && command.type === CommandType.MUTATION) {
                this.dismissPasteOptions();
            }
        }));
        const invalidateSelection = () => {
            const key = this._getPasteSelectionKey();
            if (key !== this._lastSelectionKey) {
                this._lastSelectionKey = key;
                if (!this._applyingPaste) {
                    this.dismissPasteOptions();
                }
            }
        };
        this.disposeWithMe(this._docSelectionManagerService.textSelection$.subscribe(invalidateSelection));
        this.disposeWithMe(this._docSelectionManagerService.refreshSelection$.subscribe(invalidateSelection));
        this.disposeWithMe(this._univerInstanceService.focused$.subscribe(() => this.dismissPasteOptions()));
        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe(() => this.dismissPasteOptions()));
        this.disposeWithMe(this._permissionService.permissionPointUpdate$.subscribe(() => this.dismissPasteOptions()));
        this.disposeWithMe(() => {
            this.dismissPasteOptions();
            this._pasteOptions$.complete();
        });
    }

    async copy(sliceType: SliceBodyType = SliceBodyType.copy, ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        const document = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document || !getDocumentPermissionValue(
            this._permissionService,
            document.getUnitId(),
            document.getUnitId(),
            UnitAction.Copy
        )) {
            return false;
        }
        const {
            newSnapshotList = [],
            needCache = false,
            plainTextList,
            snapshot,
            ranges: allRanges,
        } = this._getDocumentBodyInRanges(sliceType, ranges) ?? {};

        if (newSnapshotList.length === 0 || snapshot == null) {
            return false;
        }

        try {
            const isCopyInHeaderFooter = !!allRanges?.[0]?.segmentId;

            await this._setClipboardData(
                newSnapshotList,
                !isCopyInHeaderFooter && needCache,
                plainTextList
            );
        } catch (e) {
            this._logService.error('[DocClipboardService] copy failed', e);
            return false;
        }

        return true;
    }

    async cut(ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        return this._cut(ranges);
    }

    async pasteFromClipboard(mode: DocPasteMode = 'source'): Promise<boolean> {
        const generation = this._pasteGeneration;
        const selectionKey = this._getPasteSelectionKey();
        if (!this._clipboardInterfaceService.supportClipboard) {
            if (this._memoryClipboardData) {
                return this.paste(undefined, mode);
            }
            throw new Error('Clipboard read unavailable');
        }
        const items = await this._clipboardInterfaceService.read();
        if (generation !== this._pasteGeneration || selectionKey !== this._getPasteSelectionKey()) {
            return false;
        }
        return this.paste(items, mode);
    }

    async paste(items?: ClipboardItem[], mode: DocPasteMode = 'source'): Promise<boolean> {
        if (!items?.length) {
            return this._memoryClipboardData
                ? this._pasteWithOptions({ files: [], mode }, Tools.deepClone(this._memoryClipboardData))
                : false;
        }
        const generation = this._pasteGeneration;
        const payload = await this._readClipboardItems(items);
        if (generation !== this._pasteGeneration) {
            return false;
        }
        return this.legacyPaste({ ...payload, mode });
    }

    setNextPasteMode(mode: DocPasteMode): void {
        this._nextPasteMode = mode;
    }

    async legacyPaste(options: IDocClipboardPayload): Promise<boolean> {
        const mode = options.mode ?? this._nextPasteMode;
        this._nextPasteMode = 'source';
        return this._pasteWithOptions({ ...options, mode });
    }

    dismissPasteOptions(): void {
        this._pasteGeneration++;
        this._pasteSession = null;
        if (this._pasteOptions$.value) {
            this._pasteOptions$.next(null);
        }
    }

    async changePasteMode(mode: DocPasteMode): Promise<boolean> {
        const session = this._pasteSession;
        const state = this._pasteOptions$.value;
        if (!session || !state || state.mode === mode) {
            return false;
        }
        const generation = this._pasteGeneration;
        const source = await this._preparePaste(session.payload, mode, session.source);
        // Both history identity and the invalidation generation must still match after asynchronous image loading.
        if (generation !== this._pasteGeneration || session !== this._pasteSession ||
            this._undoRedoService.pitchTopUndoElement() !== session.history ||
            this._getPasteSelectionKey() !== session.selectionKey ||
            this._getCurrentDocumentUnitId() !== state.unitId || !this._canEditTargets(state.unitId)) {
            return false;
        }
        const doc = applyDocPasteMode(source, mode, session.style, session.payload.text);
        if (!doc.body?.dataStream) {
            return false;
        }
        this._applyingPaste = true;
        try {
            // This synchronous transaction can only replace the exact, still-current paste history entry.
            if (!this._commandService.syncExecuteCommand(UndoCommand.id)) {
                this.dismissPasteOptions();
                return false;
            }
            try {
                if (!this._paste(doc, state.unitId)) {
                    this._commandService.syncExecuteCommand(RedoCommand.id);
                    this.dismissPasteOptions();
                    return false;
                }
            } catch (error) {
                this._commandService.syncExecuteCommand(RedoCommand.id);
                this.dismissPasteOptions();
                throw error;
            }
            this._savePasteSession(session.payload, mode === 'text' ? session.source : source, session.style, mode, state.unitId);
            return true;
        } finally {
            this._applyingPaste = false;
        }
    }

    private async _preparePaste(
        payload: IDocClipboardPayload,
        mode: DocPasteMode,
        source?: Partial<IDocumentData>
    ): Promise<Partial<IDocumentData>> {
        if (source) {
            return source;
        }
        if (mode === 'text') {
            const internal = parseInternalClipboardFragment(payload.internalJson) ?? extractInternalClipboardFragmentFromHtml(payload.html);
            if (internal?.body) {
                return internal;
            }
            if (payload.text !== undefined) {
                return { body: BuildTextUtils.transform.fromPlainText(payload.text) };
            }
            return this._genDocDataFromHtmlAndText(payload.html, payload.text, payload.unitId, payload.internalJson);
        }
        let html = payload.html;
        if (payload.files.length && !payload.text && !html) {
            html = await this._createImagePasteHtml(payload.files);
        } else if (html && payload.files.length) {
            html += await this._createImagePasteHtml(payload.files);
        }
        html = await this._uploadBase64ImagesInHtml(html);
        return this._genDocDataFromHtmlAndText(html, payload.text, payload.unitId, payload.internalJson);
    }

    private async _pasteWithOptions(payload: IDocClipboardPayload, cachedSource?: Partial<IDocumentData>): Promise<boolean> {
        this.dismissPasteOptions();
        const unitId = payload.unitId ?? this._getCurrentDocumentUnitId();
        if (!unitId || !this._canEditTargets(unitId)) {
            return false;
        }
        if (!cachedSource && !payload.html && !payload.text && !payload.internalJson && !payload.files.length) {
            return false;
        }
        const generation = this._pasteGeneration;
        const mode = unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY ? 'text' : payload.mode ?? 'source';
        const style = this._getPasteStyle(unitId);
        const source = await this._preparePaste(payload, mode, cachedSource);
        if (generation !== this._pasteGeneration || !this._canEditTargets(unitId)) {
            return false;
        }
        let doc = applyDocPasteMode(source, mode, style, payload.text);
        if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
            doc = { ...source, body: { ...source.body!, textRuns: [] } };
            if (payload.text) {
                doc = { body: BuildTextUtils.transform.fromPlainText(payload.text) };
            }
        }
        if (!doc.body?.dataStream) {
            return false;
        }
        this._applyingPaste = true;
        try {
            // Keep preceding debounced typing out of the paste's undo entry.
            this._stateChangeManager.flushPendingChanges(unitId);
            const result = this._paste(doc, unitId);
            if (result && !isInternalEditorID(unitId)) {
                this._savePasteSession(payload, mode === 'text' ? cachedSource : source, style, mode, unitId);
            }
            return result;
        } finally {
            this._applyingPaste = false;
        }
    }

    private _getPasteStyle(unitId: string): IDocPasteStyle {
        const model = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)!;
        const ranges = this._docSelectionManagerService.getTextRanges(this._getSelectionParams(unitId)) ?? [];
        const range = ranges.find((item) => item.isActive) ?? ranges[0];
        const body = model.getSelfOrHeaderFooterModel(range?.segmentId ?? '')?.getBody();
        const paragraph = body?.paragraphs?.find((item) => item.startIndex >= (range?.startOffset ?? 0));
        const textStyle = body && range ? getStyleInTextRange(body, range, {}) : {};
        Tools.deleteNull(textStyle);
        const namedStyle = paragraph?.paragraphStyle?.namedStyleType;
        const headingStyle = namedStyle ? NAMED_STYLE_MAP[namedStyle] : {};
        return Tools.deepClone({
            textStyle: { ...this._menuStyleService.getDefaultStyle(), ...headingStyle, ...paragraph?.paragraphStyle?.textStyle, ...textStyle, ...this._menuStyleService.getStyleCache() },
            paragraphStyle: paragraph?.paragraphStyle,
        });
    }

    private _getPasteSelectionKey(): string {
        return JSON.stringify(this._docSelectionManagerService.getDocRanges().map((range) => [
            range.startOffset,
            range.endOffset,
            range.segmentId ?? '',
            range.rangeType ?? DOC_RANGE_TYPE.TEXT,
        ]));
    }

    private _savePasteSession(
        payload: IDocClipboardPayload,
        source: Partial<IDocumentData> | undefined,
        style: IDocPasteStyle,
        mode: DocPasteMode,
        unitId: string
    ): void {
        if (!source && !payload.html && !payload.internalJson) {
            this.dismissPasteOptions();
            return;
        }
        this._stateChangeManager.flushPendingChanges(unitId);
        const history = this._undoRedoService.pitchTopUndoElement();
        const ranges = this._docSelectionManagerService.getTextRanges(this._getSelectionParams(unitId));
        const range = ranges?.find((item) => item.isActive) ?? ranges?.[0];
        if (!history || history.unitID !== unitId || !range) {
            return;
        }
        this._lastSelectionKey = this._getPasteSelectionKey();
        this._pasteSession = { payload: { ...payload, text: payload.text ?? (source ? getClipboardPlainText(source) : undefined) }, source, style, history, selectionKey: this._getPasteSelectionKey() };
        this._pasteOptions$.next({ unitId, mode, range: { ...range, collapsed: true } });
    }

    private _getCurrentDocumentUnitId(): string | null {
        return this._univerInstanceService
            .getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            ?.getUnitId() ?? null;
    }

    private _canEditTargets(
        expectedUnitId?: string,
        ranges?: ReadonlyArray<ITextRangeWithStyle | IRectRangeWithStyle>
    ): boolean {
        const document = expectedUnitId
            ? this._univerInstanceService.getUnit<DocumentDataModel>(expectedUnitId, UniverInstanceType.UNIVER_DOC)
            : this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return false;
        }
        const selectionParams = this._getSelectionParams(document.getUnitId());
        const objectIds = new Set<string>();
        const targetRanges = ranges ?? [
            ...(this._docSelectionManagerService.getTextRanges(selectionParams) ?? []),
            ...(this._docSelectionManagerService.getRectRanges(selectionParams) ?? []),
        ];
        targetRanges.forEach((range) => {
            if (range.startOffset == null || range.endOffset == null) {
                return;
            }
            getDocumentEditTargetObjectIds(document, range.segmentId ?? '', range)
                .forEach((objectId) => objectIds.add(objectId));
        });
        const canEdit = canEditDocumentTargets(this._permissionService, document.getUnitId(), objectIds);
        if (!canEdit) {
            this._errorService.emitPermissionDenied(document.getUnitId(), objectIds);
        }
        return canEdit;
    }

    private async _cut(ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        const textRanges = ranges?.filter((range) => range.rangeType === DOC_RANGE_TYPE.TEXT) ?? this._docSelectionManagerService.getTextRanges() ?? [];
        const rectRanges = ranges?.filter((range) => range.rangeType === DOC_RANGE_TYPE.RECT) as IRectRangeWithStyle[] ?? this._docSelectionManagerService.getRectRanges() ?? [];
        const {
            segmentId,
            endOffset: activeEndOffset,
            style,
        } = textRanges[0] ?? {};
        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId is not existed');
        }

        if (textRanges.length === 0 && rectRanges.length === 0) {
            return false;
        }

        const unitId = this._getCurrentDocumentUnitId();
        if (!unitId || !this._canEditTargets(unitId, [...textRanges, ...rectRanges])) {
            return false;
        }

        const wholeBodySelected = this._docSelectionManagerService.getSelectionInfo()?.options?.wholeDocument === true;
        // Set content to clipboard.
        if (!await this.copy(SliceBodyType.cut, ranges)) {
            return false;
        }
        if (!this._canEditTargets(unitId, [...textRanges, ...rectRanges])) {
            return false;
        }

        try {
            let cursor = 0;

            if (rectRanges.length > 0) {
                cursor = getCursorWhenDelete(textRanges as Readonly<ITextRangeWithStyle[]>, rectRanges);
            } else if (activeEndOffset != null) {
                cursor = activeEndOffset;
                for (const range of textRanges) {
                    const { startOffset, endOffset } = range;

                    if (startOffset == null || endOffset == null) {
                        continue;
                    }

                    if (endOffset <= activeEndOffset) {
                        cursor -= endOffset - startOffset;
                    }
                }
            }

            const newTextRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            return this._commandService.executeCommand(CutContentCommand.id, {
                unitId,
                segmentId,
                textRanges: newTextRanges,
                rectRanges,
                selections: textRanges,
                wholeBodySelected,
            });
        } catch {
            this._logService.error('[DocClipboardController] cut content failed');
            return false;
        }
    }

    private _paste(docData: Partial<IDocumentData>, expectedUnitId?: string): boolean {
        const { body: _body } = docData;

        if (_body == null) {
            return false;
        }

        let body = normalizeBody(_body);

        const currentDocument = expectedUnitId
            ? this._univerInstanceService.getUnit<DocumentDataModel>(expectedUnitId, UniverInstanceType.UNIVER_DOC)
            : this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!currentDocument) {
            return false;
        }
        const unitId = currentDocument.getUnitId();
        const selectionParams = this._getSelectionParams(unitId);

        if (currentDocument.getDocumentStyle().documentFlavor !== DocumentFlavor.TRADITIONAL) {
            body = omitClipboardNotes(body);
        }

        this._clipboardHooks.forEach((hook) => {
            if (hook.onBeforePaste) {
                body = hook.onBeforePaste(body, {
                    documentData: docData,
                    targetUnitId: currentDocument.getUnitId(),
                });
            }
        });

        // Copy fragments retain trailing paragraph styles for HTML export even when the paragraph mark is not selected.
        // Only actual paragraph marks can become metadata in the inserted document body.
        if (body.paragraphs) {
            body.paragraphs = body.paragraphs.filter((paragraph) => body.dataStream[paragraph.startIndex] === '\r');
        }

        // copy custom ranges
        const customRangeMappings = body.customRanges?.map((sourceRange) => {
            const targetRange = BuildTextUtils.customRange.copyCustomRange(sourceRange);
            return { sourceRange, targetRange };
        }) ?? [];
        body.customRanges = customRangeMappings.map(({ targetRange }) => targetRange);

        body.paragraphs?.forEach((copy) => {
            if (copy.paragraphStyle?.headingId) {
                copy.paragraphStyle.headingId = generateRandomId(6);
            }
        });

        const ranges = this._docSelectionManagerService.getTextRanges(selectionParams) ?? [];
        const activeRange = ranges.find((range) => range.isActive);
        const docRanges = this._docSelectionManagerService.getDocRanges(selectionParams);
        const insertionAnchor = activeRange ?? docRanges.find((range) => range.isActive) ?? docRanges[0];
        const { segmentId, endOffset: activeEndOffset, style } = insertionAnchor || {};

        if (segmentId == null) {
            this._logService.error('[DocClipboardController] segmentId does not exist!');
        }

        if (activeEndOffset == null) {
            return false;
        }

        const originBody = segmentId == null ? null : currentDocument.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (originBody) {
            ensureParagraphAtStructuralGap(body, originBody, ranges);
        }

        try {
            // When doc has multiple selections, the cursor moves to the last pasted content's end.
            let cursor = activeEndOffset;
            for (const range of ranges) {
                const { startOffset, endOffset } = range;

                if (startOffset == null || endOffset == null) {
                    continue;
                }

                if (endOffset <= activeEndOffset) {
                    cursor += body.dataStream.length - (endOffset - startOffset);
                }
            }

            const textRanges = [
                {
                    startOffset: cursor,
                    endOffset: cursor,
                    style,
                },
            ];

            return this._commandService.syncExecuteCommand(InnerPasteCommand.id, {
                unitId,
                doc: {
                    ...docData,
                    body,
                },
                customRangeMappings,
                segmentId,
                textRanges,
            });
        } catch {
            this._logService.error('[DocClipboardController]', 'clipboard is empty.');
            return false;
        }
    }

    private async _setClipboardData(
        documentList: IDocumentData[],
        needCache = true,
        plainTextList?: readonly string[]
    ): Promise<void> {
        const copyId = generateRandomId(6);
        const text =
            (plainTextList
                ? plainTextList.join('\n')
                : documentList.length > 1
                    ? documentList.map((doc) => doc.body?.dataStream || '').join('\n')
                    : documentList[0].body?.dataStream || '')
                .replaceAll(DataStreamTreeTokenType.TABLE_START, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_END, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_ROW_START, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_ROW_END, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_CELL_START, '')
                .replaceAll(DataStreamTreeTokenType.TABLE_CELL_END, '')
                .replaceAll(DataStreamTreeTokenType.BLOCK_START, '')
                .replaceAll(DataStreamTreeTokenType.BLOCK_END, '')
                // Replace `\r\n` in table cell to white space.
                .replaceAll('\r\n', ' ')
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

        let html = this._umdToHtml.convert(documentList);
        let internalJson = '';
        let internalDocData: Partial<IDocumentData> | null = null;

        // Only cache copy content when the range is 1.
        if (documentList.length === 1 && needCache) {
            html = html.replace(/(<[a-z]+)/, (_p0, p1) => `${p1} data-copy-id="${copyId}"`);
            const doc = documentList[0];
            const cache = createInternalClipboardDocData(doc);

            copyContentCache.set(copyId, cache);
            internalDocData = cache;
        } else {
            internalDocData = createInternalClipboardDocDataList(documentList);
        }

        if (internalDocData) {
            internalDocData = this._applyCopyDocDataHooks(internalDocData, documentList);
            internalJson = createInternalClipboardFragment(internalDocData);
            html = embedInternalClipboardFragment(html, internalJson);
        }

        html = wrapClipboardHtml(html);

        await this._clipboardInterfaceService.write(text, html, internalJson ? { [DOC_INTERNAL_FRAGMENT_MIME]: internalJson } : undefined);
        this._memoryClipboardData = Tools.deepClone(internalDocData);
    }

    private _getSelectionParams(unitId: string): { unitId: string; subUnitId: string } {
        const currentSelection = this._docSelectionManagerService.__getCurrentSelection();
        return currentSelection?.unitId === unitId
            ? currentSelection
            : { unitId, subUnitId: unitId };
    }

    addClipboardHook(hook: IDocClipboardHook): IDisposable {
        this._clipboardHooks.push(hook);

        return toDisposable(() => {
            const index = this._clipboardHooks.indexOf(hook);

            if (index > -1) {
                this._clipboardHooks.splice(index, 1);
            }
        });
    }

    private _applyCopyDocDataHooks(doc: Partial<IDocumentData>, sourceDocuments: IDocumentData[]): Partial<IDocumentData> {
        return this._clipboardHooks.reduce((currentDoc, hook) => {
            return hook.onCopyDocData?.(currentDoc, { sourceDocuments }) ?? currentDoc;
        }, doc);
    }

    private _getDocumentBodyInRanges(sliceType: SliceBodyType, ranges?: ITextRangeWithStyle[]) {
        const docDataModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const allRanges = ranges ?? this._docSelectionManagerService.getDocRanges();

        const results: IDocumentData['body'][] = [];
        const plainTextResults: string[] = [];
        const copyContentHook = this._clipboardHooks.find((hook) => hook.onCopyContent)?.onCopyContent;
        let needCache = true;

        if (docDataModel == null || allRanges.length === 0) {
            return;
        }

        const segmentId = allRanges[0].segmentId;

        const body = docDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody();

        const snapshot = docDataModel.getSnapshot();

        if (body == null) {
            return;
        }

        for (const range of allRanges) {
            const { startOffset, endOffset, collapsed, rangeType } = range;

            if (collapsed || startOffset == null || endOffset == null) {
                continue;
            }

            if (rangeType === DOC_RANGE_TYPE.RECT) {
                needCache = false;

                const bodySlice = getTableClipboardBodySlice(body, range as IRectRangeWithStyle);

                results.push(bodySlice);
                plainTextResults.push(bodySlice.dataStream);

                continue;
            }

            const deleteRange = { startOffset, endOffset, collapsed };

            const docBody = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.sliceBody(deleteRange.startOffset, deleteRange.endOffset, sliceType);
            if (docBody == null) {
                continue;
            }

            // Text inside a cell is not a nested table. Keep only completely copied table structures.
            if (docBody.tables?.length) {
                const completeTableIds = new Set(body.tables?.filter((table) => (
                    table.startIndex >= startOffset && table.endIndex <= endOffset
                )).map((table) => table.tableId));
                docBody.tables = docBody.tables.filter((table) => completeTableIds.has(table.tableId));
            }

            results.push(docBody);
            plainTextResults.push(
                copyContentHook?.(
                    deleteRange.startOffset,
                    deleteRange.endOffset,
                    {
                        body,
                        segmentId,
                        unitId: docDataModel.getUnitId(),
                    }
                ) ??
                docBody.dataStream
            );
        }
        return {
            newSnapshotList: results.map((e) => ({ ...snapshot, body: e })),
            needCache,
            plainTextList: plainTextResults,
            snapshot,
            ranges: allRanges,
        };
    }

    private async _readClipboardItems(items: ClipboardItem[]): Promise<IDocClipboardPayload> {
        try {
            let html = '';
            let text: string | undefined;
            let internalJson = '';
            const files: File[] = [];
            for (const clipboardItem of items) {
                for (const type of clipboardItem.types) {
                    switch (type) {
                        case DOC_INTERNAL_FRAGMENT_MIME: {
                            internalJson = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                            break;
                        }
                        case PLAIN_TEXT_CLIPBOARD_MIME_TYPE: {
                            text = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                            break;
                        }
                        case HTML_CLIPBOARD_MIME_TYPE: {
                            html = await clipboardItem.getType(type).then((blob) => blob && blob.text());
                            break;
                        }
                        case FILE__BMP_CLIPBOARD_MIME_TYPE:
                        case FILE__JPEG_CLIPBOARD_MIME_TYPE:
                        case FILE__WEBP_CLIPBOARD_MIME_TYPE:
                        case FILE_PNG_CLIPBOARD_MIME_TYPE: {
                            const blob = await clipboardItem.getType(type);
                            const file = new File([blob], `pasted_image.${type.split('/')[1]}`, { type });
                            files.push(file);
                            break;
                        }
                    }
                }
            }
            return { html, text, internalJson, files };
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private _genDocDataFromHtmlAndText(html?: string, text?: string, _unitId?: string, internalJson?: string): Partial<IDocumentData> {
        const internalDocData = parseInternalClipboardFragment(internalJson) ?? extractInternalClipboardFragmentFromHtml(html);
        if (internalDocData?.body) {
            return internalDocData;
        }

        if (!html) {
            if (text) {
                const body = BuildTextUtils.transform.fromPlainText(text);

                return { body };
            } else {
                throw new Error('[DocClipboardService] html and text cannot be both empty!');
            }
        }

        const copyId = extractId(html);
        if (copyId) {
            const copyCache = copyContentCache.get(copyId);
            if (copyCache) {
                return copyCache;
            }
        }

        const currentDocInstance = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
        const unitId = _unitId || currentDocInstance?.getUnitId() || '';
        const doc = this._htmlToUDM.convert(html, { unitId });

        if (copyId) {
            copyContentCache.set(copyId, doc);
        }
        return doc;
    }

    private async _uploadBase64ImagesInHtml(html?: string): Promise<string | undefined> {
        if (!html || !html.includes('data:image/')) {
            return html;
        }

        const onBeforePasteImage = this._clipboardHooks.find((e) => e.onBeforePasteImage)?.onBeforePasteImage;
        if (!onBeforePasteImage) {
            return html;
        }

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const images = Array.from(doc.querySelectorAll<HTMLImageElement>('img[src^="data:image/"]'));
        if (images.length === 0) {
            return html;
        }

        await Promise.all(images.map(async (image, index) => {
            if (image.dataset.imageSourceType && image.dataset.imageSourceType !== ImageSourceType.BASE64) {
                return;
            }

            const file = dataUrlToFile(image.getAttribute('src') || image.src, `pasted_image_${index}`);
            const uploaded = await onBeforePasteImage(file);
            if (!uploaded) {
                return;
            }

            image.dataset.imageSourceType = uploaded.imageSourceType;
            if (uploaded.imageSourceType === ImageSourceType.UUID) {
                image.dataset.source = uploaded.source;
                image.setAttribute('src', uploaded.source);
            } else {
                image.removeAttribute('data-source');
                image.setAttribute('src', uploaded.source);
            }
        }));

        return /<(?:html|head)\b/i.test(html) ? doc.documentElement.outerHTML : doc.body.innerHTML;
    }

    private async _createImagePasteHtml(files: File[]) {
        const doc: IDocumentData = {
            id: '',
            documentStyle: {},
            body: {
                dataStream: '',
                customBlocks: [],
            },
            drawings: {},
        };
        const fileToBase64 = async (file: File): Promise<{ source: string; imageSourceType: ImageSourceType }> => {
            const reader = new FileReader();
            return new Promise((res) => {
                reader.onloadend = function () {
                    res({
                        source: reader.result as string,
                        imageSourceType: ImageSourceType.BASE64,
                    });
                };
                reader.readAsDataURL(file);
            });
        };
        const getImageSize = (base64: string | File): Promise<{ width: number; height: number }> => {
            const img = new Image();
            const maxWidth = 500;
            return new Promise((resolve) => {
                img.src = typeof base64 === 'string' ? base64 : URL.createObjectURL(base64);
                img.onload = () => {
                    const width = Math.min(maxWidth, img.naturalWidth);
                    const scale = img.naturalHeight / img.naturalWidth;
                    resolve({ width, height: width * scale });
                };
            });
        };
        // clipboardHooks should be redesigned to handle the ability of multiple hooks processing the same node
        // Refer to interceptor
        const onBeforePasteImage = this._clipboardHooks.find((e) => e.onBeforePasteImage)?.onBeforePasteImage ?? fileToBase64;

        await Promise.all(files.map(async (file, index) => {
            const image = await onBeforePasteImage(file);
            if (!image) {
                return Promise.resolve();
            }
            const { width = 100, height = 100 } = await getImageSize(file);
            const itemId = `paste_image_id_${index}`;
            const body = doc.body!;
            const drawings = doc.drawings!;
            body.dataStream += '\b';
            body.customBlocks?.push({ startIndex: index, blockId: itemId });
            drawings[itemId] = {
                drawingId: itemId,
                unitId: '',
                subUnitId: '',
                imageSourceType: image.imageSourceType,
                title: '',
                source: image.source,
                description: '',
                layoutType: PositionedObjectLayoutType.INLINE,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    width,
                    height,
                    angle: 0,
                },
                docTransform: {
                    angle: 0,
                    size: { width, height },
                    positionH: { relativeFrom: ObjectRelativeFromH.CHARACTER, posOffset: 0 },
                    positionV: { relativeFrom: ObjectRelativeFromV.LINE, posOffset: 0 },
                },
            } as IDocImage;
        }));
        const html = this._umdToHtml.convert([doc]);
        return html;
    }
}

function endsAtDocumentBoundary(dataStream: string): boolean {
    const lastToken = dataStream[dataStream.length - 1];

    return lastToken === DataStreamTreeTokenType.PARAGRAPH ||
        lastToken === DataStreamTreeTokenType.SECTION_BREAK ||
        lastToken === DataStreamTreeTokenType.BLOCK_END ||
        lastToken === DataStreamTreeTokenType.TABLE_END ||
        lastToken === DataStreamTreeTokenType.COLUMN_GROUP_END;
}

function ensureParagraphAtStructuralGap(body: IDocumentBody, originBody: IDocumentBody, ranges: readonly ITextRangeWithStyle[]): void {
    if (
        endsAtDocumentBoundary(body.dataStream) ||
        !ranges.every((range) => range.collapsed && isTopLevelStructuralGap(originBody.dataStream, range.startOffset))
    ) {
        return;
    }

    const paragraphIndex = body.dataStream.length;
    const paragraphIds = new Set(body.paragraphs?.map((paragraph) => paragraph.paragraphId) ?? []);
    body.dataStream += DataStreamTreeTokenType.PARAGRAPH;
    body.paragraphs = [
        ...(body.paragraphs ?? []),
        { startIndex: paragraphIndex, paragraphId: createParagraphId(paragraphIds) },
    ];
}

function dataUrlToFile(dataUrl: string, fallbackName: string): File {
    const match = /^data:([^;,]+)(;base64)?,(.*)$/i.exec(dataUrl);
    if (!match) {
        throw new Error('[DocClipboardService] invalid image data url.');
    }

    const [, mimeType, base64Marker, payload] = match;
    const bytes = base64Marker
        ? Uint8Array.from(atob(payload), (char) => char.charCodeAt(0))
        : new TextEncoder().encode(decodeURIComponent(payload));
    const extension = mimeType.split('/')[1] || 'png';

    return new File([bytes], `${fallbackName}.${extension}`, { type: mimeType });
}
