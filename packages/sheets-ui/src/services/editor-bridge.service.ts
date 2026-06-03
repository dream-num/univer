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

import type { DocumentDataModel, IDisposable, IPosition, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import type { Engine, IDocumentLayoutObject, Scene } from '@univerjs/engine-render';
import type { KeyCode } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import {
    CellValueType,
    convertCellToRange,
    createIdentifier,
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_STANDALONE,
    IContextService,
    Inject,
    isFirstStrongCharRTL,
    IUniverInstanceService,
    TextDirection,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { getCanvasOffsetByEngine, IEditorService } from '@univerjs/docs-ui';
import { convertTextRotation, convertTransformToOffsetX, convertTransformToOffsetY, DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { attachPrimaryWithCoord, BEFORE_CELL_EDIT, SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';

export interface IEditorBridgeServiceVisibleParam {
    visible: boolean;
    eventType: DeviceInputEventType;
    unitId: string;
    keycode?: KeyCode;
}

export interface ICurrentEditCellParam {
    scene: Scene;
    engine: Engine;
    unitId: string;
    sheetId: string;
    primary: ISelectionCell;
}

export interface ICellEditorState {
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
    documentLayoutObject: IDocumentLayoutObject;
    editorUnitId: string;
    isInArrayFormulaRange?: Nullable<boolean>;
}

export interface ICellEditorLayout {
    position: IPosition;
    canvasOffset: { left: number; top: number };
    scaleX: number;
    scaleY: number;
}

export interface IEditorBridgeServiceParam extends ICellEditorState, ICellEditorLayout {

}

export interface IEditorBridgeService {
    currentEditCellState$: Observable<Nullable<ICellEditorState>>;
    currentEditCellLayout$: Observable<Nullable<ICellEditorLayout>>;
    currentEditCell$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    forceKeepVisible$: Observable<boolean>;
    /**
     * Stream of the *effective* text direction for the active cell editor.
     * Re-evaluates whenever the editor's body content changes (typing, paste,
     * delete) so the wrapper `<div dir>`, the hidden contenteditable, the
     * cell-editor resize math, and the canvas paragraph alignment can all
     * react in real time.
     *
     * Resolution order:
     *  1. The cell's explicit `style.td`.
     *  2. First-strong character in the live editor body.
     *  3. LTR fallback.
     */
    effectiveTextDirection$: Observable<TextDirection>;

    dispose(): void;
    refreshEditCellState(): void;
    refreshEditCellPosition(resetSizeOnly?: boolean): void;
    setEditCell(param: ICurrentEditCellParam): void;
    getEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    getEditCellLayout(): Readonly<Nullable<ICellEditorLayout>>;
    getEditLocation(): Readonly<Nullable<ICellEditorState>>;
    updateEditLocation(row: number, col: number): void;
    // Gets the DocumentDataModel of the latest table cell based on the latest cell contents
    getLatestEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    /**
     * @deprecated do not use it directly, use command SetCellEditVisibleOperation as instead.
     */
    changeVisible(param: IEditorBridgeServiceVisibleParam): void;
    changeEditorDirty(dirtyStatus: boolean): void;
    getEditorDirty(): boolean;
    isVisible(): IEditorBridgeServiceVisibleParam;
    enableForceKeepVisible(): void;
    disableForceKeepVisible(): void;
    isForceKeepVisible(): boolean;
    getCurrentEditorId(): string;
    helpFunctionVisible$: BehaviorSubject<boolean>;
    /**
     * Recompute the cell editor's effective text direction based on the
     * **live** content in the editor docs unit, write it back into the
     * editor's `documentStyle.renderConfig.textDirection` and per-paragraph
     * `paragraphStyle.direction`, and emit on `effectiveTextDirection$`.
     *
     * Call this on every keystroke / RichTextEditingMutation so the
     * direction tracks reality (e.g. empty → Arabic flips to RTL, deleting
     * back to ASCII flips to LTR).
     */
    syncEditorTextDirection(): void;
    getEffectiveTextDirection(): TextDirection;
}

export class EditorBridgeService extends Disposable implements IEditorBridgeService, IDisposable {
    private _editorUnitId: string = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    private _editorIsDirty: boolean = false;

    private _visibleParams: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
        unitId: '',
    };

    private _currentEditCell: Nullable<ICurrentEditCellParam> = null;
    private _currentEditCellState: Nullable<ICellEditorState> = null;
    private _currentEditCellLayout: Nullable<ICellEditorLayout> = null;

    helpFunctionVisible$ = new BehaviorSubject(true);

    // TODO: @weird94 this should split into to subjects, documentDataModel & position
    private readonly _currentEditCellState$ = new BehaviorSubject<Nullable<ICellEditorState>>(null);
    readonly currentEditCellState$ = this._currentEditCellState$.asObservable();

    private readonly _currentEditCellLayout$ = new BehaviorSubject<Nullable<ICellEditorLayout>>(null);
    readonly currentEditCellLayout$ = this._currentEditCellLayout$.asObservable();

    readonly currentEditCell$ = this._currentEditCellState$.pipe(
        switchMap((editCellState) => this._currentEditCellLayout$.pipe(map((layout) => (editCellState && layout ? { ...editCellState, ...layout } : null))))
    );

    private readonly _visibleParams$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visibleParams);
    readonly visible$ = this._visibleParams$.asObservable();

    private readonly _afterVisibleParams$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visibleParams);
    readonly afterVisible$ = this._afterVisibleParams$.asObservable();

    private readonly _forceKeepVisible$ = new BehaviorSubject(false);
    readonly forceKeepVisible$ = this._forceKeepVisible$.asObservable();

    // Live effective direction for the cell editor. Distinct so subscribers
    // re-render exactly when it flips (e.g. user types Arabic into an empty
    // English-leaning cell). Starts LTR; reset on each editor open.
    private readonly _effectiveTextDirection$ = new BehaviorSubject<TextDirection>(TextDirection.LEFT_TO_RIGHT);
    readonly effectiveTextDirection$ = this._effectiveTextDirection$.asObservable();

    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();

        this.disposeWithMe(toDisposable(() => {
            this._currentEditCellState$.complete();
            this._currentEditCell = null;
        }));

        this._univerInstanceService.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
            if (unit.getUnitId() === this._currentEditCellState?.unitId) {
                this._clearCurrentEditCellState();
            }
        });
    }

    refreshEditCellState() {
        const editCellState = this.getLatestEditCellState();
        if (!editCellState) {
            this._currentEditCellState = null;
            this._currentEditCellLayout = null;
            this._currentEditCellState$.next(null);
            this._currentEditCellLayout$.next(null);
            // Editor closing → reset live direction so the next open starts
            // with a clean LTR baseline (cell may have no content yet).
            if (this._effectiveTextDirection$.getValue() !== TextDirection.LEFT_TO_RIGHT) {
                this._effectiveTextDirection$.next(TextDirection.LEFT_TO_RIGHT);
            }
            return;
        }
        const { position, scaleX, scaleY, canvasOffset, ...rest } = editCellState;
        this._currentEditCellState = rest;
        this._currentEditCellLayout = { position, scaleX, scaleY, canvasOffset };
        this._currentEditCellState$.next(this._currentEditCellState);
        this._currentEditCellLayout$.next(this._currentEditCellLayout);

        // Seed the live direction stream with the snapshot value so the
        // editor's `<div dir>` is correct *before* the user starts typing.
        const seedDir = rest.documentLayoutObject
            ?.documentModel
            ?.documentStyle
            ?.renderConfig
            ?.textDirection;
        const initial = seedDir === TextDirection.RIGHT_TO_LEFT
            ? TextDirection.RIGHT_TO_LEFT
            : TextDirection.LEFT_TO_RIGHT;
        if (this._effectiveTextDirection$.getValue() !== initial) {
            this._effectiveTextDirection$.next(initial);
        }
    }

    refreshEditCellPosition(resetSizeOnly?: boolean) {
        if (!this._currentEditCell || !this._currentEditCellState) return;

        const { unitId, sheetId, primary, scene, engine } = this._currentEditCell;
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook || workbook.getUnitId() !== unitId) return;

        const worksheet = workbook.getActiveSheet();
        if (!worksheet || worksheet.getSheetId() !== sheetId) return;

        const renderUnit = this._renderManagerService.getRenderUnitById(unitId);
        if (!renderUnit) return;

        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, sheetId);
        if (!skeleton) return;

        const primaryWithCoord = attachPrimaryWithCoord(skeleton, primary);
        const actualRangeWithCoord = convertCellToRange(primaryWithCoord);
        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();
        const scrollXY = scene.getViewportScrollXY(renderUnit.with(ISheetSelectionRenderService).getViewPort());

        startX = convertTransformToOffsetX(startX, scaleX, scrollXY);
        startY = convertTransformToOffsetY(startY, scaleY, scrollXY);
        endX = convertTransformToOffsetX(endX, scaleX, scrollXY);
        endY = convertTransformToOffsetY(endY, scaleY, scrollXY);

        if (resetSizeOnly && this._currentEditCellLayout) {
            endX = endX - startX + this._currentEditCellLayout.position.startX;
            endY = endY - startY + this._currentEditCellLayout.position.startY;
            startX = this._currentEditCellLayout.position.startX;
            startY = this._currentEditCellLayout.position.startY;
        }

        this._currentEditCellLayout = {
            position: {
                startX,
                startY,
                endX,
                endY,
            },
            canvasOffset,
            scaleX,
            scaleY,
        };
        this._currentEditCellLayout$.next(this._currentEditCellLayout);
    }

    setEditCell(param: ICurrentEditCellParam) {
        this._currentEditCell = param;

        /**
         * If there is no editor currently focused, then default to selecting the sheet editor to prevent the editorService from using the previously selected editor object.
         * todo: wzhudev: In boundless mode, it is necessary to switch to the corresponding editorId based on the host's unitId.
         */
        if (!this._editorService.getFocusEditor()) {
            this._editorService.focus(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            /**
             * Fix: When the sheet loads for the first time, copying and pasting triggers the editor, and the edits are ineffective.
             */
            this._contextService.setContextValue(EDITOR_ACTIVATED, false);
            this._contextService.setContextValue(FOCUSING_EDITOR_STANDALONE, false);
        }

        const editCellState = this.getLatestEditCellState();
        if (!editCellState) {
            this._currentEditCellState = editCellState;
            this._currentEditCellLayout = editCellState;
            this._currentEditCellState$.next(editCellState);
            this._currentEditCellLayout$.next(editCellState);
            return;
        }

        const { position, canvasOffset, scaleX, scaleY, ...rest } = editCellState;
        this._currentEditCellState = rest;
        this._currentEditCellLayout = { position, canvasOffset, scaleX, scaleY };
        this._currentEditCellState$.next(this._currentEditCellState);
        this._currentEditCellLayout$.next(this._currentEditCellLayout);
    }

    private _clearCurrentEditCellState() {
        this._currentEditCellState = null;
        this._currentEditCellState$.next(null);
        this._currentEditCellLayout = null;
        this._currentEditCellLayout$.next(null);
    }

    getEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        if (this._currentEditCellState == null || this._currentEditCellLayout == null) {
            return null;
        }

        return { ...this._currentEditCellState, ...this._currentEditCellLayout };
    }

    getEditCellLayout(): Readonly<Nullable<ICellEditorLayout>> {
        return this._currentEditCellLayout;
    }

    getEditLocation(): Readonly<Nullable<ICellEditorState>> {
        return this._currentEditCellState;
    }

    updateEditLocation(row: number, column: number) {
        if (this._currentEditCellState) {
            this._currentEditCellState = {
                ...this._currentEditCellState,
                row,
                column,
            };
        }
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    getLatestEditCellState() {
        if (!this._currentEditCell) return;

        const { unitId, sheetId, primary, scene, engine } = this._currentEditCell;
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook || workbook.getUnitId() !== unitId) return;

        const worksheet = workbook.getActiveSheet();
        if (!worksheet || worksheet.getSheetId() !== sheetId) return;

        const renderUnit = this._renderManagerService.getRenderUnitById(unitId);
        if (!renderUnit) return;

        const skeleton = this._sheetSkeletonService.getSkeleton(unitId, sheetId);
        if (!skeleton) return;

        const { startRow, startColumn } = primary;
        const primaryWithCoord = attachPrimaryWithCoord(skeleton, primary);
        const actualRangeWithCoord = convertCellToRange(primaryWithCoord);
        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();
        const scrollXY = scene.getViewportScrollXY(renderUnit.with(ISheetSelectionRenderService).getViewPort());

        startX = convertTransformToOffsetX(startX, scaleX, scrollXY);
        startY = convertTransformToOffsetY(startY, scaleY, scrollXY);
        endX = convertTransformToOffsetX(endX, scaleX, scrollXY);
        endY = convertTransformToOffsetY(endY, scaleY, scrollXY);

        const location = {
            workbook,
            worksheet,
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            row: startRow,
            col: startColumn,
            origin: worksheet.getCellRaw(startRow, startColumn),
        };

        let documentLayoutObject: Nullable<IDocumentLayoutObject>;
        const cell = this._sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT)(
            worksheet.getCell(startRow, startColumn),
            location
        );

        documentLayoutObject = cell && worksheet.getCellDocumentModelWithFormula(cell, location.row, location.col);

        // Rewrite the cellValueType to STRING so the document doesn't right-align
        // numeric cells while we're editing them. For RTL cells we keep the
        // original cellValueType because `_horizontalHandler` already decides
        // the default alignment based on `renderConfig.textDirection` and we
        // don't want to override the natural RTL right-alignment.
        const renderConfig = documentLayoutObject?.documentModel?.documentStyle.renderConfig;
        if (renderConfig != null) {
            const isRTL = renderConfig.textDirection === TextDirection.RIGHT_TO_LEFT;
            if (!isRTL) {
                renderConfig.cellValueType = CellValueType.STRING;
            }
        }

        if (!documentLayoutObject || documentLayoutObject.documentModel == null) {
            const blankModel = worksheet.getBlankCellDocumentModel(cell, location.row, location.col);

            if (documentLayoutObject != null) {
                const { verticalAlign, horizontalAlign, wrapStrategy, textRotation, fill } = documentLayoutObject;
                const { centerAngle, vertexAngle } = convertTextRotation(textRotation);
                blankModel.documentModel!.documentStyle.renderConfig = {
                    ...renderConfig,
                    verticalAlign,
                    horizontalAlign,
                    wrapStrategy,
                    background: { rgb: fill },
                    centerAngle,
                    vertexAngle,
                };
            }
            documentLayoutObject = blankModel;
        }
        // background of canvas is set to transparent, so if no bgcolor sepcified in curr cell, set it to white.
        documentLayoutObject.fill = documentLayoutObject.fill || '#fff';
        documentLayoutObject.documentModel?.setZoomRatio(Math.max(scaleX, scaleY));

        if (cell?.isInArrayFormulaRange === true) {
            const body = documentLayoutObject.documentModel?.getBody();
            if (body) {
                body.textRuns = [
                    {
                        st: 0,
                        ed: body.dataStream.length - 2,
                        ts: {
                            cl: {
                                rgb: this._themeService.getColorFromTheme('gray.300'),
                            },
                        },
                    },
                ];
            }
        }

        return {
            position: {
                startX,
                startY,
                endX,
                endY,
            },
            scaleX,
            scaleY,
            canvasOffset,
            row: startRow,
            column: startColumn,
            unitId,
            sheetId,
            documentLayoutObject,
            editorUnitId: this._editorUnitId,
            isInArrayFormulaRange: cell?.isInArrayFormulaRange,
        };
    }

    getCurrentEditorId() {
        return this._editorUnitId;
    }

    changeVisible(params: IEditorBridgeServiceVisibleParam) {
        this._visibleParams = params;

        // Reset the dirty status when the editor is visible.
        if (params.visible) {
            this._editorIsDirty = false;
        }

        this._visibleParams$.next(this._visibleParams);
        this._afterVisibleParams$.next(this._visibleParams);
    }

    isVisible() {
        return this._visibleParams;
    }

    enableForceKeepVisible(): void {
        this._forceKeepVisible$.next(true);
    }

    disableForceKeepVisible(): void {
        this._forceKeepVisible$.next(false);
    }

    isForceKeepVisible(): boolean {
        return this._forceKeepVisible$.getValue();
    }

    changeEditorDirty(dirtyStatus: boolean) {
        this._editorIsDirty = dirtyStatus;
    }

    getEditorDirty() {
        return this._editorIsDirty;
    }

    getEffectiveTextDirection(): TextDirection {
        return this._effectiveTextDirection$.getValue();
    }

    syncEditorTextDirection(): void {
        // Only the cell author's *explicit* `style.td` is treated as a hard
        // override. Snapshot renderConfig values that came from content
        // auto-detection should not be sticky once the user starts editing,
        // because the content is now in flux.
        const explicitTd = this._getEditCellExplicitTextDirection();

        // Push per-paragraph directions into the live editor model so each
        // line (e.g. each bullet in a list) flips independently when its
        // first-strong character is RTL / LTR. `explicitTd != null` makes
        // the whole cell honour the author's choice regardless of content.
        // The returned `baselineDir` is the single cell-level direction
        // that outer UI surfaces (container `<div dir>`, resize math)
        // should follow.
        const baselineDir = this._applyEditorDirection(explicitTd);

        if (this._effectiveTextDirection$.getValue() !== baselineDir) {
            this._effectiveTextDirection$.next(baselineDir);
        }
    }

    /**
     * Returns the cell's explicit `style.td` (LTR / RTL) when set, or
     * `undefined` when the cell has no direction set / is `UNSPECIFIED`.
     * Reads from the actual workbook so it can't be fooled by the renderConfig
     * value that was previously auto-derived from the seed content.
     */
    private _getEditCellExplicitTextDirection(): TextDirection | undefined {
        const state = this._currentEditCellState;
        if (!state) return undefined;
        const workbook = this._univerInstanceService.getUnit<Workbook>(state.unitId, UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getSheetBySheetId(state.sheetId);
        const style = worksheet?.getComposedCellStyle(state.row, state.column);
        const td = style?.td;
        return td != null && td !== TextDirection.UNSPECIFIED ? td : undefined;
    }

    /**
     * Concatenate the editor body's dataStream. We strip the trailing
     * sentinel paragraph break + chapter break that Univer always appends.
     */
    private _readEditorBodyText(): string {
        const editorDoc = this._univerInstanceService.getUnit<DocumentDataModel>(
            DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            UniverInstanceType.UNIVER_DOC
        );
        const body = editorDoc?.getBody();
        const stream = body?.dataStream ?? '';
        // The dataStream ends with `\r\n` (paragraph break + section end).
        // Slicing it off avoids false-positives on neutral terminators.
        return stream.replace(/[\r\n]+$/, '');
    }

    /**
     * Push paragraph-level directions into the live editor docs unit so the
     * canvas pipeline (`_horizontalHandler`, `applyBidiReorderToLine`) and
     * `cell-editor-resize.service` `effectiveHorizontalAlign` math see the
     * same source of truth. Callers (`fitTextSize` / the React container)
     * handle the DOM-side `<div dir>` + contenteditable updates.
     *
     * @param explicitOverride When set, every paragraph and the document
     *   renderConfig get this single direction (cell-level explicit
     *   `style.td`). When `undefined`, each paragraph independently picks
     *   a direction from its own first-strong character — this is what
     *   makes mixed-direction list cells (Arabic bullet → English bullet)
     *   align each row correctly.
     * @returns The single "baseline" direction representing the whole
     *   cell, used by outer UI signals (`<div dir>`, resize math, the
     *   `effectiveTextDirection$` observable). Equals `explicitOverride`
     *   when set, otherwise the first paragraph's resolved direction
     *   (LTR fallback when the cell has no paragraphs / content).
     */
    private _applyEditorDirection(explicitOverride: TextDirection | undefined): TextDirection {
        const editorDoc = this._univerInstanceService.getUnit<DocumentDataModel>(
            DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            UniverInstanceType.UNIVER_DOC
        );
        if (!editorDoc) return explicitOverride ?? TextDirection.LEFT_TO_RIGHT;

        const body = editorDoc.getBody();
        if (!body?.paragraphs) {
            return explicitOverride ?? TextDirection.LEFT_TO_RIGHT;
        }

        const dataStream = body.dataStream ?? '';
        let prevParagraphEnd = 0;
        let firstParagraphDir: TextDirection | undefined;
        // Carry the previously resolved direction forward so that a brand-
        // new empty paragraph created by Enter (no strong char yet) keeps
        // pointing in the same direction as the line the user just left.
        // Without this, an empty RTL paragraph silently falls back to LTR
        // and the caret jumps to the visual left edge — even though the
        // user expects to keep typing Arabic on the right.
        let inheritedDir: TextDirection | undefined;

        for (const paragraph of body.paragraphs) {
            if (!paragraph.paragraphStyle) {
                paragraph.paragraphStyle = {};
            }

            let nextDir: TextDirection;
            if (explicitOverride != null) {
                nextDir = explicitOverride;
            } else {
                const sliceStart = prevParagraphEnd;
                const sliceEnd = paragraph.startIndex;
                const paragraphText = sliceEnd > sliceStart
                    ? dataStream.slice(sliceStart, sliceEnd)
                    : '';
                if (paragraphText.length === 0) {
                    // Empty paragraph: keep whatever the previous
                    // paragraph resolved to (or the paragraph's own
                    // previously-declared direction, if any). Falling
                    // back to LTR here is what made Enter-in-RTL pop
                    // the caret to the wrong side.
                    nextDir = inheritedDir
                        ?? paragraph.paragraphStyle.direction
                        ?? TextDirection.LEFT_TO_RIGHT;
                } else if (isFirstStrongCharRTL(paragraphText)) {
                    nextDir = TextDirection.RIGHT_TO_LEFT;
                } else {
                    nextDir = TextDirection.LEFT_TO_RIGHT;
                }
            }

            if (paragraph.paragraphStyle.direction !== nextDir) {
                paragraph.paragraphStyle.direction = nextDir;
            }
            if (firstParagraphDir === undefined) {
                firstParagraphDir = nextDir;
            }
            inheritedDir = nextDir;

            prevParagraphEnd = paragraph.startIndex + 1;
        }

        // Document-level renderConfig.textDirection drives the page-level
        // `_horizontalHandler` default-alignment fallback (used when the
        // cell has no explicit `horizontalAlign`). In multi-line cells
        // the page can carry only one baseline, so we use:
        //   - the explicit cell-level direction when set, or
        //   - the first paragraph's auto-detected direction as the visual
        //     baseline of the cell box.
        // Per-paragraph alignment of the actual glyph rows is handled
        // independently in `horizontalAlignHandler` from each paragraph's
        // own `direction` written above.
        const renderConfig = editorDoc.documentStyle.renderConfig;
        const baselineDir = explicitOverride ?? firstParagraphDir ?? TextDirection.LEFT_TO_RIGHT;
        if (renderConfig && renderConfig.textDirection !== baselineDir) {
            renderConfig.textDirection = baselineDir;
        }
        return baselineDir;
    }
}

export const IEditorBridgeService = createIdentifier<IEditorBridgeService>('univer.sheet-editor-bridge.service');
