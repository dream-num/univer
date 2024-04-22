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

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { AdditionAndSubtractionSingle } from '@univerjs/icons';
import { SelectionManagerService } from '@univerjs/sheets';
import { UploadFileMenu } from '../views/upload-component/UploadFile';
import { COMPONENT_UPLOAD_FILE_MENU } from '../views/upload-component/component-name';
import { ImageMenuFactory, ImageUploadIcon, UploadCellImageMenuFactory, UploadFloatImageMenuFactory } from '../views/menu/image.menu';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../commands/operations/insert-image.operation';

@OnLifecycle(LifecycleStages.Rendered, SheetImageUIController)
export class SheetImageUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initCommandListeners();
    }

    private _initCommandListeners(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === InsertCellImageOperation.id) {
                    this._insertCellImage();
                } else if (command.id === InsertFloatImageOperation.id) {
                    this._insertFloatImage();
                }
            })
        );
    }

    private _insertCellImage(): void {

    }

    private _insertFloatImage(): void {

    }
}
