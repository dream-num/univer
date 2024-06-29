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

import type { Nullable, Workbook } from '@univerjs/core';
import { DisposableCollection, RANGE_TYPE, ThemeService } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { IRenderManagerService, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { convertSelectionDataToRange, getNormalSelectionStyle, type ISelectionWithCoordAndStyle, type ISelectionWithStyle, SelectionMoveType, type SheetsSelectionManagerService, type WorkbookSelections } from '@univerjs/sheets';
import { BaseSelectionRenderService, checkInHeaderRanges, getAllSelection, getCoordByOffset, getSheetObject, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IShortcutService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { IRefSelectionsService } from '../ref-selections.service';

/**
 * This service extends the existing `SelectionRenderService` to provide the rendering of prompt selections
 * when user is editing ref ranges in formulas.
 *
 * Not that this service works with Uni-mode, which means it should be able to deal with multi render unit
 * and handle selections on them, though each at a time.
 */
export class RefSelectionsRenderService extends BaseSelectionRenderService implements IRenderModule {
    private readonly _workbookSelections: WorkbookSelections;

    private _eventDisposables: Nullable<IDisposable>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) injector: Injector,
        @Inject(ThemeService) themeService: ThemeService,
        @IShortcutService shortcutService: IShortcutService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @IRefSelectionsService refSelectionsService: SheetsSelectionManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super(
            injector,
            themeService,
            shortcutService,
            renderManagerService
        );

        this._workbookSelections = refSelectionsService.getWorkbookSelections(this._context.unitId);

        this._initSelectionChangeListener();
        this._initSkeletonChangeListener();
        this._initUserActionSyncListener();

        this._setStyle(getRefSelectionStyle(this._themeService));
        this._remainLastEnabled = true; // For ref range selections, we should always remain others.
    }

    /**
     * Add ref range selections. This method should be called when user is editing a formula string.
     */
    add(selections: ISelectionWithStyle[]): void {
        for (const s of selections) {
            const selection = this.attachSelectionWithCoord(s);
            this._addControlToCurrentByRangeData(selection);
        }
    }

    clear(): void {
        this._reset();
    }

    setRemainLastEnabled(enabled: boolean): void {
        this._remainLastEnabled = enabled;
    }

    setSkipLastEnabled(enabled: boolean): void {
        this._skipLastEnabled = enabled;
    }

    /**
     * Call this method and user will be able to select on the canvas to update selections.
     */
    enableSelectionChanging(): void {
        this.disableSelectionChanges();
        this._eventDisposables = this._initEventListeners();
    }

    disableSelectionChanges(): void {
        this._eventDisposables?.dispose();
        this._eventDisposables = null;
    }

    private _initEventListeners(): IDisposable {
        const sheetObject = this._getSheetObject();
        const { spreadsheetRowHeader, spreadsheetColumnHeader, spreadsheet, spreadsheetLeftTopPlaceholder } = sheetObject;
        const { scene } = this._context;

        const listenerDisposables = new DisposableCollection();

        listenerDisposables.add(spreadsheet?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            this._onPointerDown(evt, spreadsheet.zIndex + 1, RANGE_TYPE.NORMAL, this._getActiveViewport(evt));
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        listenerDisposables.add(
            spreadsheetRowHeader?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
                const { row } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
                const matchSelectionData = checkInHeaderRanges(this._workbookSelections.getCurrentSelections(), row, RANGE_TYPE.ROW);
                if (matchSelectionData) return;

                this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.ROW, this._getActiveViewport(evt), ScrollTimerType.Y);
                if (evt.button !== 2) {
                    state.stopPropagation();
                }
            })
        );

        listenerDisposables.add(spreadsheetColumnHeader?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
            const { column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
            const matchSelectionData = checkInHeaderRanges(this._workbookSelections.getCurrentSelections(), column, RANGE_TYPE.COLUMN);
            if (matchSelectionData) return;

            this._onPointerDown(evt, (spreadsheet.zIndex || 1) + 1, RANGE_TYPE.COLUMN, this._getActiveViewport(evt), ScrollTimerType.X);

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        listenerDisposables.add(spreadsheetLeftTopPlaceholder?.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            this._reset(); // remove all other selections

            const skeleton = this._sheetSkeletonManagerService.getCurrent()!.skeleton;
            const selectionWithStyle = getAllSelection(skeleton);
            const selectionData = this.attachSelectionWithCoord(selectionWithStyle);
            this._addControlToCurrentByRangeData(selectionData);
            this.refreshSelectionMoveStart();

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        }));

        return listenerDisposables;
    }

    private _initUserActionSyncListener() {
        // When user completes range selection, we should update the range into the `IRefSelectionService`.
        this.disposeWithMe(this.selectionMoveEnd$.subscribe((params) => this._updateSelections(params, SelectionMoveType.MOVE_END)));
    }

    private _updateSelections(selectionDataWithStyleList: ISelectionWithCoordAndStyle[], _type: SelectionMoveType) {
        const workbook = this._context.unit;
        const sheetId = workbook.getActiveSheet()?.getSheetId();
        if (!sheetId) return;

        if (selectionDataWithStyleList == null || selectionDataWithStyleList.length === 0) {
            return;
        }

        this._workbookSelections.setSelections(
            sheetId,
            selectionDataWithStyleList.map((selectionDataWithStyle) => convertSelectionDataToRange(selectionDataWithStyle))
        );
    }

    private _initSelectionChangeListener(): void {
        // When selection completes, we need to update the selections' rendering and clear event handlers.
        this.disposeWithMe(this._workbookSelections.selectionMoveEnd$.subscribe((params) => {
            this._reset();
            for (const selectionWithStyle of params) {
                const selectionData = this.attachSelectionWithCoord(selectionWithStyle);
                this._addControlToCurrentByRangeData(selectionData);
            }
        }));
    }

    private _initSkeletonChangeListener(): void {
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (!param) {
                return;
            }

            const { skeleton } = param;
            const { scene } = this._context;
            const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            this._changeRuntime(skeleton, scene, viewportMain);
        }));
    }

    private _getActiveViewport(evt: IPointerEvent | IMouseEvent) {
        const sheetObject = this._getSheetObject();
        return sheetObject?.scene.getActiveViewportByCoord(Vector2.FromArray([evt.offsetX, evt.offsetY]));
    }

    private _getSheetObject() {
        return getSheetObject(this._context.unit, this._context)!;
    }
}

function getRefSelectionStyle(themeService: ThemeService) {
    const style = getNormalSelectionStyle(themeService);
    style.strokeDash = 8;
    style.hasAutoFill = false;
    style.hasRowHeader = false;
    style.hasColumnHeader = false;

    return style;
}
