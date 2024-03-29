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

import {
    Disposable,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';

import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { ConditionalFormattingService, getStringFromDataStream } from '@univerjs/sheets-conditional-formatting';

@OnLifecycle(LifecycleStages.Rendered, ConditionalFormattingEditorController)
export class ConditionalFormattingEditorController extends Disposable {
    constructor(
        @Inject(IEditorBridgeService) private _editorBridgeService: IEditorBridgeService,
        @Inject(ConditionalFormattingService) private _conditionalFormattingService: ConditionalFormattingService

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
                this._editorBridgeService.interceptor.intercept(
                    this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT,
                    {
                        handler: (value, context, next) => {
                            const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
                            if (result?.style && value?.p) {
                                const keys = Object.keys(result?.style);
                                if (keys.length > 0) {
                                    const v = getStringFromDataStream(value.p);
                                    const s = { ...(typeof value.s === 'string' ? context.workbook.getStyles().get(value.s) : value.s) || {} };
                                    keys.forEach((key) => {
                                        delete s[key as keyof typeof s];
                                    });
                                    const cellData = { ...value, s: { ...s }, v };
                                    delete cellData.p;
                                    return next(cellData);
                                }
                            }
                            return next(value);
                        },
                    }
                )
            )
        );
    }
}
