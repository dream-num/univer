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

import { Disposable, ICommandService } from '@univerjs/core';
import { IMenuManagerService } from '@univerjs/ui';
import { menuSchema, SwitchUnitOperation } from './multi-units.menu';

/**
 * This controller helps to debug multi units inside a single Univer
 * instance.
 */
export class MultiUnitsController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService
    ) {
        super();

        this._initializeCommand();
        this._initializeMenu();
    }

    private _initializeCommand(): void {
        this.disposeWithMe(this._commandService.registerCommand(SwitchUnitOperation));
    }

    private _initializeMenu(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
