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

import type { Direction, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export interface IMoveCursorOperationParams {
    direction: Direction;
}

// TODO@wzhudev: it should be moved to a command then trigger the operation.

/**
 * The operation to move cursor in the current document.
 */
export const MoveCursorOperation: IOperation<IMoveCursorOperationParams> = {
    id: 'doc.operation.move-cursor',

    type: CommandType.OPERATION,

    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return true;
    },
};

/**
 * The operation to move selection in the current document.
 */
export const MoveSelectionOperation: IOperation<IMoveCursorOperationParams> = {
    id: 'doc.operation.move-selection',

    type: CommandType.OPERATION,

    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        return true;
    },
};
