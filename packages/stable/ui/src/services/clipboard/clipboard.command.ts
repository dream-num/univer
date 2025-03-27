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

import type { IMultiCommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

const CopyCommandName = 'univer.command.copy';
export const CopyCommand: IMultiCommand = {
    id: CopyCommandName,
    name: CopyCommandName,
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    preconditions: () => false,
    handler: () => true,
};

const CutCommandName = 'univer.command.cut';
export const CutCommand: IMultiCommand = {
    id: CutCommandName,
    name: CutCommandName,
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    preconditions: () => false,
    handler: async () => true,
};

const PasteCommandName = 'univer.command.paste';
export const PasteCommand: IMultiCommand = {
    id: PasteCommandName,
    name: PasteCommandName,
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    preconditions: () => false,
    handler: () => true,
};

export const SheetPasteShortKeyCommandName = 'sheet.command.paste-by-short-key';
