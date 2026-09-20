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

import type { IRenderContext, IRenderModule, Spreadsheet } from '@univerjs/engine-render';
import type { ISetWorksheetBackgroundImageMutationParams } from '@univerjs/sheets-drawing';
import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { SetWorksheetBackgroundImageMutation } from '@univerjs/sheets-drawing';
import { WorksheetBackgroundImageExtension } from '../../views/background/worksheet-background-image.extension';

export class WorksheetBackgroundRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext,
        @ICommandService commandService: ICommandService,
        @Inject(Injector) injector: Injector
    ) {
        super();

        const spreadsheet = this._context.mainComponent as Spreadsheet;
        const extension = new WorksheetBackgroundImageExtension(injector, () => {
            spreadsheet.makeForceDirty(true);
            this._context.scene.makeDirty();
        });
        this.disposeWithMe(spreadsheet.register(extension));
        this.disposeWithMe(commandService.onCommandExecuted((command) => {
            const params = command.params as Partial<ISetWorksheetBackgroundImageMutationParams> | undefined;
            if (
                command.id === SetWorksheetBackgroundImageMutation.id &&
                params?.unitId === this._context.unitId
            ) {
                spreadsheet.makeForceDirty(true);
                this._context.scene.makeDirty();
            }
        }));
    }
}
