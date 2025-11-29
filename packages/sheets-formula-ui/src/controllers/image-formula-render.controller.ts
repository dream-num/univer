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
import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ImageFormulaCellInterceptorController } from '@univerjs/sheets-formula';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export class ImageFormulaRenderController extends Disposable {
    constructor(
        @Inject(ImageFormulaCellInterceptorController) private readonly _imageFormulaCellInterceptorController: ImageFormulaCellInterceptorController,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._imageFormulaCellInterceptorController.registerRefreshRenderFunction(() => {
            const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return;

            const render = this._renderManagerService.getRenderById(workbook.getUnitId());
            if (!render) return;

            render.with(SheetSkeletonManagerService).reCalculate();

            const mainComponent = render.mainComponent;
            if (!mainComponent) return;

            mainComponent.makeDirty();
        });
    }
}
