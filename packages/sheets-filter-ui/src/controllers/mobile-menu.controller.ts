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
import { SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter';
import { IMenuManagerService } from '@univerjs/ui';
import { menuSchema } from '../menu/schema';

export class SheetsFilterMobileMenuController extends Disposable {
    constructor(
        @ICommandService commandService: ICommandService,
        @IMenuManagerService menuManagerService: IMenuManagerService
    ) {
        super();

        this.disposeWithMe(commandService.registerCommand(SmartToggleSheetsFilterCommand));
        menuManagerService.mergeMenu(menuSchema);
    }
}
