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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import {
    Disposable,
    Inject,
    toDisposable,
} from '@univerjs/core';
import { ISheetClipboardService } from '../../services/clipboard/clipboard.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { SheetClipboardController } from '../clipboard/clipboard.controller';

export class ClipboardRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ISheetClipboardService private readonly _sheetClipboardService: ISheetClipboardService,
        @Inject(SheetClipboardController) private readonly _sheetClipboardController: SheetClipboardController
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this.disposeWithMe(
            toDisposable(this._sheetSkeletonManagerService.currentSkeleton$.subscribe((skeleton) => {
                if (!skeleton?.unitId) {
                    return;
                }
                if (!this._sheetClipboardService.getPasteMenuVisible()) {
                    return;
                }
                const pasteOptionsCache = this._sheetClipboardService.getPasteOptionsCache();
                const menuUnitId = pasteOptionsCache?.target.unitId;
                if (skeleton.unitId === menuUnitId) {
                    this._sheetClipboardController.refreshOptionalPaste();
                }
            }))
        );
    }
}
