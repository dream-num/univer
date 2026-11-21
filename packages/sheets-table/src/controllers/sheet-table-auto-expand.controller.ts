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

import { Disposable, Inject } from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import { ApplyTableAutoExpandMutation } from '../commands/mutations/apply-table-auto-expand.mutation';
import { SheetTableAutoExpandService } from '../services/table-auto-expand.service';

export class SheetTableAutoExpandController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) interceptor: SheetInterceptorService,
        @Inject(SheetTableAutoExpandService) service: SheetTableAutoExpandService
    ) {
        super();
        this.disposeWithMe(interceptor.interceptValueChange((context) => service.prepare(context).map((patch) => ({
            redo: { id: ApplyTableAutoExpandMutation.id, params: { unitId: patch.unitId, subUnitId: patch.subUnitId, patch, direction: 'redo' } },
            undo: { id: ApplyTableAutoExpandMutation.id, params: { unitId: patch.unitId, subUnitId: patch.subUnitId, patch, direction: 'undo' } },
        }))));
    }
}
