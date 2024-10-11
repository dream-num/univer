/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, ICellDataForSheetInterceptor, IDisposable, IPosition, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import type { Engine, IDocumentLayoutObject, Scene } from '@univerjs/engine-render';
import type { ISheetLocation, SheetsSelectionsService } from '@univerjs/sheets';
import type { KeyCode } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import {
    CellValueType,
    createIdentifier,
    createInterceptorKey,
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
    IContextService,
    Inject,
    InterceptorManager,
    IUniverInstanceService,
    makeCellToSelection,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { getCanvasOffsetByEngine, IEditorService } from '@univerjs/docs-ui';
import { convertTextRotation, DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService } from '@univerjs/sheets';

import { BehaviorSubject } from 'rxjs';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';
import { attachPrimaryWithCoord } from './selection/util';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

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

export interface IEditorBridgeServiceParam {
    unitId: string;
    sheetId: string;
    row: number;
    column: number;
    position: IPosition;
    canvasOffset: { left: number; top: number };
    documentLayoutObject: IDocumentLayoutObject;
    scaleX: number;
    scaleY: number;
    editorUnitId: string;
    isInArrayFormulaRange?: Nullable<boolean>;
}

interface ISheetLocationForEditor extends ISheetLocation {
    origin: Nullable<ICellData>;
}

const BEFORE_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocationForEditor>('BEFORE_CELL_EDIT');
const AFTER_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocationForEditor>('AFTER_CELL_EDIT');
const AFTER_CELL_EDIT_ASYNC = createInterceptorKey<Promise<Nullable<ICellDataForSheetInterceptor>>, ISheetLocationForEditor>('AFTER_CELL_EDIT_ASYNC');

export interface IEditorBridgeService {
    currentEditCellState$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    interceptor: InterceptorManager<{
        BEFORE_CELL_EDIT: typeof BEFORE_CELL_EDIT;
        AFTER_CELL_EDIT: typeof AFTER_CELL_EDIT;
        AFTER_CELL_EDIT_ASYNC: typeof AFTER_CELL_EDIT_ASYNC;
    }>;
    dispose(): void;
    refreshEditCellState(): void;
    refreshEditCellPosition(resetSizeOnly?: boolean): void;
    setEditCell(param: ICurrentEditCellParam): void;
    getEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    // Gets the DocumentDataModel of the latest table cell based on the latest cell contents
    getLatestEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>>;
    changeVisible(param: IEditorBridgeServiceVisibleParam): void;
    changeEditorDirty(dirtyStatus: boolean): void;
    getEditorDirty(): boolean;
    isVisible(): IEditorBridgeServiceVisibleParam;
    enableForceKeepVisible(): void;
    disableForceKeepVisible(): void;
    isForceKeepVisible(): boolean;
    getCurrentEditorId(): Nullable<string>;
}

export class EditorBridgeService extends Disposable implements IEditorBridgeService, IDisposable {
    private _editorUnitId: string = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;

    private _isForceKeepVisible: boolean = false;

    private _editorIsDirty: boolean = false;

    private _visible: IEditorBridgeServiceVisibleParam = {
        visible: false,
        eventType: DeviceInputEventType.Dblclick,
        unitId: '',
    };

    private _currentEditCell: Nullable<ICurrentEditCellParam> = null;
    private _currentEditCellState: Nullable<IEditorBridgeServiceParam> = null;

    // TODO: @weird94 this should split into to subjects, documentDataModel & position
    private readonly _currentEditCellState$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly currentEditCellState$ = this._currentEditCellState$.asObservable();

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly visible$ = this._visible$.asObservable();

    private readonly _afterVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly afterVisible$ = this._afterVisible$.asObservable();

    readonly interceptor = new InterceptorManager({
        BEFORE_CELL_EDIT,
        AFTER_CELL_EDIT,
        AFTER_CELL_EDIT_ASYNC,
    });

    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService,
        @IRefSelectionsService private readonly _refSelectionsService: SheetsSelectionsService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();

        this.disposeWithMe(toDisposable(() => {
            this._currentEditCellState$.complete();
            this._currentEditCell = null;
        }));

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().AFTER_CELL_EDIT, {
            priority: -1,
            handler: (_value) => _value,
        }));

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().BEFORE_CELL_EDIT, {
            priority: -1,
            handler: (_value) => _value,
        }));

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().AFTER_CELL_EDIT_ASYNC, {
            priority: -1,
            handler: (_value) => _value,
        }));

        this._univerInstanceService.getTypeOfUnitDisposed$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => {
            if (unit.getUnitId() === this._currentEditCellState?.unitId) {
                this._clearCurrentEditCellState();
            }
        });
    }

    refreshEditCellState() {
        const editCellState = this.getLatestEditCellState();
        this._currentEditCellState = editCellState;

        this._currentEditCellState$.next(editCellState);
    }

    refreshEditCellPosition(resetSizeOnly?: boolean) {
        const currentEditCell = this._currentEditCell;
        if (currentEditCell == null) {
            return;
        }

        const ru = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET);
        if (!ru) return;

        const skeleton = ru.with(SheetSkeletonManagerService).getCurrentSkeleton();
        const selectionRenderService = ru.with(ISheetSelectionRenderService);
        if (!skeleton) return;
        if (!this._currentEditCellState) return;

        const { primary, unitId, sheetId, scene, engine } = currentEditCell;
        const { startRow, startColumn } = primary;
        const primaryWithCoord = attachPrimaryWithCoord(primary, skeleton);
        if (primaryWithCoord == null) {
            return;
        }

        const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);
        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = scene.getViewportScrollXY(selectionRenderService.getViewPort());
        startX = skeleton.convertTransformToOffsetX(startX, scaleX, scrollXY);
        startY = skeleton.convertTransformToOffsetY(startY, scaleY, scrollXY);
        endX = skeleton.convertTransformToOffsetX(endX, scaleX, scrollXY);
        endY = skeleton.convertTransformToOffsetY(endY, scaleY, scrollXY);

        if (resetSizeOnly && this._currentEditCellState) {
            endX = endX - startX + this._currentEditCellState.position.startX;
            endY = endY - startY + this._currentEditCellState.position.startY;
            startX = this._currentEditCellState.position.startX;
            startY = this._currentEditCellState.position.startY;
        }

        this._editorService.setOperationSheetUnitId(unitId);

        this._editorService.setOperationSheetSubUnitId(sheetId);

        const editCellState = {
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
            documentLayoutObject: this._currentEditCellState.documentLayoutObject,
            editorUnitId: this._editorUnitId,
            isInArrayFormulaRange: this._currentEditCellState?.isInArrayFormulaRange,
        };

        this._currentEditCellState = editCellState;
        this._currentEditCellState$.next(editCellState);
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
            this._contextService.setContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE, false);
        }

        const editCellState = this.getLatestEditCellState();

        this._currentEditCellState = editCellState;
        this._currentEditCellState$.next(editCellState);
    }

    private _clearCurrentEditCellState() {
        this._currentEditCellState = null;
        this._currentEditCellState$.next(null);
    }

    getEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return this._currentEditCellState;
    }

    // eslint-disable-next-line max-lines-per-function
    getLatestEditCellState() {
        const currentEditCell = this._currentEditCell;
        if (currentEditCell == null) {
            return;
        }

        const ru = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET);
        if (!ru) return;

        const skeleton = ru.with(SheetSkeletonManagerService).getCurrentSkeleton();
        const selectionRenderService = ru.with(ISheetSelectionRenderService);
        if (!skeleton) return;

        const { primary, unitId, sheetId, scene, engine } = currentEditCell;
        const { startRow, startColumn } = primary;
        const primaryWithCoord = attachPrimaryWithCoord(primary, skeleton);
        if (primaryWithCoord == null) {
            return;
        }

        const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);
        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = scene.getViewportScrollXY(selectionRenderService.getViewPort());
        startX = skeleton.convertTransformToOffsetX(startX, scaleX, scrollXY);
        startY = skeleton.convertTransformToOffsetY(startY, scaleY, scrollXY);
        endX = skeleton.convertTransformToOffsetX(endX, scaleX, scrollXY);
        endY = skeleton.convertTransformToOffsetY(endY, scaleY, scrollXY);

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;

        const location = {
            workbook,
            worksheet,
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            row: startRow,
            col: startColumn,
            origin: worksheet.getCellRaw(startRow, startColumn),
        };

        const cell = this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().BEFORE_CELL_EDIT)(
            worksheet.getCell(startRow, startColumn),
            location
        );

        let documentLayoutObject = cell && skeleton.getCellDocumentModelWithFormula(cell);

        // Rewrite the cellValueType to STRING to avoid render the value on the right side when number type.
        const renderConfig = documentLayoutObject?.documentModel?.documentStyle.renderConfig;
        if (renderConfig != null) {
            renderConfig.cellValueType = CellValueType.STRING;
        }

        if (!documentLayoutObject || documentLayoutObject.documentModel == null) {
            const blankModel = skeleton.getBlankCellDocumentModel(cell);

            if (documentLayoutObject != null) {
                const { verticalAlign, horizontalAlign, wrapStrategy, textRotation, fill } = documentLayoutObject;
                const { centerAngle, vertexAngle } = convertTextRotation(textRotation);
                blankModel.documentModel!.documentStyle.renderConfig = {
                    verticalAlign, horizontalAlign, wrapStrategy, background: { rgb: fill }, centerAngle, vertexAngle,
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
                                rgb: this._themeService.getCurrentTheme().textColorSecondary,
                            },
                        },
                    },
                ];
            }
        }

        this._editorService.setOperationSheetUnitId(unitId);

        this._editorService.setOperationSheetSubUnitId(sheetId);

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

    changeVisible(param: IEditorBridgeServiceVisibleParam) {
        /**
         * Non-sheetEditor and formula selection mode,
         * double-clicking cannot activate the sheet editor.
         */
        const editor = this._editorService.getFocusEditor();
        if (this._refSelectionsService.getCurrentSelections().length > 0 && editor && !editor.isSheetEditor()) {
            return;
        }

        this._visible = param;

        // Reset the dirty status when the editor is visible.
        if (param.visible) {
            this._editorIsDirty = false;
        }

        this._visible$.next(this._visible);
        this._afterVisible$.next(this._visible);
    }

    isVisible() {
        return this._visible;
    }

    enableForceKeepVisible(): void {
        this._isForceKeepVisible = true;
    }

    disableForceKeepVisible(): void {
        this._isForceKeepVisible = false;
    }

    isForceKeepVisible(): boolean {
        return this._isForceKeepVisible;
    }

    changeEditorDirty(dirtyStatus: boolean) {
        this._editorIsDirty = dirtyStatus;
    }

    getEditorDirty() {
        return this._editorIsDirty;
    }
}

export const IEditorBridgeService = createIdentifier<EditorBridgeService>('univer.sheet-editor-bridge.service');
