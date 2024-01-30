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

import type { IMultiCommand } from '@univerjs/core';
import { CommandType, EDITOR_ACTIVATED, FOCUSING_DOC } from '@univerjs/core';
import { CopyCommand, CutCommand, PasteCommand } from '@univerjs/ui';

export const DocCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'doc.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: 999,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(EDITOR_ACTIVATED),
    handler: async () => true,
};

export const DocCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'doc.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: 999,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(EDITOR_ACTIVATED),
    handler: async () => true,
};

export const DocPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    name: 'doc.command.paste',
    type: CommandType.COMMAND,
    multi: true,
    priority: 999, // Need to bigger than SheetPasteCommand's priority.
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(EDITOR_ACTIVATED),
    handler: async () => true,
};
