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

import type { IDisposable, IPosition, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
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
    IUniverInstanceService,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { getCanvasOffsetByEngine, IEditorService } from '@univerjs/docs-ui';
import { convertTextRotation, convertTransformToOffsetX, convertTransformToOffsetY, DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { BEFORE_CELL_EDIT, SheetInterceptorService } from '@univerjs/sheets';
import { BehaviorSubject, map, switchMap } from 'rxjs';
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
    getCurrentEditorId(): Nullable<string>;
    helpFunctionVisible$: BehaviorSubject<boolean>;
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

    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
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
            return;
        }
        const { position, scaleX, scaleY, canvasOffset, ...rest } = editCellState;
        this._currentEditCellState = rest;
        this._currentEditCellLayout = { position, scaleX, scaleY, canvasOffset };
        this._currentEditCellState$.next(this._currentEditCellState);
        this._currentEditCellLayout$.next(this._currentEditCellLayout);
    }

    refreshEditCellPosition(resetSizeOnly?: boolean) {
        const currentEditCell = this._currentEditCell;
        if (currentEditCell == null) {
            return;
        }

        const currentSheet = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET);
        if (!currentSheet) return;

        const ru = this._renderManagerService.getRenderUnitById(currentSheet.getUnitId());
        if (!ru) return;

        const skeleton = ru.with(SheetSkeletonManagerService).getSkeletonParam(currentEditCell.sheetId)?.skeleton;
        const selectionRenderService = ru.with(ISheetSelectionRenderService);
        if (!skeleton) return;
        if (!this._currentEditCellState) return;

        const { primary, scene, engine } = currentEditCell;
        const primaryWithCoord = attachPrimaryWithCoord(skeleton, primary);
        if (primaryWithCoord == null) {
            return;
        }

        const actualRangeWithCoord = convertCellToRange(primaryWithCoord);
        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = scene.getViewportScrollXY(selectionRenderService.getViewPort());
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

    // eslint-disable-next-line max-lines-per-function
    getLatestEditCellState() {
        const currentEditCell = this._currentEditCell;
        if (currentEditCell == null) return;

        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return;

        const ru = this._renderManagerService.getRenderUnitById(workbook.getUnitId());
        if (!ru) return;

        const skeleton = ru.with(SheetSkeletonManagerService).getCurrentSkeleton();
        const selectionRenderService = ru.with(ISheetSelectionRenderService);
        if (!skeleton) return;

        const { primary, unitId, sheetId, scene, engine } = currentEditCell;
        const { startRow, startColumn } = primary;
        const primaryWithCoord = attachPrimaryWithCoord(skeleton, primary);
        if (primaryWithCoord == null) return;

        const actualRangeWithCoord = convertCellToRange(primaryWithCoord);
        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = scene.getViewportScrollXY(selectionRenderService.getViewPort());
        startX = convertTransformToOffsetX(startX, scaleX, scrollXY);
        startY = convertTransformToOffsetY(startY, scaleY, scrollXY);
        endX = convertTransformToOffsetX(endX, scaleX, scrollXY);
        endY = convertTransformToOffsetY(endY, scaleY, scrollXY);

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

        let documentLayoutObject: Nullable<IDocumentLayoutObject>;
        const cell = this._sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT)(
            worksheet.getCell(startRow, startColumn),
            location
        );

        documentLayoutObject = cell && skeleton.getCellDocumentModelWithFormula(cell);

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
                                rgb: this._themeService.getColorFromTheme('gray.600'),
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
}

export const IEditorBridgeService = createIdentifier<EditorBridgeService>('univer.sheet-editor-bridge.service');
