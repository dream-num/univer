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
import { Disposable, DisposableCollection, Inject } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DragManagerService } from '../services/drag-manager.service';
import { type ISheetSkeletonManagerParam, SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export class DragRenderController extends Disposable implements IRenderModule, IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IRenderManagerService private _renderManagerService: IRenderManagerService,
        @Inject(DragManagerService) private _dragManagerService: DragManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this._initDragEvent();
    }

    private _initDragEvent() {
        const disposeSet = new DisposableCollection();
        const handleSkeletonChange = (skeletonParam: Nullable<ISheetSkeletonManagerParam>) => {
            disposeSet.dispose();
            if (!skeletonParam) {
                return;
            }

            const { scene } = this._context;
            const dragOverSub = scene.onDragOver$.subscribeEvent((evt) => {
                this._dragManagerService.onDragOver(evt);
            });

            const dropSub = scene.onDrop$.subscribeEvent((evt) => {
                this._dragManagerService.onDrop(evt);
            });

            disposeSet.add({
                dispose() {
                    dragOverSub.unsubscribe();
                    dropSub.unsubscribe();
                },
            });
        };

        handleSkeletonChange(this._sheetSkeletonManagerService.getCurrentParam());
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((skeletonParam) => {
            handleSkeletonChange(skeletonParam);
        }));
    }
}
