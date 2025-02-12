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

import type { ICommand, Nullable } from '@univerjs/core';
import type { IOffsets } from './table';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { getCommandSkeleton } from '../../util';
import { DocTableInsertRowCommand } from './doc-table-insert.command';
import { CellPosition, getCellOffsets, INSERT_ROW_POSITION } from './table';

export interface IDocTableTabCommandParams {
    shift: boolean;
}

export const DocTableTabCommand: ICommand<IDocTableTabCommandParams> = {

    id: 'doc.table.tab-in-table',

    type: CommandType.COMMAND,

    handler: async (accessor, params: IDocTableTabCommandParams) => {
        const { shift } = params;
        const textSelectionManager = accessor.get(DocSelectionManagerService);
        const docRanges = textSelectionManager.getDocRanges();
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
        if (!docDataModel) {
            return false;
        }

        const activeRange = docRanges.find((range) => range.isActive) ?? docRanges[0];
        const unitId = docDataModel.getUnitId();
        const docSkeletonManagerService = getCommandSkeleton(accessor, unitId);
        const skeleton = docSkeletonManagerService?.getSkeleton();
        const viewModel = skeleton?.getViewModel().getSelfOrHeaderFooterViewModel(activeRange?.segmentId);

        if (viewModel == null) {
            return false;
        }

        if (activeRange == null) {
            return false;
        }

        let offsets: Nullable<IOffsets> = null;

        if (shift) {
            offsets = getCellOffsets(viewModel, activeRange, CellPosition.PREV);
        } else {
            offsets = getCellOffsets(viewModel, activeRange, CellPosition.NEXT);
        }

        if (offsets) {
            const { startOffset, endOffset } = offsets;

            const textRanges = [{
                startOffset,
                endOffset,
            }];

            textSelectionManager.replaceDocRanges(textRanges);

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
