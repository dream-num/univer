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

import type { Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { ThreadCommentPanel } from '@univerjs/thread-comment-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import type { IThreadComment } from '@univerjs/thread-comment';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';

export const SheetsThreadCommentPanel = () => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sheetsThreadCommentPopupService = useDependency(SheetsThreadCommentPopupService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return null;
    }
    const unitId = workbook.getUnitId();
    const commandService = useDependency(ICommandService);
    const subUnitId$ = useMemo(() => workbook.activeSheet$.pipe(map((i) => i?.getSheetId())), [workbook.activeSheet$]);

    const sortComments = useCallback((comments: IThreadComment[]) => {
        const worksheets = workbook.getSheets();
        const sheetIndex: Record<string, number> = {};
        worksheets.forEach((sheet, i) => {
            sheetIndex[sheet.getSheetId()] = i;
        });

        return comments.map((comment) => {
            const ref = singleReferenceToGrid(comment.ref);
            const p = [sheetIndex[comment.subUnitId] ?? 0, ref.row, ref.column];
            return { ...comment, p };
        }).sort((pre, aft) => {
            if (pre.p[0] === aft.p[0]) {
                if (pre.p[1] === aft.p[1]) {
                    return pre.p[2] - aft.p[2];
                }
                return pre.p[1] - aft.p[1];
            }

            return pre.p[0] - aft.p[0];
        });
    }, [workbook]);

    const getSubUnitName = (id: string) => {
        return workbook.getSheetBySheetId(id)?.getName() ?? '';
    };

    const handleAdd = () => {
        commandService.executeCommand(ShowAddSheetCommentModalOperation.id);
    };

    const handleResolve = () => {
        sheetsThreadCommentPopupService.hidePopup();
    };

    return (
        <ThreadCommentPanel
            unitId={unitId}
            subUnitId$={subUnitId$}
            type={UniverInstanceType.UNIVER_SHEET}
            onAdd={handleAdd}
            getSubUnitName={getSubUnitName}
            onResolve={handleResolve}
            sortComments={sortComments}
        />
    );
};
