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

import { FEnum } from '@univerjs/core/facade';
import { CFNumberOperator, CFTimePeriodOperator } from '@univerjs/sheets-conditional-formatting';

/**
 * @ignore
 */
export interface IFSheetsConditionalFormattingEnum {
    /**
     * Conditional formatting number operator
     */
    ConditionFormatNumberOperatorEnum: typeof CFNumberOperator;

    /**
     * Conditional formatting time period operator
     */
    ConditionFormatTimePeriodOperatorEnum: typeof CFTimePeriodOperator;
}

export class FSheetsConditionalFormattingEnum implements IFSheetsConditionalFormattingEnum {
    get ConditionFormatNumberOperatorEnum(): typeof CFNumberOperator {
        return CFNumberOperator;
    }

    get ConditionFormatTimePeriodOperatorEnum(): typeof CFTimePeriodOperator {
        return CFTimePeriodOperator;
    }
}

FEnum.extend(FSheetsConditionalFormattingEnum);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    export interface FEnum extends IFSheetsConditionalFormattingEnum {
    }
}
