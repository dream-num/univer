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

import type { Workbook } from '@univerjs/core';
import { IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { ThreadCommentTree } from '@univerjs/thread-comment-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';

export const SheetsThreadCommentCell = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sheetsThreadCommentPopupService = useDependency(SheetsThreadCommentPopupService);
    const activePopup = useObservable(sheetsThreadCommentPopupService.activePopup$);
    const sheetThreadCommentModel = useDependency(SheetsThreadCommentModel);
    useObservable(sheetThreadCommentModel.commentUpdate$);
    if (!activePopup) {
        return null;
    }
    const { row, col, unitId, subUnitId, trigger } = activePopup;
    const rootId = sheetThreadCommentModel.getByLocation(unitId, subUnitId, row, col);
    const ref = `${Tools.chatAtABC(col)}${row + 1}`;
    const onClose = () => {
        sheetsThreadCommentPopupService.hidePopup();
    };

    const getSubUnitName = (id: string) => {
        return univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId(id)?.getName() ?? '';
    };

    return (
        <ThreadCommentTree
            onClick={() => {
                sheetsThreadCommentPopupService.persistPopup();
            }}
            prefix="cell"
            id={rootId}
            unitId={unitId}
            subUnitId={subUnitId}
            type={UniverInstanceType.UNIVER_SHEET}
            refStr={ref}
            onClose={onClose}
            getSubUnitName={getSubUnitName}
            autoFocus={trigger === 'context-menu'}
        />
    );
};
