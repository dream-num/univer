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

import type { ICellWithCoord, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, Viewport } from '@univerjs/engine-render';
import type { ISelectionWithStyle, ISetSelectionsOperationParams } from '@univerjs/sheets';
import {
    createInterceptorKey,
    Disposable,
    ICommandService,
    IContextService,
    Inject,
    InterceptorManager,
    RANGE_TYPE,
    Rectangle,
    toDisposable,
} from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import {
    convertPrimaryWithCoordToPrimary,
    convertSelectionDataToRange,
    SelectionMoveType,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, ILayoutService } from '@univerjs/ui';
import {
    MOBILE_EXPANDING_SELECTION,
    MOBILE_PINCH_ZOOMING,
    MOBILE_TRIGGER_CONTEXT_MENU,
} from '../../../consts/mobile-context';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SELECTION_MANAGER_KEY } from '../../../services/selection/selection-control';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

const LONG_PRESS_DURATION = 500;
const LONG_PRESS_MOVE_THRESHOLD = 10;
const MAIN_AREA_VIEWPORT_KEYS = new Set<string>([
    SHEET_VIEWPORT_KEY.VIEW_MAIN,
    SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP,
    SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT,
    SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
]);
const ROW_HEADER_VIEWPORT_KEYS = new Set<string>([
    SHEET_VIEWPORT_KEY.VIEW_ROW_TOP,
    SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM,
]);
const COLUMN_HEADER_VIEWPORT_KEYS = new Set<string>([
    SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT,
    SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT,
]);

const SELECTION_OBJECT_PREFIXES = [
    SELECTION_MANAGER_KEY.Selection,
    SELECTION_MANAGER_KEY.top,
    SELECTION_MANAGER_KEY.bottom,
    SELECTION_MANAGER_KEY.left,
    SELECTION_MANAGER_KEY.right,
    SELECTION_MANAGER_KEY.expandTopLeft,
    SELECTION_MANAGER_KEY.expandBottomRight,
    SELECTION_MANAGER_KEY.backgroundTop,
    SELECTION_MANAGER_KEY.backgroundMiddleLeft,
    SELECTION_MANAGER_KEY.backgroundMiddleRight,
    SELECTION_MANAGER_KEY.backgroundBottom,
];

interface ITouchPosition {
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    pointerId: number;
}

interface ILongPressTarget {
    cell: Nullable<ICellWithCoord>;
    menuPosition: ContextMenuPosition;
    selectionObjectPicked: boolean;
}

interface ILongPressState {
    activeTouch: Nullable<ITouchPosition>;
    longPressTimer: Nullable<ReturnType<typeof setTimeout>>;
    longPressTriggered: boolean;
    selectionSnapshot: ISelectionWithStyle[];
    target: Nullable<ILongPressTarget>;
}

export interface IMobileContextMenuInterceptorContext {
    col?: number;
    menuPosition: ContextMenuPosition;
    row?: number;
    subUnitId: string;
    unitId: string;
}

export const MOBILE_CONTEXT_MENU = createInterceptorKey<boolean, IMobileContextMenuInterceptorContext>(
    'mobile-context-menu'
);

function isSelectionObjectKey(objectKey?: string | null): boolean {
    return !!objectKey && SELECTION_OBJECT_PREFIXES.some((prefix) => objectKey.startsWith(prefix));
}

export function getMobileContextMenuPositionByViewportKey(viewportKey: string): Nullable<ContextMenuPosition> {
    if (MAIN_AREA_VIEWPORT_KEYS.has(viewportKey)) {
        return ContextMenuPosition.MAIN_AREA;
    }
    if (ROW_HEADER_VIEWPORT_KEYS.has(viewportKey)) {
        return ContextMenuPosition.ROW_HEADER;
    }
    if (COLUMN_HEADER_VIEWPORT_KEYS.has(viewportKey)) {
        return ContextMenuPosition.COL_HEADER;
    }
    return null;
}

export function shouldKeepCurrentSelectionForMobileContextMenu(
    currentSelections: Array<IRange | ISelectionWithStyle>,
    targetRange: IRange
): boolean {
    return currentSelections.some((selection) => Rectangle.contains('range' in selection ? selection.range : selection, targetRange));
}

/** @ignore */
export class SheetContextMenuMobileRenderController extends Disposable implements IRenderModule {
    readonly contextMenuInterceptor = new InterceptorManager({ MOBILE_CONTEXT_MENU });

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IContextService private readonly _contextService: IContextService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this.disposeWithMe(toDisposable(() => this.contextMenuInterceptor.dispose()));
        this._init();
    }

    private _init(): void {
        const contentElement = this._layoutService.getContentElement();
        if (!contentElement) {
            return;
        }

        const state = this._createLongPressState();
        let activated = false;
        this.disposeWithMe(this._context.activated$.subscribe((value) => {
            activated = value;
            if (!activated) {
                this._resetLongPressState(state);
            }
        }));
        const handlePointerDown = (event: PointerEvent) => {
            if (activated) {
                this._handlePointerDown(contentElement, state, event);
            }
        };
        const handlePointerMove = (event: PointerEvent) => this._handlePointerMove(contentElement, state, event);
        const handlePointerUp = (event: PointerEvent) => this._handlePointerUp(state, event);
        const handlePointerCancel = () => this._resetLongPressState(state);

        contentElement.addEventListener('pointerdown', handlePointerDown, true);
        contentElement.addEventListener('pointermove', handlePointerMove, true);
        contentElement.addEventListener('pointerup', handlePointerUp, true);
        contentElement.addEventListener('pointercancel', handlePointerCancel, true);

        this.disposeWithMe(toDisposable(() => {
            contentElement.removeEventListener('pointerdown', handlePointerDown, true);
            contentElement.removeEventListener('pointermove', handlePointerMove, true);
            contentElement.removeEventListener('pointerup', handlePointerUp, true);
            contentElement.removeEventListener('pointercancel', handlePointerCancel, true);
            this._resetLongPressState(state);
        }));
    }

    private _createLongPressState(): ILongPressState {
        return {
            activeTouch: null,
            longPressTimer: null,
            longPressTriggered: false,
            selectionSnapshot: [],
            target: null,
        };
    }

    private _clearLongPressTimer(state: ILongPressState): void {
        if (state.longPressTimer == null) {
            return;
        }
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
    }

    private _resetLongPressState(state: ILongPressState): void {
        this._clearLongPressTimer(state);
        state.activeTouch = null;
        state.longPressTriggered = false;
        state.target = null;
    }

    private _getPointerOffset(contentElement: HTMLElement, event: PointerEvent): ITouchPosition {
        const rect = contentElement.getBoundingClientRect();
        return {
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            pointerId: event.pointerId,
        };
    }

    private _getTargetCellByOffset(offsetX: number, offsetY: number, viewport: Viewport): Nullable<ICellWithCoord> {
        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        const { scene } = this._context;
        if (!skeleton) {
            return null;
        }

        const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([offsetX, offsetY]));
        const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords, viewport);
        const { scaleX, scaleY } = scene.getAncestorScale();

        return skeleton.getCellWithCoordByOffset(
            relativeCoords.x,
            relativeCoords.y,
            scaleX,
            scaleY,
            scrollXY
        );
    }

    private _resolveLongPressTarget(offsetX: number, offsetY: number): Nullable<ILongPressTarget> {
        const { scene } = this._context;
        const viewport = scene.getActiveViewportByCoord(Vector2.FromArray([offsetX, offsetY]));
        if (!viewport) {
            return null;
        }

        const menuPosition = getMobileContextMenuPositionByViewportKey(viewport.viewportKey);
        if (!menuPosition) {
            return null;
        }

        if (menuPosition !== ContextMenuPosition.MAIN_AREA) {
            return { cell: null, menuPosition, selectionObjectPicked: false };
        }

        const pickedObject = scene.pick(Vector2.FromArray([offsetX, offsetY]));
        const pickedObjectKey = pickedObject && 'oKey' in pickedObject ? pickedObject.oKey : undefined;
        const selectionObjectPicked = isSelectionObjectKey(pickedObjectKey);
        if (pickedObject && pickedObject !== this._context.mainComponent && !selectionObjectPicked) {
            return null;
        }

        const cell = this._getTargetCellByOffset(offsetX, offsetY, viewport);
        return cell ? { cell, menuPosition, selectionObjectPicked } : null;
    }

    private _getCurrentRenderSelections(): ISelectionWithStyle[] {
        const currentRender = this._renderManagerService.getRenderUnitById(this._context.unitId);
        const selectionRenderService = currentRender?.with(ISheetSelectionRenderService);
        return selectionRenderService?.getSelectionControls().map((control) => convertSelectionDataToRange(control.getValue())) ?? [];
    }

    private _cloneSelections(selections: Readonly<ISelectionWithStyle[]>): ISelectionWithStyle[] {
        return selections.map((selection) => ({
            range: { ...selection.range },
            primary: selection.primary ? { ...selection.primary } : selection.primary,
            style: selection.style ? { ...selection.style } : selection.style,
        }));
    }

    private _getSelectionSnapshot(): ISelectionWithStyle[] {
        const renderedSelections = this._getCurrentRenderSelections();
        if (renderedSelections.length) {
            return this._cloneSelections(renderedSelections);
        }

        return this._cloneSelections(this._selectionManagerService.getCurrentSelections());
    }

    private _selectTargetCell(targetCell: ICellWithCoord): boolean {
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const { startRow, endRow, startColumn, endColumn } = targetCell.mergeInfo;
        return this._commandService.syncExecuteCommand<ISetSelectionsOperationParams>(SetSelectionsOperation.id, {
            unitId: this._context.unitId,
            subUnitId: worksheet.getSheetId(),
            type: SelectionMoveType.MOVE_END,
            selections: [{
                range: { startRow, endRow, startColumn, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: convertPrimaryWithCoordToPrimary(targetCell),
                style: null,
            }],
        });
    }

    private _openMenu(clientX: number, clientY: number, menuPosition: ContextMenuPosition): void {
        const event = new MouseEvent('contextmenu', { clientX, clientY });
        this._contextMenuService.triggerContextMenu(event, menuPosition, { unitId: this._context.unitId });
    }

    private _triggerLongPress(state: ILongPressState): void {
        state.longPressTimer = null;
        const { activeTouch, target } = state;
        if (!activeTouch || !target || this._contextMenuService.visible) {
            return;
        }
        if (
            this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) ||
            this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)
        ) {
            return;
        }

        if (
            target.menuPosition === ContextMenuPosition.MAIN_AREA &&
            target.cell &&
            !target.selectionObjectPicked &&
            !shouldKeepCurrentSelectionForMobileContextMenu(state.selectionSnapshot, target.cell.mergeInfo) &&
            !this._selectTargetCell(target.cell)
        ) {
            return;
        }

        state.longPressTriggered = true;
        this._contextService.setContextValue(MOBILE_TRIGGER_CONTEXT_MENU, true);
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            return;
        }
        const handled = this.contextMenuInterceptor.fetchThroughInterceptors(MOBILE_CONTEXT_MENU)(false, {
            col: target.cell?.actualColumn,
            menuPosition: target.menuPosition,
            row: target.cell?.actualRow,
            subUnitId: worksheet.getSheetId(),
            unitId: this._context.unitId,
        });
        if (handled) {
            return;
        }
        this._openMenu(activeTouch.clientX, activeTouch.clientY, target.menuPosition);
    }

    private _handlePointerDown(contentElement: HTMLElement, state: ILongPressState, event: PointerEvent): void {
        this._resetLongPressState(state);
        this._contextService.setContextValue(MOBILE_TRIGGER_CONTEXT_MENU, false);
        if (this._contextMenuService.visible) {
            this._contextMenuService.hideContextMenu();
            return;
        }
        if (
            !event.isPrimary ||
            event.button !== 0 ||
            this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) ||
            this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)
        ) {
            return;
        }

        const touch = this._getPointerOffset(contentElement, event);
        const target = this._resolveLongPressTarget(touch.offsetX, touch.offsetY);
        if (!target) {
            return;
        }

        state.activeTouch = touch;
        state.selectionSnapshot = this._getSelectionSnapshot();
        state.target = target;
        state.longPressTimer = setTimeout(() => this._triggerLongPress(state), LONG_PRESS_DURATION);
    }

    private _handlePointerMove(contentElement: HTMLElement, state: ILongPressState, event: PointerEvent): void {
        if (!state.activeTouch || !event.isPrimary || event.pointerId !== state.activeTouch.pointerId) {
            this._resetLongPressState(state);
            return;
        }

        const touch = this._getPointerOffset(contentElement, event);
        if (
            Math.abs(touch.offsetX - state.activeTouch.offsetX) > LONG_PRESS_MOVE_THRESHOLD ||
            Math.abs(touch.offsetY - state.activeTouch.offsetY) > LONG_PRESS_MOVE_THRESHOLD
        ) {
            this._resetLongPressState(state);
        }
    }

    private _handlePointerUp(state: ILongPressState, event: PointerEvent): void {
        if (state.activeTouch?.pointerId !== event.pointerId) {
            return;
        }
        if (state.longPressTriggered) {
            event.preventDefault();
        }
        this._resetLongPressState(state);
    }
}
