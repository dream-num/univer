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

import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import type { ICommand, Nullable } from '@univerjs/core';
import { getCommandSkeleton } from '../../util';
import { DocTableInsertRowCommand } from './doc-table-insert.command';
import { CellPosition, getCellOffsets, INSERT_ROW_POSITION } from './table';
import type { IOffsets } from './table';

export interface IDocTableTabCommandParams {
    shift: boolean;
}

export const DocTableTabCommand: ICommand<IDocTableTabCommandParams> = {
    id: 'doc.table.tab-in-table',
    type: CommandType.COMMAND,
    handler: async (accessor, params: IDocTableTabCommandParams) => {
        const { shift } = params;
        const textSelectionManager = accessor.get(DocSelectionManagerService);
        const activeTextRange = textSelectionManager.getActiveTextRange();
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (!docDataModel) {
            return false;
        }

        const unitId = docDataModel.getUnitId();
        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);
        const skeleton = docSkeletonManagerService?.getSkeleton();
        const viewModel = skeleton?.getViewModel().getSelfOrHeaderFooterViewModel(activeTextRange?.segmentId);

        if (viewModel == null) {
            return false;
        }

        if (activeTextRange == null) {
            return false;
        }

        let offsets: Nullable<IOffsets> = null;

        if (shift) {
            offsets = getCellOffsets(viewModel, activeTextRange, CellPosition.PREV);
        } else {
            offsets = getCellOffsets(viewModel, activeTextRange, CellPosition.NEXT);
        }

        if (offsets) {
            const { startOffset, endOffset } = offsets;

            const textRanges = [{
                startOffset,
                endOffset,
            }];

            textSelectionManager.replaceTextRanges(textRanges);

            return true;
        }

        if (shift === false) {
            const result = await commandService.executeCommand(DocTableInsertRowCommand.id, {
                position: INSERT_ROW_POSITION.BELLOW,
            });

            return result;
        }

        return true;
    },
};
