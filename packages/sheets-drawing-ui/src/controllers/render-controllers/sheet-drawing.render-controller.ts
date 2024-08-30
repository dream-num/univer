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

import { Disposable, Inject, LifecycleService, LifecycleStages, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { filter, first } from 'rxjs';

export class SheetsDrawingRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._drawingInitializeListener();
    }

    private _drawingInitializeListener() {
        this._lifecycleService.lifecycle$.pipe(filter((e) => e === LifecycleStages.Steady), first()).subscribe(() => {
            if (this._context.type === UniverInstanceType.UNIVER_SHEET) {
                this._sheetDrawingService.initializeNotification(this._context.unitId);
                this._drawingManagerService.initializeNotification(this._context.unitId);
            }
        });
    }
}
