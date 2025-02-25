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

import type { IDataValidationRule, IDataValidationRuleBase, IDataValidationRuleOptions } from '@univerjs/core';
import type { UpdateRuleType } from '../enum/update-rule-type';

export interface IUpdateRuleRangePayload {
    type: UpdateRuleType.RANGE;
    payload: any[];
}

export interface IUpdateRuleSettingPayload {
    type: UpdateRuleType.SETTING;
    payload: IDataValidationRuleBase;
}

export interface IUpdateRuleOptionsPayload {
    type: UpdateRuleType.OPTIONS;
    payload: Partial<IDataValidationRuleOptions>;
}

export interface IUpdateRuleAllPayload {
    type: UpdateRuleType.ALL;
    payload: Omit<IDataValidationRule, 'uid'>;
}

export type IUpdateRulePayload =
    IUpdateRuleRangePayload
    | IUpdateRuleSettingPayload
    | IUpdateRuleOptionsPayload
    | IUpdateRuleAllPayload;
