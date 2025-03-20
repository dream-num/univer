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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISheetSkeletonManagerParam } from '../services/sheet-skeleton-manager.service';
import { Disposable, DisposableCollection, fromEventSubject, Inject } from '@univerjs/core';
import { SHEET_VIEW_KEY } from '../common/keys';
import { HoverManagerService } from '../services/hover-manager.service';
import { SheetScrollManagerService } from '../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export class HoverRenderController extends Disposable implements IRenderModule {
    private _active = false;

    get active() {
        return this._active;
    }

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetScrollManagerService) private _scrollManagerService: SheetScrollManagerService
    ) {
        super();

        this._initPointerEvent();
        this._initScrollEvent();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initPointerEvent() {
        const disposeSet = new DisposableCollection();
        // eslint-disable-next-line max-lines-per-function
        const handleSkeletonChange = (skeletonParam: Nullable<ISheetSkeletonManagerParam>) => {
            disposeSet.dispose();

            if (!skeletonParam) {
                return;
            }

            const { mainComponent, unitId, components } = this._context;
            if (!mainComponent) {
                return;
            }

            disposeSet.add(mainComponent.onPointerEnter$.subscribeEvent((evt) => {
                this._active = true;
            }));

            disposeSet.add(fromEventSubject(mainComponent.onPointerMove$).subscribe((evt) => {
                this._active = true;
                this._hoverManagerService.triggerMouseMove(unitId, evt);
            }));

            disposeSet.add(mainComponent.onPointerDown$.subscribeEvent((evt) => {
                this._hoverManagerService.triggerPointerDown(unitId, evt);
            }));

            disposeSet.add(mainComponent.onPointerUp$.subscribeEvent((evt) => {
                this._hoverManagerService.triggerPointerUp(unitId, evt);
            }));

            disposeSet.add(mainComponent.onClick$.subscribeEvent((evt) => {
                this._hoverManagerService.triggerClick(unitId, evt.offsetX, evt.offsetY);
            }));

            disposeSet.add(mainComponent.onDblclick$.subscribeEvent((evt) => {
                this._hoverManagerService.triggerDbClick(unitId, evt.offsetX, evt.offsetY);
            }));

            disposeSet.add(mainComponent.onPointerLeave$.subscribeEvent(() => {
                this._active = false;
            }));

            const rowHeader = components.get(SHEET_VIEW_KEY.ROW);
            const colHeader = components.get(SHEET_VIEW_KEY.COLUMN);
            if (rowHeader) {
                disposeSet.add(rowHeader.onPointerMove$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerRowHeaderMouseMove(unitId, evt.offsetX, evt.offsetY);
                }));

                disposeSet.add(rowHeader.onPointerDown$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerRowHeaderPoniterDown(unitId, evt.offsetX, evt.offsetY);
                }));

                disposeSet.add(rowHeader.onPointerUp$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerRowHeaderPoniterUp(unitId, evt.offsetX, evt.offsetY);
                    this._hoverManagerService.triggerRowHeaderClick(unitId, evt.offsetX, evt.offsetY);
                }));

                disposeSet.add(rowHeader.onDblclick$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerRowHeaderDbClick(unitId, evt.offsetX, evt.offsetY);
                }));
            }

            if (colHeader) {
                disposeSet.add(colHeader.onPointerMove$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerColHeaderMouseMove(unitId, evt.offsetX, evt.offsetY);
                }));

                disposeSet.add(colHeader.onPointerDown$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerColHeaderPoniterDown(unitId, evt.offsetX, evt.offsetY);
                }));

                disposeSet.add(colHeader.onPointerUp$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerColHeaderPoniterUp(unitId, evt.offsetX, evt.offsetY);
                    this._hoverManagerService.triggerColHeaderClick(unitId, evt.offsetX, evt.offsetY);
                }));

                disposeSet.add(colHeader.onDblclick$.subscribeEvent((evt) => {
                    this._hoverManagerService.triggerColHeaderDbClick(unitId, evt.offsetX, evt.offsetY);
                }));
            }
        };

        handleSkeletonChange(this._sheetSkeletonManagerService.getCurrentParam());
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((skeletonParam) => {
            handleSkeletonChange(skeletonParam);
        }));
    }

    private _initScrollEvent() {
        this.disposeWithMe(this._scrollManagerService.validViewportScrollInfo$.subscribe(() => this._hoverManagerService.triggerScroll()));
    }
}
