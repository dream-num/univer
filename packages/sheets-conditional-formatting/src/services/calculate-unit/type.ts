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

import type { IAccessor } from '@wendellhu/redi';
import type { ObjectMatrix, Workbook, Worksheet } from '@univerjs/core';
import type { CFRuleType } from '../../base/const';
import type { IConditionFormattingRule } from '../../models/type';

export interface IContext {
    accessor: IAccessor;
    unitId: string;
    subUnitId: string;
    workbook: Workbook;
    worksheet: Worksheet;
};
export interface ICalculateUnit<R = any> {
    type: CFRuleType;
    handle: (rule: IConditionFormattingRule, context: IContext) => Promise<ObjectMatrix<R>>;
}

export const EMPTY_STYLE = {} as unknown;
Object.freeze(EMPTY_STYLE);
