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

import type { CommandType, type ICommand, IRange } from '@univerjs/core';

export interface InterceptCommunicationCommandParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
}

export const InterceptCommunicationCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.intercept-communication',
    handler: () => true,
};
