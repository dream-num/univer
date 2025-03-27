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
import type { IThreadComment } from '@univerjs/thread-comment';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { IMarkSelectionService } from '@univerjs/sheets-ui';
import { ThreadCommentPanel, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { map } from 'rxjs';
import { ShowAddSheetCommentModalOperation } from '../../commands/operations/comment.operation';
import { SheetsThreadCommentPopupService } from '../../services/sheets-thread-comment-popup.service';

export const SheetsThreadCommentPanel = () => {
    const markSelectionService = useDependency(IMarkSelectionService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const sheetsThreadCommentPopupService = useDependency(SheetsThreadCommentPopupService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();
    const commandService = useDependency(ICommandService);
    const subUnitId$ = useMemo(() => workbook.activeSheet$.pipe(map((i) => i?.getSheetId())), [workbook.activeSheet$]);
    const subUnitId = useObservable(subUnitId$, workbook.getActiveSheet()?.getSheetId());
    const hoverShapeId = useRef<string | null>(null);
    const panelService = useDependency(ThreadCommentPanelService);
    const activeCommentId = useObservable(panelService.activeCommentId$);
    const panelVisible = useObservable(panelService.panelVisible$, panelService.panelVisible);
    const sortComments = useCallback((comments: IThreadComment[]) => {
        const worksheets = workbook.getSheets();
        const sheetIndex: Record<string, number> = {};
        worksheets.forEach((sheet, i) => {
            sheetIndex[sheet.getSheetId()] = i;
        });

        const sort = (comments: IThreadComment[]) => {
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
        };

        return [
            ...sort(comments.filter((comment) => !comment.resolved)),
            ...sort(comments.filter((comment) => comment.resolved)),
        ];
    }, [workbook]);

    const showShape = useCallback((comment: IThreadComment) => {
        if (comment.unitId === unitId && comment.subUnitId === subUnitId && !comment.resolved) {
            const { row, column } = singleReferenceToGrid(comment.ref);
            const worksheet = workbook.getSheetBySheetId(comment.subUnitId);
            const mergeInfo = worksheet?.getMergedCell(row, column) ?? {
                startColumn: column,
                endColumn: column,
                startRow: row,
                endRow: row,
            };
            if (!Number.isNaN(row) && !Number.isNaN(column)) {
                return markSelectionService.addShape({
                    range: mergeInfo,
                    style: {
                        // hasAutoFill: false,
                        fill: 'rgb(255, 189, 55, 0.35)',
                        strokeWidth: 1,
                        stroke: '#FFBD37',
                        widgets: {},
                    },
                    primary: null,
                });
            }
        }
        return null;
    }, [markSelectionService, subUnitId, unitId]);

    const getSubUnitName = (id: string) => {
        return workbook.getSheetBySheetId(id)?.getName() ?? '';
    };

    const handleAdd = () => {
        commandService.executeCommand(ShowAddSheetCommentModalOperation.id);
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

        if (hoverShapeId.current) {
            markSelectionService.removeShape(hoverShapeId.current);
            hoverShapeId.current = null;
        }

        hoverShapeId.current = showShape(comment);
    };

    const handleLeave = () => {
        if (hoverShapeId.current) {
            markSelectionService.removeShape(hoverShapeId.current);
            hoverShapeId.current = null;
        }
    };

    const handleResolve = (id: string, resolved: boolean) => {
        if (resolved) {
            sheetsThreadCommentPopupService.hidePopup();
        }
    };

    useEffect(() => {
        if (!panelVisible && hoverShapeId.current) {
            markSelectionService.removeShape(hoverShapeId.current);
        }
    }, [markSelectionService, panelVisible]);

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
            onDeleteComment={() => {
                handleLeave();
                return true;
            }}
        />
    );
};
