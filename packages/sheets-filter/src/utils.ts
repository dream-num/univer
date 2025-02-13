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

import type { IMutationInfo, Nullable } from '@univerjs/core';
import type { ISetSheetsFilterCriteriaMutationParams } from './commands/mutations/sheets-filter.mutation';
import { SetSheetsFilterCriteriaMutation } from './commands/mutations/sheets-filter.mutation';

interface ILine {
    start: number;
    end: number;
}
export function lineIntersect(line1: ILine, line2: ILine): boolean {
    return line1.start <= line2.end && line1.end >= line2.start;
}

export function lineContains(line1: ILine, line2: ILine): boolean {
    return line1.start <= line2.start && line1.end >= line2.end;
}

export function objectsShaker<T>(target: Nullable<T>[], isEqual: (o1: T, o2: T) => boolean) {
    for (let i = 0; i < target.length; i++) {
        let cur = i;
        if (target[i]) {
            for (let j = i + 1; j < target.length; j++) {
                if (target[cur] && target[j] && isEqual(target[cur]!, target[j]!)) {
                    target[cur] = null;
                    cur = j;
                }
            }
        }
    }
    return target.filter((o) => o !== null) as T[];
};

export function mergeSetFilterCriteria(mutations: IMutationInfo[]) {
    return objectsShaker(mutations, (o1, o2) =>
        o1.id === SetSheetsFilterCriteriaMutation.id && o2.id === SetSheetsFilterCriteriaMutation.id
    && (o1.params as ISetSheetsFilterCriteriaMutationParams).unitId === (o2.params as ISetSheetsFilterCriteriaMutationParams).unitId
    && (o1.params as ISetSheetsFilterCriteriaMutationParams).subUnitId === (o2.params as ISetSheetsFilterCriteriaMutationParams).subUnitId
    && (o1.params as ISetSheetsFilterCriteriaMutationParams).col === (o2.params as ISetSheetsFilterCriteriaMutationParams).col);
}
