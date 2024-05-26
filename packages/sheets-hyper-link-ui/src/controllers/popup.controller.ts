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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { HoverManagerService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { SheetsHyperLinkPopupService } from '../services/popup.service';

@OnLifecycle(LifecycleStages.Rendered, SheetsHyperLinkPopupController)
export class SheetsHyperLinkPopupController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private readonly _hoverManagerService: HoverManagerService,
        @Inject(SheetsHyperLinkPopupService) private readonly _sheetsHyperLinkPopupService: SheetsHyperLinkPopupService
    ) {
        super();

        this._initHoverListener();
    }

    private _initHoverListener() {
        this.disposeWithMe(this._hoverManagerService.currentCell$.subscribe((currentCell) => {
            if (!currentCell) {
                this._sheetsHyperLinkPopupService.hideCurrentPopup();
                return;
            }

            this._sheetsHyperLinkPopupService.showPopup(currentCell.location);
        }));
    }
}
