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

import type { ISetRangeThemeMutationParams } from '@univerjs/sheets';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { SetRangeThemeMutation } from '@univerjs/sheets';
import { SHEET_TABLE_CUSTOM_THEME_PREFIX } from '@univerjs/sheets-table';
import { Subject } from 'rxjs';

export class SheetTableThemeUIController extends Disposable {
    private _refreshTable = new Subject<number>();
    public refreshTable$ = this._refreshTable.asObservable();

    constructor(
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initListener();
    }

    private _initListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (command.id === SetRangeThemeMutation.id) {
                    const params = command.params as ISetRangeThemeMutationParams;
                    const { styleName } = params;
                    if (styleName.startsWith(SHEET_TABLE_CUSTOM_THEME_PREFIX)) {
                        this._refreshTable.next(Math.random());
                    }
                }
            })
        );
    }
}
