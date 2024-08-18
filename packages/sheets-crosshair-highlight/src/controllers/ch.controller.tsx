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

import React from 'react';
import { connectInjector, Disposable, Inject, Injector } from '@univerjs/core';
import { IUIPartsService } from '@univerjs/ui';
import { SheetsUIPart } from '@univerjs/sheets-ui';
import { CrosshairHighlight } from '../views/components/CrosshairHighlight';

export class SheetsCrosshairHighlightController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._uiPartsService.registerComponent(
            SheetsUIPart.SHEETS_FOOTER,
            () => connectInjector(() => <CrosshairHighlight />, this._injector)
        ));
    }
}
