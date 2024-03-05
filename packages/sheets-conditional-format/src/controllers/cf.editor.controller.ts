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
import type { IIconSetCellData } from '../render/type';

@OnLifecycle(LifecycleStages.Rendered, ConditionalFormatEditorController)
export class ConditionalFormatEditorController extends Disposable {
    constructor(
        @Inject(IEditorBridgeService) private _editorBridgeService: IEditorBridgeService
    ) {
        super();
        this._initInterceptorEditorStart();
    }

    private _initInterceptorEditorStart() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.interceptor.intercept(
                    this._editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT,
                    {
                        handler: (value, _context, next) => {
                            const cellData = value as IIconSetCellData;
                            if (cellData && cellData.v === '' && cellData._originV !== undefined) {
                                return next({ ...cellData, v: cellData._originV });
                            }
                            return next(value);
                        },
                    }
                )
            )
        );
    }
}
