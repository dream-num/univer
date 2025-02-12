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

import {
    Disposable,
    Inject,
    toDisposable,
} from '@univerjs/core';
import { AFTER_CELL_EDIT, SheetInterceptorService } from '@univerjs/sheets';
import { ConditionalFormattingService } from '@univerjs/sheets-conditional-formatting';

export class ConditionalFormattingEditorController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(ConditionalFormattingService) private readonly _conditionalFormattingService: ConditionalFormattingService
    ) {
        super();

        this._initInterceptorEditorEnd();
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorEnd() {
        this.disposeWithMe(
            toDisposable(
                this._sheetInterceptorService.writeCellInterceptor.intercept(
                    AFTER_CELL_EDIT,
                    {
                        handler: (value, context, next) => {
                            if (!value) {
                                next(value);
                            }
                            const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
                            const cfStyle = result?.style ?? {};
                            const keys = Object.keys(cfStyle);
                            if (value?.p) {
                                value.p.body?.textRuns?.forEach((item) => {
                                    if (item.ts) {
                                        keys.forEach((key) => {
                                            delete item.ts?.[key as keyof typeof item.ts];
                                        });
                                    }
                                });
                                return next(value);
                            } else {
                                const s = { ...(typeof value?.s === 'string' ? context.workbook.getStyles().get(value.s) : value?.s) || {} };
                                keys.forEach((key) => {
                                    delete s[key as keyof typeof s];
                                });
                                const cellData = { ...value, s: { ...s } };
                                return next(cellData);
                            }
                        },
                    }
                )
            )
        );
    }
}
