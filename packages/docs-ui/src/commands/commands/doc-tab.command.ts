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

import { CommandType, type ICommand, ICommandService } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import { isInSameTableCell } from '@univerjs/engine-render';
import { DocTableShiftTabCommand, DocTableTabCommand } from './table/doc-table-tab.command';

export interface IDocTabCommandParams { }

export const DocTabCommand: ICommand<IDocTabCommandParams> = {
    id: 'doc.tab.tab-in-doc',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const commandService = accessor.get(ICommandService);

        const activeTextRange = textSelectionManagerService.getActiveTextRangeWithStyle();

        if (activeTextRange == null) {
            return false;
        }

        const { startNodePosition, endNodePosition } = activeTextRange;

        if (startNodePosition && endNodePosition && isInSameTableCell(startNodePosition, endNodePosition)) {
            return commandService.executeCommand(DocTableTabCommand.id);
        }

        return false;
    },
};

export interface IDocShiftTabCommandParams { }

export const DocShiftTabCommand: ICommand<IDocShiftTabCommandParams> = {
    id: 'doc.tab.shift-tab-in-doc',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        const commandService = accessor.get(ICommandService);

        const activeTextRange = textSelectionManagerService.getActiveTextRangeWithStyle();

        if (activeTextRange == null) {
            return false;
        }

        const { startNodePosition, endNodePosition } = activeTextRange;

        if (startNodePosition && endNodePosition && isInSameTableCell(startNodePosition, endNodePosition)) {
            return commandService.executeCommand(DocTableShiftTabCommand.id);
        }

        return false;
    },
};
