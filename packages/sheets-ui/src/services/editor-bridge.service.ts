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

import type { ICellDataForSheetInterceptor, IPosition, ISelectionCell, Nullable } from '@univerjs/core';
import {
    createInterceptorKey,
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    InterceptorManager,
    IUniverInstanceService,
    makeCellToSelection,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import type { Engine, IDocumentLayoutObject, Scene } from '@univerjs/engine-render';
import { convertTextRotation, DeviceInputEventType, fixLineWidthByScale, getCanvasOffsetByEngine } from '@univerjs/engine-render';
import type { ISheetLocation } from '@univerjs/sheets';
import { IEditorService } from '@univerjs/ui';
import type { KeyCode } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier, Inject } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { ISelectionRenderService } from './selection/selection-render.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IEditorBridgeServiceVisibleParam {
    visible: boolean;
    eventType: DeviceInputEventType;
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

const BEFORE_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('BEFORE_CELL_EDIT');
const AFTER_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('AFTER_CELL_EDIT');

export interface IEditorBridgeService {
    currentEditCellState$: Observable<Nullable<IEditorBridgeServiceParam>>;
    visible$: Observable<IEditorBridgeServiceVisibleParam>;
    interceptor: InterceptorManager<{
        BEFORE_CELL_EDIT: typeof BEFORE_CELL_EDIT;
        AFTER_CELL_EDIT: typeof AFTER_CELL_EDIT;
    }>;
    dispose(): void;
    refreshEditCellState(): void;
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
    };

    private _currentEditCell: Nullable<ICurrentEditCellParam> = null;
    private _currentEditCellState: Nullable<IEditorBridgeServiceParam> = null;
    private readonly _currentEditCellState$ = new BehaviorSubject<Nullable<IEditorBridgeServiceParam>>(null);
    readonly currentEditCellState$ = this._currentEditCellState$.asObservable();

    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly visible$ = this._visible$.asObservable();

    private readonly _afterVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>(this._visible);
    readonly afterVisible$ = this._afterVisible$.asObservable();

    interceptor = new InterceptorManager({
        BEFORE_CELL_EDIT,
        AFTER_CELL_EDIT,
    });

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this.disposeWithMe(
            toDisposable(() => {
                this._currentEditCellState$.complete();
                this._currentEditCell = null;
            })
        );

        this.disposeWithMe(
            toDisposable(
                this.interceptor.intercept(this.interceptor.getInterceptPoints().AFTER_CELL_EDIT, {
                    priority: -1,
                    handler: (_value) => _value,
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this.interceptor.intercept(this.interceptor.getInterceptPoints().BEFORE_CELL_EDIT, {
                    priority: -1,
                    handler: (_value) => _value,
                })
            )
        );
    }

    refreshEditCellState() {
        const editCellState = this.getLatestEditCellState();
        this._currentEditCellState = editCellState;

        this._currentEditCellState$.next(editCellState);
    }

    setEditCell(param: ICurrentEditCellParam) {
        this._currentEditCell = param;

        const editCellState = this.getLatestEditCellState();
        this._currentEditCellState = editCellState;

        this._currentEditCellState$.next(editCellState);
    }

    getEditCellState(): Readonly<Nullable<IEditorBridgeServiceParam>> {
        return this._currentEditCellState;
    }

    getLatestEditCellState() {
        const currentEditCell = this._currentEditCell;
        if (currentEditCell == null) {
            return;
        }

        const currentSkeleton = this._sheetSkeletonManagerService.getCurrent();

        if (currentSkeleton == null) {
            return;
        }

        const { skeleton } = currentSkeleton;

        const { primary, unitId, sheetId, scene, engine } = currentEditCell;
        const { startRow, startColumn } = primary;
        const primaryWithCoord = this._selectionRenderService.convertCellRangeToInfo(primary);
        if (primaryWithCoord == null) {
            return;
        }

        const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);
        if (actualRangeWithCoord == null) {
            return;
        }

        const canvasOffset = getCanvasOffsetByEngine(engine);

        let { startX, startY, endX, endY } = actualRangeWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();

        const { scaleX: precisionScaleX, scaleY: precisionScaleY } = scene.getPrecisionScale();

        const scrollXY = scene.getScrollXY(this._selectionRenderService.getViewPort());
        startX = fixLineWidthByScale(skeleton.convertTransformToOffsetX(startX, scaleX, scrollXY), precisionScaleX);
        startY = fixLineWidthByScale(skeleton.convertTransformToOffsetY(startY, scaleY, scrollXY), precisionScaleY);
        endX = fixLineWidthByScale(skeleton.convertTransformToOffsetX(endX, scaleX, scrollXY), precisionScaleX);
        endY = fixLineWidthByScale(skeleton.convertTransformToOffsetY(endY, scaleY, scrollXY), precisionScaleY);

        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const location = {
            workbook,
            worksheet,
            unitId: workbook.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            row: startRow,
            col: startColumn,
        };

        const cell = this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().BEFORE_CELL_EDIT)(
            worksheet.getCell(startRow, startColumn),
            location
        );

        let documentLayoutObject = cell && skeleton.getCellDocumentModelWithFormula(cell);

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
