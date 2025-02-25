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
import { CommandType } from '@univerjs/core';

import type { FormatPainterStatus } from '../../services/format-painter/format-painter.service';
import { IFormatPainterService } from '../../services/format-painter/format-painter.service';

export interface ISetFormatPainterOperationParams {
    status: FormatPainterStatus;
}
export const SetFormatPainterOperation: IOperation<ISetFormatPainterOperationParams> = {
    id: 'sheet.operation.set-format-painter',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const formatPainterService = accessor.get(IFormatPainterService);
        formatPainterService.setStatus(params.status);
        return true;
    },
};
