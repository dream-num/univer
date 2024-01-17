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

import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import type { ISheetObjectParam } from './utils/component-tools';
import { getSheetObject } from './utils/component-tools';

@OnLifecycle(LifecycleStages.Rendered, SheetBarController)
export class SheetBarController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        const sheetObject = this._getSheetObject();
        if (sheetObject == null) {
            return;
        }
        this._initViewMainListener(sheetObject);
    }

    private _initViewMainListener(sheetObject: ISheetObjectParam) {
        const { spreadsheet } = sheetObject;

        this.disposeWithMe(
            toDisposable(spreadsheet?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {}))
        );
    }

    private _getSheetObject() {
        return getSheetObject(this._currentUniverService, this._renderManagerService);
    }
}
