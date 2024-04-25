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

import { type IUniverInstanceService, type Nullable, UniverInstanceType, type Workbook, type Worksheet } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { map, of, switchMap } from 'rxjs';

interface IActive {
    workbook: Workbook;
    worksheet: Worksheet;
}

function getActiveSheet$(univerInstanceService: IUniverInstanceService): Observable<Nullable<IActive>> {
    return univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(switchMap((workbook) =>
        workbook
            ? workbook.activeSheet$.pipe(map((worksheet) => {
                if (!worksheet) return null;
                return { workbook, worksheet };
            }))
            : of(null)));
}

export function deriveStateFromActiveSheet$<T>(univerInstanceService: IUniverInstanceService, defaultValue: T, callback: (active: IActive) => Observable<T>) {
    return getActiveSheet$(univerInstanceService).pipe(switchMap((active) => {
        if (!active) return of(defaultValue);
        return callback(active);
    }));
}
