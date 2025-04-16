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

import type { Dependency } from '@univerjs/core';
import { Inject, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '@univerjs/sheets-filter';
import { SheetsRenderService } from '@univerjs/sheets-ui';
import { SheetsFilterRenderController } from '../views/render-modules/sheets-filter.render-controller';

export class SheetsFilterUIMobileController extends RxDisposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsRenderService) private _sheetsRenderService: SheetsRenderService
    ) {
        super();

        [
            SetSheetsFilterRangeMutation,
            SetSheetsFilterCriteriaMutation,
            RemoveSheetsFilterMutation,
            ReCalcSheetsFilterMutation,
        ].forEach((m) => this.disposeWithMe(this._sheetsRenderService.registerSkeletonChangingMutations(m.id)));

        this.disposeWithMe(this._renderManagerService.registerRenderModule(
            UniverInstanceType.UNIVER_SHEET,
            [SheetsFilterRenderController] as Dependency
        ));
    }
}
