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
import { ThreadCommentPanel, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { useDependency, useObservable } from '@wendellhu/redi/react-bindings';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { map } from 'rxjs';
import { type IThreadComment, ThreadCommentModel } from '@univerjs/thread-comment';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';

export const SheetsThreadCommentPanel = () => {
    const markSelectionService = useDependency(IMarkSelectionService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const threadCommentModel = useDependency(ThreadCommentModel);
    const sheetsThreadCommentPopupService = useDependency(SheetsThreadCommentPopupService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) {
        return null;
    }
    const unitId = workbook.getUnitId();
    const commandService = useDependency(ICommandService);
    const subUnitId$ = useMemo(() => workbook.activeSheet$.pipe(map((i) => i?.getSheetId())), [workbook.activeSheet$]);
    const subUnitId = useObservable(subUnitId$, workbook.getActiveSheet().getSheetId());
    const activeShapeId = useRef<string | null>();
    const panelService = useDependency(ThreadCommentPanelService);
    const activeCommentId = useObservable(panelService.activeCommentId$);
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

    const showShape = useCallback((comment: IThreadComment) => {
        if (comment.unitId === unitId && comment.subUnitId === subUnitId && !comment.resolved) {
            const { row, column } = singleReferenceToGrid(comment.ref);
            if (!Number.isNaN(row) && !Number.isNaN(column)) {
                return markSelectionService.addShape({
                    range: {
                        startColumn: column,
                        endColumn: column,
                        startRow: row,
                        endRow: row,
                    },
                    style: {
                        hasAutoFill: false,
                        fill: 'rgb(255, 189, 55, 0.35)',
                        strokeWidth: 1,
                        stroke: '#FFBD37',
                        widgets: {},
                    },
                    primary: null,
                });
            }
        }
    }, [markSelectionService, subUnitId, unitId]);

    const getSubUnitName = (id: string) => {
        return workbook.getSheetBySheetId(id)?.getName() ?? '';
    };

    const handleAdd = () => {
        commandService.executeCommand(ShowAddSheetCommentModalOperation.id);
    };

    const handleResolve = () => {
        sheetsThreadCommentPopupService.hidePopup();
    };

    const handleHover = (comment: IThreadComment) => {
        if (
            activeCommentId &&
            activeCommentId.unitId === comment.unitId &&
            activeCommentId.subUnitId === comment.subUnitId &&
            activeCommentId.commentId === comment.id
        ) {
            return;
        }

        if (activeShapeId.current) {
            markSelectionService.removeShape(activeShapeId.current);
            activeShapeId.current = null;
        }

        activeShapeId.current = showShape(comment);
    };

    const handleLeave = () => {
        if (activeShapeId.current) {
            markSelectionService.removeShape(activeShapeId.current);
            activeShapeId.current = null;
        }
    };

    useEffect(() => {
        if (!activeCommentId) {
            return;
        }
        const comment = threadCommentModel.getComment(activeCommentId.unitId, activeCommentId.subUnitId, activeCommentId.commentId);
        if (!comment) {
            return;
        }
        const id = showShape(comment);
        return () => {
            if (id) {
                markSelectionService.removeShape(id);
            }
        };
    }, [showShape, activeCommentId, threadCommentModel, markSelectionService]);

    return (
        <ThreadCommentPanel
            unitId={unitId}
            subUnitId$={subUnitId$}
            type={UniverInstanceType.UNIVER_SHEET}
            onAdd={handleAdd}
            getSubUnitName={getSubUnitName}
            onResolve={handleResolve}
            sortComments={sortComments}
            onItemEnter={handleHover}
            onItemLeave={handleLeave}
        />
    );
};
