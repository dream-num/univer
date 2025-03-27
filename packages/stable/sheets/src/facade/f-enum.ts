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
import { SheetSkeletonChangeType, SheetValueChangeType, SplitDelimiterEnum } from '@univerjs/sheets';

/**
 * @ignore
 */
export interface IFSheetsEnum {
    /**
     * Sheet value change command types. These commands affect the content or style of cells.
     * Includes operations like setting cell values, moving ranges, merging cells, and applying styles.
     */
    SheetValueChangeType: typeof SheetValueChangeType;

    /**
     * Sheet skeleton change command types. These commands affect the structure of the worksheet.
     * Includes operations like changing row/column dimensions, visibility, and grid properties.
     */
    SheetSkeletonChangeType: typeof SheetSkeletonChangeType;

    /**
     * Split delimiter types.
     */
    SplitDelimiterType: typeof SplitDelimiterEnum;
}

export class FSheetsEnum implements IFSheetsEnum {
    get SheetValueChangeType(): typeof SheetValueChangeType {
        return SheetValueChangeType;
    }

    get SheetSkeletonChangeType(): typeof SheetSkeletonChangeType {
        return SheetSkeletonChangeType;
    }

    get SplitDelimiterType(): typeof SplitDelimiterEnum {
        return SplitDelimiterEnum;
    }
}

FEnum.extend(FSheetsEnum);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    export interface FEnum extends IFSheetsEnum {
    }
}
