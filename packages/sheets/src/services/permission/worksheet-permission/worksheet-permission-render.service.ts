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

import { Inject } from '@wendellhu/redi';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { Spreadsheet } from '@univerjs/engine-render';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { worksheetProtectionKey, WorksheetProtectionRenderExtension } from '../../../render/worksheet-protection/worksheet-permission.render';

@OnLifecycle(LifecycleStages.Ready, WorksheetProtectionRenderService)
export class WorksheetProtectionRenderService extends Disposable {
    private _worksheetProtectionRenderExtension = new WorksheetProtectionRenderExtension();
    constructor(
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService

    ) {
        super();
        this._initRender();
    }

    private _initRender() {
        const register = (renderId: string) => {
            const render = renderId && this._renderManagerService.getRenderById(renderId);
            const spreadsheetRender = render && render.mainComponent as Spreadsheet;
            if (spreadsheetRender) {
                if (!spreadsheetRender.getExtensionByKey(worksheetProtectionKey)) {
                    spreadsheetRender.register(this._worksheetProtectionRenderExtension);
                }
            }
        };
        this.disposeWithMe(this._renderManagerService.currentRender$.subscribe((renderId) => {
            renderId && register(renderId);
        }));
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)!;
        if (workbook) {
            register(workbook.getUnitId());
        }
    }
}
