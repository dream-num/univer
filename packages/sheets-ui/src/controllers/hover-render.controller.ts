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
import { Disposable, DisposableCollection } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { HoverManagerService } from '../services/hover-manager.service';
import type { ISheetSkeletonManagerParam } from '../services/sheet-skeleton-manager.service';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';
import { SheetScrollManagerService } from '../services/scroll-manager.service';

export class HoverRenderController extends Disposable implements IRenderModule {
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

    private _initPointerEvent() {
        const disposeSet = new DisposableCollection();
        const handleSkeletonChange = (skeletonParam: Nullable<ISheetSkeletonManagerParam>) => {
            disposeSet.dispose();

            if (!skeletonParam) {
                return;
            }

            const { mainComponent } = this._context;
            const observer = mainComponent?.onPointerMoveObserver.add((evt) => {
                this._hoverManagerService.onMouseMove(evt.offsetX, evt.offsetY);
            });

            disposeSet.add(observer);
        };

        handleSkeletonChange(this._sheetSkeletonManagerService.getCurrent());
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((skeletonParam) => {
            handleSkeletonChange(skeletonParam);
        }));
    }

    private _initScrollEvent() {
        this.disposeWithMe(this._scrollManagerService.scrollInfo$.subscribe(() => this._hoverManagerService.onScroll()));
    }
}
