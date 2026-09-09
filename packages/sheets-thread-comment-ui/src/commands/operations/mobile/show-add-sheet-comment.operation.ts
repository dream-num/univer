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
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { ThreadCommentDraftService, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { MobileSheetCommentDraftService } from '../../../services/mobile/mobile-sheet-comment-draft.service';
import { SHOW_ADD_SHEET_COMMENT_OPERATION_ID } from '../../../types/const';
import { openSheetCommentPanel } from '../comment.operation';

export const ShowAddSheetCommentMobileOperation: IOperation = {
    type: CommandType.OPERATION,
    id: SHOW_ADD_SHEET_COMMENT_OPERATION_ID,
    handler(accessor) {
        const activeCell = accessor.get(SheetsSelectionsService).getCurrentLastSelection()?.primary;
        if (!activeCell) {
            return false;
        }

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) {
            return false;
        }

        const { unitId, subUnitId } = target;
        const row = activeCell.startRow;
        const column = activeCell.startColumn;
        const panelService = accessor.get(ThreadCommentPanelService);
        const mobileDraftService = accessor.get(MobileSheetCommentDraftService);
        const rootId = accessor.get(SheetsThreadCommentModel).getByLocation(unitId, subUnitId, row, column);

        accessor.get(ThreadCommentDraftService).cancel();
        if (rootId) {
            mobileDraftService.cancel();
            panelService.setActiveComment({
                unitId,
                subUnitId,
                commentId: rootId,
            });
        } else {
            panelService.setActiveComment(undefined);
            mobileDraftService.place({ unitId, subUnitId, row, column });
        }

        openSheetCommentPanel(accessor.get(ISidebarService), panelService);
        return true;
    },
};
