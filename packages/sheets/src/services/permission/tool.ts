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

import { IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { SheetPermissionService } from './sheet-permission.service';

export function getCurrentSheetDisabled$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sheetPermissionService = accessor.get(SheetPermissionService);
    const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
    const sheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

    return new Observable<boolean>((subscriber) => {
        const permission$ = sheetPermissionService.getEditable$(unitId, sheetId)?.subscribe((e) => {
            subscriber.next(!e.value);
        });
        return () => {
            permission$?.unsubscribe();
        };
    });
}
