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

import type { EventState, IRange, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { LocaleKey } from '../locale/types';
import type { ITableControlHitRegion } from '../views/widgets/table-controls-util';
import {
    CommandType,
    Disposable,
    fromCallback,
    ICommandService,
    Inject,
    Injector,
    IPermissionService,
    LocaleService,
    toDisposable,
} from '@univerjs/core';
import { CURSOR_TYPE } from '@univerjs/engine-render';
import {
    SelectRangeCommand,
    SheetRangeThemeModel,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorkbookPermissionService,
} from '@univerjs/sheets';
import {
    DeleteSheetTableCommand,
    SetSheetTableCommand,
    SheetTableInsertColumnAtCommand,
    SheetTableInsertRowAtCommand,
    TableManager,
} from '@univerjs/sheets-table';
import {
    ExpandSelectionCommand,
    getTransformCoord,
    ISheetSelectionRenderService,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
    SelectAllCommand,
    SetScrollOperation,
    SetZoomRatioOperation,
    SHEET_VIEW_KEY,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { IDialogService, ISidebarService } from '@univerjs/ui';
import { filter, merge } from 'rxjs';
import { openRangeSelector } from '../commands/operations/open-table-selector.operation';
import {
    SHEET_TABLE_RENAME_DIALOG,
    SHEET_TABLE_RENAME_DIALOG_ID,
    SHEET_TABLE_THEME_PANEL,
    SHEET_TABLE_THEME_PANEL_ID,
} from '../const';
import { TABLE_CONTROL_INSERT_BUTTON_SIZE, TABLE_CONTROL_TOP_GAP_SIZE } from '../views/widgets/table-controls-util';
import { SheetTableControlsShape } from '../views/widgets/table-controls.shape';
import { SheetTableThemeUIController } from './sheet-table-theme-ui.controller';

const TABLE_CONTROLS_LAYER_INDEX = 5002;
const TABLE_CONTROL_GAP_ROW = 0;

const TABLE_RENDER_REFRESH_COMMANDS = new Set([
    SetScrollOperation.id,
    SetZoomRatioOperation.id,
]);
const SELECTION_ONLY_COMMANDS = new Set([
    MoveSelectionCommand.id,
    MoveSelectionEnterAndTabCommand.id,
    ExpandSelectionCommand.id,
    SelectAllCommand.id,
    SelectRangeCommand.id,
]);

type TopGapSnapshot = { size: number; color?: string; stripeColor?: string } | null;

function isSameTopGap(left: TopGapSnapshot, right: TopGapSnapshot): boolean {
    if (left === null || right === null) {
        return left === right;
    }

    return left.size === right.size && left.color === right.color && left.stripeColor === right.stripeColor;
}

export class SheetTableControlsRenderController extends Disposable implements IRenderModule {
    private readonly _shape: SheetTableControlsShape;
    private readonly _topGapBaseBySkeleton = new WeakMap<SpreadsheetSkeleton, TopGapSnapshot>();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(TableManager) private readonly _tableManager: TableManager,
        @Inject(SheetRangeThemeModel) private readonly _rangeThemeModel: SheetRangeThemeModel,
        @Inject(WorkbookPermissionService) private readonly _workbookPermissionService: WorkbookPermissionService,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService,
        @Inject(SheetsSelectionsService) private readonly _sheetsSelectionsService: SheetsSelectionsService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @Inject(SheetTableThemeUIController) private readonly _sheetTableThemeUIController: SheetTableThemeUIController,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IDialogService private readonly _dialogService: IDialogService,
        @ISidebarService private readonly _sidebarService: ISidebarService
    ) {
        super();
        this._shape = new SheetTableControlsShape(
            'SheetTableControlsShape',
            () => this._sheetSkeletonManagerService.getCurrentSkeleton() || null
        );
        this._initShape();
        this._initRefresh();
        this._refresh();
    }

    private _initShape(): void {
        this._context.scene.addObjects([this._shape], TABLE_CONTROLS_LAYER_INDEX);
        this.disposeWithMe(toDisposable(() => {
            this._context.scene.removeObjects([this._shape]);
        }));

        this.disposeWithMe(this._shape.onPointerMove$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            this._handlePointerMove(evt, state);
        }));
        this.disposeWithMe(this._shape.onPointerLeave$.subscribeEvent((_evt: IPointerEvent | IMouseEvent, state) => {
            this._handlePointerLeave(state);
        }));
        this.disposeWithMe(this._shape.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            this._handlePointerDown(evt, state);
        }));

        this.disposeWithMe(this._context.components.get(SHEET_VIEW_KEY.MAIN)?.onPointerMove$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            const point = this._getLocalPoint(evt);
            const insertRegion = this._getInsertRegionFromPoint(point.x, point.y);
            this._shape.setHoveredInsertRegion(insertRegion);
        }) ?? toDisposable(() => {}));
    }

    private _initRefresh(): void {
        const commandExecuted$ = fromCallback(this._commandService.onCommandExecuted.bind(this._commandService))
            .pipe(filter(([command]) => {
                if (command.id.startsWith('doc.') || SELECTION_ONLY_COMMANDS.has(command.id)) {
                    return false;
                }

                if (command.type === CommandType.OPERATION && TABLE_RENDER_REFRESH_COMMANDS.has(command.id)) {
                    this._closeFloatingControls();
                    return true;
                }

                return command.type === CommandType.MUTATION || command.type === CommandType.COMMAND;
            }));

        this.disposeWithMe(merge(
            this._context.unit.activeSheet$,
            this._sheetSkeletonManagerService.currentSkeleton$,
            this._tableManager.tableAdd$,
            this._tableManager.tableDelete$,
            this._tableManager.tableNameChanged$,
            this._tableManager.tableRangeChanged$,
            this._tableManager.tableThemeChanged$,
            this._sheetTableThemeUIController.refreshTable$,
            this._workbookPermissionService.unitPermissionInitStateChange$,
            this._permissionService.permissionPointUpdate$,
            commandExecuted$
        ).subscribe(() => {
            this._closeFloatingControls();
            this._refresh();
        }));

        this.disposeWithMe(this._sheetsSelectionsService.selectionChanged$.subscribe(() => {
            this._closeFloatingControls();
            this._refresh(false);
        }));
    }

    private _refresh(invalidateScene = true): void {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        const worksheet = this._context.unit.getActiveSheet();

        if (!skeleton || !worksheet || !this._canEditWorkbook()) {
            this._shape.setItems([]);
            this._shape.refreshBounds();
            this._shape.makeDirty(true);
            if (invalidateScene) {
                this._context.scene.makeDirty();
            }
            return;
        }

        this._syncTopTableGap(skeleton);
        this._shape.setMenuLabels({
            rename: this._localeService.t<LocaleKey>('sheets-table-ui.rename'),
            'update-range': this._localeService.t<LocaleKey>('sheets-table-ui.updateRange'),
            'set-theme': this._localeService.t<LocaleKey>('sheets-table-ui.setTheme'),
            delete: this._localeService.t<LocaleKey>('sheets-table-ui.removeTable'),
        });

        const unitId = this._context.unit.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const items = this._tableManager.getTablesBySubunitId(unitId, subUnitId).map((table) => {
            const rangeTheme = this._rangeThemeModel.getRangeThemeStyle(unitId, table.getTableStyleId());
            return {
                tableId: table.getId(),
                tableName: table.getDisplayName(),
                range: table.getRange(),
                fill: rangeTheme?.getHeaderRowStyle()?.bg?.rgb ?? 'rgb(53,91,183)',
                text: rangeTheme?.getHeaderRowStyle()?.cl?.rgb ?? 'rgb(255,255,255)',
            };
        });

        this._shape.setItems(items);
        this._shape.refreshBounds();
        this._shape.makeDirty(true);
        if (invalidateScene) {
            this._context.scene.makeDirty();
        }
    }

    private _canEditWorkbook(): boolean {
        const unitId = this._context.unit.getUnitId();
        const workbookEditPermission = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value;
        return workbookEditPermission !== false;
    }

    private _handlePointerMove(evt: IPointerEvent | IMouseEvent, state: EventState): void {
        const point = this._getLocalPoint(evt);
        const hit = this._shape.hitTest(point.x, point.y);
        const insertRegion = this._isInsertHit(hit) ? hit : hit ? null : this._getInsertRegionFromPoint(point.x, point.y);
        const activeHit = hit ?? insertRegion;

        this._shape.setHoveredRegion(this._isInsertHit(hit) ? null : hit);
        this._shape.setHoveredInsertRegion(insertRegion);

        if (activeHit) {
            state.stopPropagation();
            this._context.scene.setCursor(CURSOR_TYPE.POINTER);
        } else {
            this._context.scene.resetCursor();
        }
    }

    private _isInsertHit(hit: ITableControlHitRegion | null): hit is ITableControlHitRegion {
        return hit?.type === 'insert-row' || hit?.type === 'insert-column';
    }

    private _handlePointerLeave(state: EventState): void {
        state.stopPropagation();
        this._shape.setHoveredRegion(null);
        this._shape.setHoveredInsertRegion(null);
        this._context.scene.resetCursor();
    }

    private _handlePointerDown(evt: IPointerEvent | IMouseEvent, state: EventState): void {
        if (evt.button === 2) {
            return;
        }

        const point = this._getLocalPoint(evt);
        const hit = this._shape.hitTest(point.x, point.y) ?? this._getInsertRegionFromPoint(point.x, point.y);
        if (!hit) {
            this._closeFloatingControls();
            return;
        }

        state.stopPropagation();
        evt.stopPropagation();
        evt.preventDefault();
        this._handleHit(hit);
    }

    private _handleHit(hit: ITableControlHitRegion): void {
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const unitId = this._context.unit.getUnitId();
        const subUnitId = worksheet.getSheetId();

        if (hit.type === 'anchor-menu-toggle' || hit.type === 'anchor-main') {
            this._shape.setOpenedMenuTableId(this._shape.getOpenedMenuTableId() === hit.tableId ? null : hit.tableId);
            return;
        }

        if (hit.type === 'insert-row') {
            this._commandService.executeCommand(SheetTableInsertRowAtCommand.id, {
                unitId,
                subUnitId,
                tableId: hit.tableId,
                index: hit.index,
                count: 1,
            });
            this._closeFloatingControls();
            return;
        }

        if (hit.type === 'insert-column') {
            this._commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
                unitId,
                subUnitId,
                tableId: hit.tableId,
                index: hit.index,
                count: 1,
            });
            this._closeFloatingControls();
            return;
        }

        if (hit.type !== 'menu-item') {
            return;
        }

        switch (hit.action) {
            case 'rename':
                this._openRenameDialog(unitId, hit.tableId);
                break;
            case 'update-range':
                this._openRangeSelector(unitId, subUnitId, hit.tableId);
                break;
            case 'set-theme':
                this._openThemePanel(unitId, subUnitId, hit.tableId);
                break;
            case 'delete':
                this._commandService.executeCommand(DeleteSheetTableCommand.id, {
                    tableId: hit.tableId,
                    subUnitId,
                    unitId,
                });
                break;
        }

        this._closeFloatingControls();
    }

    private _openRenameDialog(unitId: string, tableId: string): void {
        this._dialogService.open({
            id: SHEET_TABLE_RENAME_DIALOG_ID,
            title: { title: this._localeService.t<LocaleKey>('sheets-table-ui.rename') },
            draggable: true,
            destroyOnClose: true,
            mask: true,
            children: {
                label: {
                    name: SHEET_TABLE_RENAME_DIALOG,
                    props: {
                        unitId,
                        tableId,
                        onClose: () => this._dialogService.close(SHEET_TABLE_RENAME_DIALOG_ID),
                    },
                },
            },
            width: 360,
            onClose: () => this._dialogService.close(SHEET_TABLE_RENAME_DIALOG_ID),
        });
    }

    private async _openRangeSelector(unitId: string, subUnitId: string, tableId: string): Promise<void> {
        const table = this._tableManager.getTableById(unitId, tableId);
        if (!table) {
            return;
        }

        const selection = await openRangeSelector(this._injector, unitId, subUnitId, table.getRange(), tableId);
        if (!selection) {
            return;
        }

        this._commandService.executeCommand(SetSheetTableCommand.id, {
            tableId,
            unitId,
            updateRange: {
                newRange: selection.range,
            },
        });
    }

    private _openThemePanel(unitId: string, subUnitId: string, tableId: string): void {
        const table = this._tableManager.getTableById(unitId, tableId);
        if (!table) {
            return;
        }

        this._sidebarService.open({
            id: SHEET_TABLE_THEME_PANEL_ID,
            header: { title: this._localeService.t<LocaleKey>('sheets-table-ui.tableStyle') },
            children: {
                label: SHEET_TABLE_THEME_PANEL,
                oldConfig: table.getTableConfig(),
                unitId,
                subUnitId,
                tableId,
            } as any,
            width: 330,
        });
    }

    private _getInsertRegionFromPoint(x: number, y: number): ITableControlHitRegion | null {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        const worksheet = this._context.unit.getActiveSheet();
        if (!skeleton || !worksheet) {
            return null;
        }

        const unitId = this._context.unit.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);

        for (const table of tables) {
            const range = table.getRange();
            const tableBounds = this._getRangeBounds(skeleton, range);
            if (x < tableBounds.left || x > tableBounds.right || y < tableBounds.top || y > tableBounds.bottom) {
                continue;
            }

            const headerBounds = this._getRangeBounds(skeleton, {
                ...range,
                endRow: range.startRow,
            });

            if (y > headerBounds.bottom) {
                for (let row = range.startRow + 1; row <= range.endRow; row++) {
                    const cell = skeleton.getNoMergeCellWithCoordByIndex(row, range.startColumn);
                    if (y >= cell.startY && y <= cell.endY) {
                        return {
                            type: 'insert-row',
                            tableId: table.getId(),
                            index: row + 1,
                            left: tableBounds.left - TABLE_CONTROL_INSERT_BUTTON_SIZE / 2,
                            top: cell.endY - TABLE_CONTROL_INSERT_BUTTON_SIZE / 2,
                            width: TABLE_CONTROL_INSERT_BUTTON_SIZE,
                            height: TABLE_CONTROL_INSERT_BUTTON_SIZE,
                        };
                    }
                }
            }
        }

        return null;
    }

    private _getRangeBounds(skeleton: SpreadsheetSkeleton, range: IRange): { left: number; top: number; right: number; bottom: number } {
        const startCell = skeleton.getNoMergeCellWithCoordByIndex(range.startRow, range.startColumn);
        const endCell = skeleton.getNoMergeCellWithCoordByIndex(range.endRow, range.endColumn);
        return {
            left: startCell.startX,
            top: startCell.startY,
            right: endCell.endX,
            bottom: endCell.endY,
        };
    }

    private _syncTopTableGap(skeleton: SpreadsheetSkeleton): void {
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const unitId = this._context.unit.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const hasTopTable = this._tableManager
            .getTablesBySubunitId(unitId, subUnitId)
            .some((table) => table.getRange().startRow === 0);
        const current = skeleton.gapConfig;
        const rowGaps = { ...current.rowGaps };
        const previousTopGap = rowGaps[TABLE_CONTROL_GAP_ROW] ? { ...rowGaps[TABLE_CONTROL_GAP_ROW] } : null;
        let shouldSync = false;

        if (hasTopTable) {
            if (!this._topGapBaseBySkeleton.has(skeleton)) {
                this._topGapBaseBySkeleton.set(
                    skeleton,
                    rowGaps[TABLE_CONTROL_GAP_ROW] ? { ...rowGaps[TABLE_CONTROL_GAP_ROW] } : null
                );
            }

            const baseGap = this._topGapBaseBySkeleton.get(skeleton);
            rowGaps[TABLE_CONTROL_GAP_ROW] = {
                ...(baseGap ?? rowGaps[TABLE_CONTROL_GAP_ROW]),
                size: (baseGap?.size ?? 0) + TABLE_CONTROL_TOP_GAP_SIZE,
            };
            shouldSync = true;
        } else if (this._topGapBaseBySkeleton.has(skeleton)) {
            const baseGap = this._topGapBaseBySkeleton.get(skeleton);
            if (baseGap) {
                rowGaps[TABLE_CONTROL_GAP_ROW] = { ...baseGap };
            } else {
                delete rowGaps[TABLE_CONTROL_GAP_ROW];
            }
            this._topGapBaseBySkeleton.delete(skeleton);
            shouldSync = true;
        }

        if (!shouldSync) {
            return;
        }

        const nextTopGap = rowGaps[TABLE_CONTROL_GAP_ROW] ? { ...rowGaps[TABLE_CONTROL_GAP_ROW] } : null;
        if (isSameTopGap(previousTopGap, nextTopGap)) {
            return;
        }

        skeleton.setGapConfig({ ...current, rowGaps });
        this._refreshSelections();
    }

    private _refreshSelections(): void {
        this._selectionRenderService.resetSelectionsByModelData(this._sheetsSelectionsService.getCurrentSelections());
    }

    private _closeFloatingControls(): void {
        this._shape.setOpenedMenuTableId(null);
        this._shape.setHoveredInsertRegion(null);
        this._shape.setHoveredRegion(null);
    }

    private _getLocalPoint(evt: IPointerEvent | IMouseEvent): { x: number; y: number } {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (skeleton) {
            return getTransformCoord(evt.offsetX, evt.offsetY, this._context.scene, skeleton);
        }

        return {
            x: evt.offsetX,
            y: evt.offsetY,
        };
    }
}
