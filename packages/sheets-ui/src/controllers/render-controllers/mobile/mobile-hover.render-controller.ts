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

import type { Nullable, Workbook } from '@univerjs/core';
import type {
    IMouseEvent,
    IPointerEvent,
    IRenderContext,
    IRenderModule,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetHeader,
} from '@univerjs/engine-render';
import type { ISheetSkeletonManagerParam } from '@univerjs/sheets';
import { Disposable, DisposableCollection, fromEventSubject, IContextService, Inject } from '@univerjs/core';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import {
    MOBILE_EXPANDING_SELECTION,
    MOBILE_PINCH_ZOOMING,
    MOBILE_TRIGGER_CONTEXT_MENU,
} from '../../../consts/mobile-context';
import { HoverManagerService } from '../../../services/hover-manager.service';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

const TAP_MOVE_THRESHOLD = 10;

interface IMobileTapState {
    offsetX: number;
    offsetY: number;
    pointerId: number | undefined;
}

type MobilePointerEvent = IMouseEvent | IPointerEvent;

function getPointerId(event: MobilePointerEvent): number | undefined {
    return 'pointerId' in event ? event.pointerId : undefined;
}

function isPrimaryPointer(event: MobilePointerEvent): boolean {
    return !('isPrimary' in event) || event.isPrimary !== false;
}

export class MobileHoverRenderController extends Disposable implements IRenderModule {
    private _active = false;
    private _tapState: Nullable<IMobileTapState> = null;

    get active(): boolean {
        return this._active;
    }

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetScrollManagerService) private readonly _scrollManagerService: SheetScrollManagerService,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();

        this._initPointerEvent();
        this._initScrollEvent();
    }

    private _initPointerEvent(): void {
        const disposeSet = new DisposableCollection();
        const handleSkeletonChange = (skeletonParam: Nullable<ISheetSkeletonManagerParam>) => {
            disposeSet.dispose();

            if (!skeletonParam) {
                return;
            }

            const { mainComponent, unitId, components } = this._context;
            if (!mainComponent) {
                return;
            }

            this._bindMainComponentEvents(disposeSet, mainComponent as Spreadsheet, unitId);
            const rowHeader = components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
            const colHeader = components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
            if (rowHeader) {
                this._bindRowHeaderEvents(disposeSet, rowHeader, unitId);
            }
            if (colHeader) {
                this._bindColumnHeaderEvents(disposeSet, colHeader, unitId);
            }
        };

        handleSkeletonChange(this._sheetSkeletonManagerService.getCurrentParam());
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(handleSkeletonChange));
        this.disposeWithMe(disposeSet);
    }

    private _bindMainComponentEvents(disposeSet: DisposableCollection, mainComponent: Spreadsheet, unitId: string): void {
        disposeSet.add(mainComponent.onPointerEnter$.subscribeEvent(() => {
            this._active = true;
        }));
        disposeSet.add(fromEventSubject(mainComponent.onPointerMove$).subscribe((event) => {
            this._active = true;
            this._updateTapState(event);
            this._hoverManagerService.triggerMouseMove(unitId, event);
        }));
        disposeSet.add(mainComponent.onPointerDown$.subscribeEvent((event) => {
            this._startTap(event);
            this._hoverManagerService.triggerPointerDown(unitId, event);
        }));
        disposeSet.add(mainComponent.onPointerUp$.subscribeEvent((event) => {
            this._hoverManagerService.triggerPointerUp(unitId, event);
            if (this._finishTap(event)) {
                this._hoverManagerService.triggerClick(unitId, event.offsetX, event.offsetY);
            }
        }));
        disposeSet.add(mainComponent.onDblclick$.subscribeEvent((event) => {
            this._hoverManagerService.triggerDbClick(unitId, event.offsetX, event.offsetY);
        }));
        disposeSet.add(mainComponent.onPointerLeave$.subscribeEvent(() => {
            this._active = false;
            this._tapState = null;
        }));
    }

    private _bindRowHeaderEvents(disposeSet: DisposableCollection, rowHeader: SpreadsheetHeader, unitId: string): void {
        disposeSet.add(rowHeader.onPointerMove$.subscribeEvent((event) => {
            this._hoverManagerService.triggerRowHeaderMouseMove(unitId, event.offsetX, event.offsetY);
        }));
        disposeSet.add(rowHeader.onPointerDown$.subscribeEvent((event) => {
            this._hoverManagerService.triggerRowHeaderPoniterDown(unitId, event.offsetX, event.offsetY);
        }));
        disposeSet.add(rowHeader.onPointerUp$.subscribeEvent((event) => {
            this._hoverManagerService.triggerRowHeaderPoniterUp(unitId, event.offsetX, event.offsetY);
            if (!this._contextService.getContextValue(MOBILE_TRIGGER_CONTEXT_MENU)) {
                this._hoverManagerService.triggerRowHeaderClick(unitId, event.offsetX, event.offsetY);
            }
        }));
        disposeSet.add(rowHeader.onDblclick$.subscribeEvent((event) => {
            this._hoverManagerService.triggerRowHeaderDbClick(unitId, event.offsetX, event.offsetY);
        }));
    }

    private _bindColumnHeaderEvents(
        disposeSet: DisposableCollection,
        columnHeader: SpreadsheetColumnHeader,
        unitId: string
    ): void {
        disposeSet.add(columnHeader.onPointerMove$.subscribeEvent((event) => {
            this._hoverManagerService.triggerColHeaderMouseMove(unitId, event.offsetX, event.offsetY);
        }));
        disposeSet.add(columnHeader.onPointerDown$.subscribeEvent((event) => {
            this._hoverManagerService.triggerColHeaderPoniterDown(unitId, event.offsetX, event.offsetY);
        }));
        disposeSet.add(columnHeader.onPointerUp$.subscribeEvent((event) => {
            this._hoverManagerService.triggerColHeaderPoniterUp(unitId, event.offsetX, event.offsetY);
            if (!this._contextService.getContextValue(MOBILE_TRIGGER_CONTEXT_MENU)) {
                this._hoverManagerService.triggerColHeaderClick(unitId, event.offsetX, event.offsetY);
            }
        }));
        disposeSet.add(columnHeader.onDblclick$.subscribeEvent((event) => {
            this._hoverManagerService.triggerColHeaderDbClick(unitId, event.offsetX, event.offsetY);
        }));
    }

    private _startTap(event: MobilePointerEvent): void {
        if (
            !isPrimaryPointer(event) ||
            this._contextService.getContextValue(MOBILE_PINCH_ZOOMING) ||
            this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)
        ) {
            this._tapState = null;
            return;
        }

        this._tapState = {
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            pointerId: getPointerId(event),
        };
    }

    private _updateTapState(event: MobilePointerEvent): void {
        const pointerId = getPointerId(event);
        if (!this._tapState || (pointerId != null && pointerId !== this._tapState.pointerId)) {
            return;
        }

        if (
            Math.abs(event.offsetX - this._tapState.offsetX) > TAP_MOVE_THRESHOLD ||
            Math.abs(event.offsetY - this._tapState.offsetY) > TAP_MOVE_THRESHOLD
        ) {
            this._tapState = null;
        }
    }

    private _finishTap(event: MobilePointerEvent): boolean {
        const tapState = this._tapState;
        this._tapState = null;
        const pointerId = getPointerId(event);
        if (!tapState || (pointerId != null && pointerId !== tapState.pointerId)) {
            return false;
        }

        return Math.abs(event.offsetX - tapState.offsetX) <= TAP_MOVE_THRESHOLD
            && Math.abs(event.offsetY - tapState.offsetY) <= TAP_MOVE_THRESHOLD
            && !this._contextService.getContextValue(MOBILE_PINCH_ZOOMING)
            && !this._contextService.getContextValue(MOBILE_EXPANDING_SELECTION)
            && !this._contextService.getContextValue(MOBILE_TRIGGER_CONTEXT_MENU);
    }

    private _initScrollEvent(): void {
        this.disposeWithMe(this._scrollManagerService.validViewportScrollInfo$.subscribe(() => {
            this._tapState = null;
            this._hoverManagerService.triggerScroll();
        }));
    }
}
