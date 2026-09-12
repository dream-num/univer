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
import { TableColumnFilterTypeEnum, TableConditionTypeEnum, TableDateCompareTypeEnum, TableNumberCompareTypeEnum, TableStringCompareTypeEnum } from '@univerjs/sheets-table';

/**
 * @ignore
 */
export interface IFSheetsTableEnumMixin {
    /** Filter kinds available for table columns. */
    TableColumnFilterTypeEnum: typeof TableColumnFilterTypeEnum;
    /** Value types used by table condition filters. */
    TableConditionTypeEnum: typeof TableConditionTypeEnum;
    /** Comparison operators for numeric table filters. */
    TableNumberCompareTypeEnum: typeof TableNumberCompareTypeEnum;
    /** Comparison operators for text table filters. */
    TableStringCompareTypeEnum: typeof TableStringCompareTypeEnum;
    /** Comparison operators for date table filters. */
    TableDateCompareTypeEnum: typeof TableDateCompareTypeEnum;
}

export class FSheetsTableEnumMixin extends FEnum implements IFSheetsTableEnumMixin {
    override get TableColumnFilterTypeEnum(): typeof TableColumnFilterTypeEnum {
        return TableColumnFilterTypeEnum;
    };

    override get TableConditionTypeEnum(): typeof TableConditionTypeEnum {
        return TableConditionTypeEnum;
    };

    override get TableNumberCompareTypeEnum(): typeof TableNumberCompareTypeEnum {
        return TableNumberCompareTypeEnum;
    }

    override get TableStringCompareTypeEnum(): typeof TableStringCompareTypeEnum {
        return TableStringCompareTypeEnum;
    }

    override get TableDateCompareTypeEnum(): typeof TableDateCompareTypeEnum {
        return TableDateCompareTypeEnum;
    }
}

FEnum.extend(FSheetsTableEnumMixin);
declare module '@univerjs/core/facade' {
    interface FEnum extends IFSheetsTableEnumMixin { }
}
