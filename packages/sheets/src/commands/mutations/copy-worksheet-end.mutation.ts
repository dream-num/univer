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

import type { IMutation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export interface ICopyWorksheetEndMutationParams {
    unitId: string;
    subUnitId: string;
}

/**
 * This mutation is used to mark the end of a copy worksheet operation that was split into chunks.
 * When this mutation is applied on the server, it should trigger a snapshot save.
 */
export const CopyWorksheetEndMutation: IMutation<ICopyWorksheetEndMutationParams, boolean> = {
    id: 'sheet.mutation.copy-worksheet-end',
    type: CommandType.MUTATION,
    handler: () => {
        // This is a marker mutation, it doesn't need to do anything
        return true;
    },
};
