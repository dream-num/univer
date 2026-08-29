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
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { Disposable, IContextService, Inject, Rectangle, toDisposable } from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { convertSelectionDataToRange, SelectionMoveType, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, ILayoutService } from '@univerjs/ui';
import { MOBILE_EXPANDING_SELECTION, MOBILE_PINCH_ZOOMING } from '../../../consts/mobile-context';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SELECTION_MANAGER_KEY } from '../../../services/selection/selection-control';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

const TAP_MOVE_THRESHOLD = 10;
const TAP_MENU_DELAY = 500;
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

interface ITapState {
    activeTouch: Nullable<ITouchPosition>;
    menuTimer: Nullable<ReturnType<typeof setTimeout>>;
    shouldOpenMenu: boolean;
    selectionSnapshot: ISelectionWithStyle[];
}

function isSelectionObjectKey(objectKey?: string | null): boolean {
    return !!objectKey && SELECTION_OBJECT_PREFIXES.some((prefix) => objectKey.startsWith(prefix));
}

export function shouldKeepCurrentSelectionForMobileContextMenu(currentSelections: Array<IRange | ISelectionWithStyle>, targetRange: IRange): boolean {
    return currentSelections.some((selection) => Rectangle.contains('range' in selection ? selection.range : selection, targetRange));
}

/**
 * On mobile devices, tapping inside the current selection a second time opens
 * the context menu. Tapping elsewhere remains a normal selection gesture.
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

        const state = this._createTapState();
        const handlePointerDown = (event: PointerEvent) => this._handlePointerDown(contentElement, state, event);
        const handlePointerMove = (event: PointerEvent) => this._handlePointerMove(contentElement, state, event);
        const handlePointerUp = (event: PointerEvent) => this._handlePointerUp(state, event);
        const handlePointerCancel = () => this._resetTapState(state);
        const dblclickSubscription = this._context.mainComponent?.onDblclick$.subscribeEvent(() => this._cancelPendingMenu(state));
        if (dblclickSubscription) {
            this.disposeWithMe(dblclickSubscription);
        }

        contentElement.addEventListener('pointerdown', handlePointerDown, true);
        contentElement.addEventListener('pointermove', handlePointerMove, true);
        contentElement.addEventListener('pointerup', handlePointerUp, true);
        contentElement.addEventListener('pointercancel', handlePointerCancel, true);

        this.disposeWithMe(toDisposable(() => {
            contentElement.removeEventListener('pointerdown', handlePointerDown, true);
            contentElement.removeEventListener('pointermove', handlePointerMove, true);
            contentElement.removeEventListener('pointerup', handlePointerUp, true);
            contentElement.removeEventListener('pointercancel', handlePointerCancel, true);
            this._cancelPendingMenu(state);
        }));
    }

    private _createTapState(): ITapState {
        return {
            activeTouch: null,
            menuTimer: null,
            shouldOpenMenu: false,
            selectionSnapshot: [],
        };
    }

    private _resetTapState(state: ITapState): void {
        state.activeTouch = null;
        state.shouldOpenMenu = false;
    }

    private _cancelPendingMenu(state: ITapState): void {
        if (state.menuTimer == null) {
            return;
        }
        clearTimeout(state.menuTimer);
        state.menuTimer = null;
    }

    private _getPointerOffset(contentElement: HTMLElement, event: PointerEvent): ITouchPosition {
        const rect = contentElement.getBoundingClientRect();
        return {
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
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

    private _openMenu(clientX: number, clientY: number): void {
        const event = new MouseEvent('contextmenu', { clientX, clientY });
        this._contextMenuService.triggerContextMenu(event, ContextMenuPosition.MAIN_AREA, { unitId: this._context.unitId });
    }

    private _handlePointerDown(contentElement: HTMLElement, state: ITapState, event: PointerEvent): void {
        this._cancelPendingMenu(state);
        if (this._contextMenuService.visible) {
            this._contextMenuService.hideContextMenu();
            this._resetTapState(state);
            return;
        }

        if (!event.isPrimary || this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) || this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)) {
            this._resetTapState(state);
            return;
        }

        const touch = this._getPointerOffset(contentElement, event);
        const targetCell = this._getTargetCellByOffset(touch.offsetX, touch.offsetY);
        if (!targetCell) {
            this._resetTapState(state);
            return;
        }

        state.selectionSnapshot = this._getSelectionSnapshot();
        state.activeTouch = touch;
        const pickedObject = this._context.scene.pick(Vector2.FromArray([touch.offsetX, touch.offsetY]));
        state.shouldOpenMenu = isSelectionObjectKey(pickedObject && 'oKey' in pickedObject ? pickedObject.oKey : undefined)
            || shouldKeepCurrentSelectionForMobileContextMenu(state.selectionSnapshot, targetCell.mergeInfo);

        if (state.shouldOpenMenu) {
            const selectionSnapshot = this._cloneSelections(state.selectionSnapshot);
            queueMicrotask(() => {
                if (
                    !this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) &&
                    !this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)
                ) {
                    this._restoreSelectionSnapshot(selectionSnapshot);
                }
            });
        }
    }

    private _handlePointerMove(contentElement: HTMLElement, state: ITapState, event: PointerEvent): void {
        if (!state.activeTouch || !event.isPrimary) {
            this._resetTapState(state);
            return;
        }

        const touch = this._getPointerOffset(contentElement, event);
        if (
            Math.abs(touch.offsetX - state.activeTouch.offsetX) > TAP_MOVE_THRESHOLD ||
            Math.abs(touch.offsetY - state.activeTouch.offsetY) > TAP_MOVE_THRESHOLD
        ) {
            this._resetTapState(state);
        }
    }

    private _handlePointerUp(state: ITapState, event: PointerEvent): void {
        if (
            state.activeTouch &&
            state.shouldOpenMenu &&
            !this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) &&
            !this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)
        ) {
            event.preventDefault();
            const { clientX, clientY } = state.activeTouch;
            const selectionSnapshot = this._cloneSelections(state.selectionSnapshot);
            state.menuTimer = setTimeout(() => {
                state.menuTimer = null;
                this._restoreSelectionSnapshot(selectionSnapshot);
                queueMicrotask(() => this._restoreSelectionSnapshot(selectionSnapshot));
                this._openMenu(clientX, clientY);
            }, TAP_MENU_DELAY);
        }

        this._resetTapState(state);
    }
}
