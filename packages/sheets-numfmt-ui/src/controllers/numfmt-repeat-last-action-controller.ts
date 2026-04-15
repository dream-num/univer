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

import type { ISetNumfmtCommandParams } from '@univerjs/sheets-numfmt';
import type { RepeatableCommandHandler } from '@univerjs/sheets-ui';
import { Disposable, Optional } from '@univerjs/core';
import { SetNumfmtCommand } from '@univerjs/sheets-numfmt';
import { IRepeatLastActionService, RepeatLastActionPermission } from '@univerjs/sheets-ui';

export class NumfmtRepeatLastActionController extends Disposable {
    constructor(
        @Optional(IRepeatLastActionService) private readonly _repeatLastActionService?: IRepeatLastActionService
    ) {
        super();

        this._initCommandRecording();
    }

    private _initCommandRecording(): void {
        if (!this._repeatLastActionService) {
            return;
        }

        const handler: RepeatableCommandHandler<ISetNumfmtCommandParams> = (selections, params) => {
            if (!params) return;

            const { values } = params;
            const numfmtCell = values.find((cell) => cell.pattern);

            if (!numfmtCell) return;

            const { pattern, type } = numfmtCell;
            const newValues = [];
            const cache = new Set<string>();

            for (const selection of selections) {
                const { startRow, startColumn, endRow, endColumn } = selection;
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const key = `${row}-${col}`;
                        if (cache.has(key)) {
                            continue;
                        }
                        cache.add(key);
                        newValues.push({ row, col, pattern, type });
                    }
                }
            }

            return {
                ...params,
                values: newValues,
            };
        };

        this.disposeWithMe(this._repeatLastActionService.registerRepeatableCommand(SetNumfmtCommand.id, handler, RepeatLastActionPermission.CellStyle));
    }
}
