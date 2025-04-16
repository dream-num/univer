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

import type { IOperation } from '@univerjs/core';
import type { ITextRangeWithStyle, ITextSelectionStyle } from '@univerjs/engine-render';
import { CommandType } from '@univerjs/core';

export interface ISetTextSelectionsOperationParams {
    unitId: string;
    subUnitId: string;
    segmentId: string;
    // Whether it occurs at the same time as text editing.
    isEditing: boolean;
    style: ITextSelectionStyle;
    ranges: ITextRangeWithStyle[];
}

export const SetTextSelectionsOperation: IOperation<ISetTextSelectionsOperationParams> = {
    id: 'doc.operation.set-selections',

    type: CommandType.OPERATION,

    handler: () => {
        // for menu highlight use and share cursor.
        return true;
    },
};
