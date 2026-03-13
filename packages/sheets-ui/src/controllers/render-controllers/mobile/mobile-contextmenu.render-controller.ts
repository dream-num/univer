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
import type { IPointerEvent, IRenderContext, IRenderModule, Viewport } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { Disposable, IContextService, Inject, RANGE_TYPE, Rectangle, toDisposable } from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { convertPrimaryWithCoordToPrimary, convertSelectionDataToRange, SelectionMoveType, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, ILayoutService } from '@univerjs/ui';
import { MOBILE_EXPANDING_SELECTION, MOBILE_PINCH_ZOOMING } from '../../../consts/mobile-context';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SELECTION_MANAGER_KEY } from '../../../services/selection/selection-control';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

const LONG_PRESS_DURATION = 500;
const LONG_PRESS_MOVE_THRESHOLD = 10;
const MAIN_AREA_VIEWPORT_KEYS = new Set<string>([
    SHEET_VIEWPORT_KEY.VIEW_MAIN,
    SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT,
    SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
    SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP,
]);

const SELECTION_OBJECT_PREFIXES = [
    SELECTION_MANAGER_KEY.Selection,
    SELECTION_MANAGER_KEY.top,
    SELECTION_MANAGER_KEY.bottom,
    SELECTION_MANAGER_KEY.left,
    SELECTION_MANAGER_KEY.right,
    SELECTION_MANAGER_KEY.fillTopLeft,
    SELECTION_MANAGER_KEY.fillBottomRight,
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
}

interface ILongPressState {
    longPressTimer: ReturnType<typeof setTimeout> | null;
    activeTouch: Nullable<ITouchPosition>;
    longPressTriggered: boolean;
    selectionSnapshot: ISelectionWithStyle[];
    shouldRestoreSelectionSnapshot: boolean;
}

function isSelectionObjectKey(objectKey?: string | null): boolean {
    return !!objectKey && SELECTION_OBJECT_PREFIXES.some((prefix) => objectKey.startsWith(prefix));
}

export function shouldKeepCurrentSelectionForMobileContextMenu(currentSelections: Array<IRange | ISelectionWithStyle>, targetRange: IRange): boolean {
    return currentSelections.some((selection) => Rectangle.contains('range' in selection ? selection.range : selection, targetRange));
}

/**
 * On mobile devices, the context menu pops up after a native touch long press.
 * This bypasses the older "selection event -> menu" chain, which was unreliable
 * when the touch target was the selection overlay itself.
 *
 * @ignore
 */
export class SheetContextMenuMobileRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IContextService private readonly _contextService: IContextService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        const contentElement = this._layoutService.getContentElement();
        if (!contentElement) {
            return;
        }

        const state = this._createLongPressState();
        const handleTouchStart = (event: TouchEvent) => this._handleTouchStart(contentElement, state, event);
        const handleTouchMove = (event: TouchEvent) => this._handleTouchMove(contentElement, state, event);
        const handleTouchEnd = (event: TouchEvent) => this._handleTouchEnd(state, event);

        contentElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        contentElement.addEventListener('touchmove', handleTouchMove, { passive: true });
        contentElement.addEventListener('touchend', handleTouchEnd, { passive: false });
        contentElement.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        this.disposeWithMe(toDisposable(() => {
            this._clearLongPressTimer(state);
            contentElement.removeEventListener('touchstart', handleTouchStart);
            contentElement.removeEventListener('touchmove', handleTouchMove);
            contentElement.removeEventListener('touchend', handleTouchEnd);
            contentElement.removeEventListener('touchcancel', handleTouchEnd);
        }));
    }

    private _createLongPressState(): ILongPressState {
        return {
            longPressTimer: null,
            activeTouch: null,
            longPressTriggered: false,
            selectionSnapshot: [],
            shouldRestoreSelectionSnapshot: false,
        };
    }

    private _clearLongPressTimer(state: ILongPressState): void {
        if (state.longPressTimer) {
            clearTimeout(state.longPressTimer);
            state.longPressTimer = null;
        }
    }

    private _resetLongPressState(state: ILongPressState): void {
        this._clearLongPressTimer(state);
        state.activeTouch = null;
    }

    private _getTouchOffset(contentElement: HTMLElement, touch: Touch): ITouchPosition {
        const rect = contentElement.getBoundingClientRect();
        return {
            clientX: touch.clientX,
            clientY: touch.clientY,
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top,
        };
    }

    private _getMainAreaViewport(offsetX: number, offsetY: number): Nullable<Viewport> {
        const { scene } = this._context;
        const viewport = scene.getActiveViewportByCoord(Vector2.FromArray([offsetX, offsetY]));

        if (!viewport || !MAIN_AREA_VIEWPORT_KEYS.has(viewport.viewportKey)) {
            return null;
        }

        return viewport;
    }

    private _getTargetCellByOffset(offsetX: number, offsetY: number): Nullable<ICellWithCoord> {
        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        const viewport = this._getMainAreaViewport(offsetX, offsetY);
        const { scene } = this._context;

        if (!skeleton || !viewport) {
            return null;
        }

        const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([offsetX, offsetY]));
        const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords, viewport);
        const { scaleX, scaleY } = scene.getAncestorScale();

        return skeleton.getCellWithCoordByOffset(relativeCoords.x - scrollXY.x, relativeCoords.y - scrollXY.y, scaleX, scaleY, scrollXY);
    }

    private _getCurrentRenderSelections(): ISelectionWithStyle[] {
        const currentRender = this._renderManagerService.getRenderById(this._context.unitId);
        const selectionRenderService = currentRender?.with(ISheetSelectionRenderService);
        return selectionRenderService?.getSelectionControls().map((control) => convertSelectionDataToRange(control.getValue())) ?? [];
    }

    private _cloneSelections(selections: ISelectionWithStyle[]): ISelectionWithStyle[] {
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

        return this._cloneSelections(this._selectionManagerService.getCurrentSelections() as ISelectionWithStyle[]);
    }

    private _restoreSelectionSnapshot(selectionSnapshot: ISelectionWithStyle[]): void {
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet || !selectionSnapshot.length) {
            return;
        }

        this._selectionManagerService.setSelections(
            this._context.unitId,
            worksheet.getSheetId(),
            this._cloneSelections(selectionSnapshot),
            SelectionMoveType.MOVE_END
        );
    }

    private _replaceSelectionWithTargetCell(targetCell: ICellWithCoord): void {
        const worksheet = this._context.unit.getActiveSheet();
        if (!worksheet) {
            return;
        }

        this._selectionManagerService.setSelections(this._context.unitId, worksheet.getSheetId(), [{
            range: {
                startRow: targetCell.mergeInfo.startRow,
                endRow: targetCell.mergeInfo.endRow,
                startColumn: targetCell.mergeInfo.startColumn,
                endColumn: targetCell.mergeInfo.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
                unitId: this._context.unitId,
                sheetId: worksheet.getSheetId(),
            },
            primary: convertPrimaryWithCoordToPrimary(targetCell),
            style: null,
        }], SelectionMoveType.MOVE_END);
    }

    private _openMenu(clientX: number, clientY: number): void {
        this._contextMenuService.triggerContextMenu({
            clientX,
            clientY,
            preventDefault: () => {},
            stopPropagation: () => {},
        } as unknown as IPointerEvent, ContextMenuPosition.MAIN_AREA);
    }

    private _triggerLongPressMenu(state: ILongPressState): void {
        if (!state.activeTouch || this._contextMenuService.visible) {
            return;
        }

        if (this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) || this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)) {
            return;
        }

        const targetCell = this._getTargetCellByOffset(state.activeTouch.offsetX, state.activeTouch.offsetY);
        if (!targetCell) {
            return;
        }

        const pickedObject = this._context.scene.pick(Vector2.FromArray([state.activeTouch.offsetX, state.activeTouch.offsetY])) as { oKey?: string } | null;
        const snapshotRanges = state.selectionSnapshot.map((selection) => selection.range);
        const shouldKeepSelection = isSelectionObjectKey(pickedObject?.oKey)
            || shouldKeepCurrentSelectionForMobileContextMenu(snapshotRanges, targetCell.mergeInfo);

        state.longPressTriggered = true;
        state.shouldRestoreSelectionSnapshot = shouldKeepSelection;

        if (shouldKeepSelection) {
            this._restoreSelectionSnapshot(state.selectionSnapshot);
            queueMicrotask(() => this._restoreSelectionSnapshot(state.selectionSnapshot));
        }

        this._openMenu(state.activeTouch.clientX, state.activeTouch.clientY);

        if (!shouldKeepSelection) {
            queueMicrotask(() => this._replaceSelectionWithTargetCell(targetCell));
        }
    }

    private _handleTouchStart(contentElement: HTMLElement, state: ILongPressState, event: TouchEvent): void {
        if (event.touches.length !== 1 || this._contextMenuService.visible) {
            this._resetLongPressState(state);
            return;
        }

        if (this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) || this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)) {
            this._resetLongPressState(state);
            return;
        }

        const touch = this._getTouchOffset(contentElement, event.touches[0]);
        if (!this._getTargetCellByOffset(touch.offsetX, touch.offsetY)) {
            this._resetLongPressState(state);
            return;
        }

        state.longPressTriggered = false;
        state.shouldRestoreSelectionSnapshot = false;
        state.selectionSnapshot = this._getSelectionSnapshot();
        state.activeTouch = touch;
        this._clearLongPressTimer(state);
        state.longPressTimer = setTimeout(() => this._triggerLongPressMenu(state), LONG_PRESS_DURATION);
    }

    private _handleTouchMove(contentElement: HTMLElement, state: ILongPressState, event: TouchEvent): void {
        if (!state.activeTouch || event.touches.length !== 1) {
            this._resetLongPressState(state);
            return;
        }

        const touch = this._getTouchOffset(contentElement, event.touches[0]);
        if (
            Math.abs(touch.offsetX - state.activeTouch.offsetX) > LONG_PRESS_MOVE_THRESHOLD ||
            Math.abs(touch.offsetY - state.activeTouch.offsetY) > LONG_PRESS_MOVE_THRESHOLD
        ) {
            this._resetLongPressState(state);
        }
    }

    private _handleTouchEnd(state: ILongPressState, event: TouchEvent): void {
        if (state.longPressTriggered) {
            event.preventDefault();
            if (state.shouldRestoreSelectionSnapshot) {
                queueMicrotask(() => this._restoreSelectionSnapshot(state.selectionSnapshot));
            }
        }

        state.longPressTriggered = false;
        state.shouldRestoreSelectionSnapshot = false;
        this._resetLongPressState(state);
    }
}
