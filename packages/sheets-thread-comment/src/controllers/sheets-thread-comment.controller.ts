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

import { Disposable } from '@univerjs/core';
import { IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { threadCommentMenu } from './menu';

export class SheetsThreadCommentController extends Disposable {
    constructor(
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._initMenu();
    }

    private _initMenu() {
        [threadCommentMenu].forEach((menu) => {
            this._menuService.addMenuItem(menu(this._injector));
        });
    }
}
