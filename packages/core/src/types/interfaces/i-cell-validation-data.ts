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

import type { DataValidationStatus } from '../enum/data-validation-status';
import type { Nullable } from '../../shared';
import type { ICellCustomRender } from './i-cell-custom-render';
import type { IDataValidationRule } from '.';

export interface ICellValidationData {
    ruleId: string;
    validStatus: DataValidationStatus;
    rule: IDataValidationRule;
    skipDefaultFontRender?: boolean;
}
