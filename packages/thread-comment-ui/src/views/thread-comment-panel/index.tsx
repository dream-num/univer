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

import type { Nullable } from '@univerjs/core';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { Observable } from 'rxjs';
import type { IThreadCommentTreeProps } from '../thread-comment-tree';
import { ICommandService, LocaleService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { Button, Select } from '@univerjs/design';
import { IncreaseSingle } from '@univerjs/icons';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import { ThreadCommentPanelService } from '../../services/thread-comment-panel.service';
import { ThreadCommentTree } from '../thread-comment-tree';

export interface IThreadCommentPanelProps {
    unitId: string;
    subUnitId$: Observable<string | undefined>;
    type: UniverInstanceType;
    onAdd: () => void;
    getSubUnitName: (subUnitId: string) => string;
    onResolve?: (id: string, resolved: boolean) => void;
    sortComments?: (comments: IThreadComment[]) => IThreadComment[];
    onItemLeave?: (comment: IThreadComment) => void;
    onItemEnter?: (comment: IThreadComment) => void;
    disableAdd?: boolean;
    tempComment?: Nullable<IThreadComment>;
    onAddComment?: IThreadCommentTreeProps['onAddComment'];
    onDeleteComment?: IThreadCommentTreeProps['onDeleteComment'];
    showComments?: string[];
}

interface IThreadCommentWithUsers extends IThreadComment {
    users: Set<string>;
}

export const ThreadCommentPanel = (props: IThreadCommentPanelProps) => {
    const {
        unitId,
        subUnitId$,
        type,
        onAdd,
        getSubUnitName,
        onResolve,
        sortComments,
        onItemLeave,
        onItemEnter,
        disableAdd,
        tempComment,
        onAddComment,
        onDeleteComment,
        showComments,
    } = props;
    const [unit, setUnit] = useState('all');
    const [status, setStatus] = useState('all');
    const localeService = useDependency(LocaleService);
    const userService = useDependency(UserManagerService);
    const threadCommentModel = useDependency(ThreadCommentModel);
    const [unitComments, setUnitComments] = useState(() => threadCommentModel.getUnit(unitId));
    const panelService = useDependency(ThreadCommentPanelService);
    const activeCommentId = useObservable(panelService.activeCommentId$);
    const update = useObservable(threadCommentModel.commentUpdate$);
    const commandService = useDependency(ICommandService);
    const subUnitId = useObservable(subUnitId$);
    const shouldScroll = useRef(true);
    const prefix = 'panel';
    const currentUser = useObservable(userService.currentUser$);
    const comments = useMemo(() => {
        const allComments =
            (unit === 'all' ? unitComments : unitComments.filter((i) => i.subUnitId === subUnitId) ?? []);

        const sort = sortComments ?? ((a) => a);
        const res: IThreadCommentWithUsers[] = allComments.map((i) => ({ ...i.root, children: i.children ?? [], users: i.relativeUsers }));

        if (showComments) {
            const map = new Map<string, IThreadCommentWithUsers>();
            res.forEach((comment) => {
                map.set(comment.id, comment);
            });

            return [...showComments, ''].map((id) => map.get(id)).filter(Boolean) as IThreadCommentWithUsers[];
        } else {
            return sort(res) as IThreadCommentWithUsers[];
        }
    }, [showComments, unit, unitComments, sortComments, subUnitId]);

    const commentsSorted = useMemo(() => [
        ...comments.filter((comment) => !comment.resolved),
        ...comments.filter((comment) => comment.resolved),
    ], [comments]);

    const statuedComments = useMemo(() => {
        if (status === 'resolved') {
            return commentsSorted.filter((comment) => comment.resolved);
        }

        if (status === 'unsolved') {
            return commentsSorted.filter((comment) => !comment.resolved);
        }
        if (status === 'concern_me') {
            if (!currentUser?.userID) {
                return commentsSorted;
            }

            return commentsSorted.filter((comment) => comment?.users.has(currentUser.userID));
        }

        return commentsSorted;
    }, [commentsSorted, currentUser?.userID, status]);

    const renderComments = tempComment
        ? [tempComment, ...statuedComments]
        : statuedComments;

    const unSolvedComments = renderComments.filter((comment) => !comment.resolved);
    const solvedComments = renderComments.filter((comment) => comment.resolved);

    const isFiltering = status !== 'all' || unit !== 'all';

    const onReset = () => {
        setStatus('all');
        setUnit('all');
    };

    useEffect(() => {
        if (unitId) {
            setUnitComments(
                threadCommentModel.getUnit(unitId)
            );
        }
    }, [unitId, threadCommentModel, update]);

    useEffect(() => {
        if (!activeCommentId) {
            return;
        }
        if (!shouldScroll.current) {
            shouldScroll.current = true;
            return;
        }
        const { unitId, subUnitId, commentId } = activeCommentId;
        const id = `${prefix}-${unitId}-${subUnitId}-${commentId}`;
        document.getElementById(id)?.scrollIntoView({ block: 'center' });
    }, [activeCommentId]);

    const renderComment = (comment: IThreadComment) => (
        <ThreadCommentTree
            full
            prefix={prefix}
            getSubUnitName={getSubUnitName}
            key={comment.id}
            id={comment.id}
            unitId={comment.unitId}
            subUnitId={comment.subUnitId}
            refStr={comment.ref}
            type={type}
            showEdit={activeCommentId?.commentId === comment.id}
            showHighlight={activeCommentId?.commentId === comment.id}
            onClick={() => {
                shouldScroll.current = false;
                if (!comment.resolved) {
                    commandService.executeCommand(
                        SetActiveCommentOperation.id,
                        {
                            unitId: comment.unitId,
                            subUnitId: comment.subUnitId,
                            commentId: comment.id,
                            temp: false,
                        }
                    );
                } else {
                    commandService.executeCommand(SetActiveCommentOperation.id);
                }
            }}
            onMouseEnter={() => onItemEnter?.(comment)}
            onMouseLeave={() => onItemLeave?.(comment)}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onResolve={(resolved: boolean) => onResolve?.(comment.id, resolved)}
        />
    );

    return (
        <div className="univer-flex univer-min-h-full univer-flex-col univer-pb-3">
            <div className="univer-mt-3 univer-flex univer-flex-row univer-justify-between">
                {type === UniverInstanceType.UNIVER_SHEET
                    ? (
                        <Select
                            borderless
                            value={unit}
                            options={[
                                {
                                    value: 'current',
                                    label: localeService.t('threadCommentUI.filter.sheet.current'),
                                },
                                {
                                    value: 'all',
                                    label: localeService.t('threadCommentUI.filter.sheet.all'),
                                },
                            ]}
                            onChange={setUnit}
                        />
                    )
                    : null}
                <Select
                    borderless
                    value={status}
                    options={[
                        {
                            value: 'all',
                            label: localeService.t('threadCommentUI.filter.status.all'),
                        },
                        {
                            value: 'resolved',
                            label: localeService.t('threadCommentUI.filter.status.resolved'),
                        },
                        {
                            value: 'unsolved',
                            label: localeService.t('threadCommentUI.filter.status.unsolved'),
                        },
                        {
                            value: 'concern_me',
                            label: localeService.t('threadCommentUI.filter.status.concernMe'),
                        },
                    ]}
                    onChange={setStatus}
                />
            </div>
            {renderComments.length === 0
                ? (
                    <div
                        className={`
                          univer-flex univer-flex-1 univer-flex-col univer-items-center univer-justify-center
                          univer-text-sm univer-text-gray-600
                          dark:univer-text-gray-200
                        `}
                    >
                        {localeService.t('threadCommentUI.panel.empty')}
                        {isFiltering
                            ? (
                                <div className="univer-mt-2 univer-flex univer-flex-row">
                                    <Button onClick={onReset}>
                                        {localeService.t('threadCommentUI.panel.reset')}
                                    </Button>
                                </div>
                            )
                            : !disableAdd
                                ? (
                                    <div className="univer-mt-2 univer-flex univer-flex-row">
                                        <Button onClick={onAdd}>
                                            <IncreaseSingle className="univer-mr-1.5" />
                                            {localeService.t('threadCommentUI.panel.add')}
                                        </Button>
                                    </div>
                                )
                                : null}
                    </div>
                )
                : (
                    <div className="univer-mt-3 univer-flex univer-flex-col univer-gap-3">
                        {unSolvedComments.map(renderComment)}
                        {solvedComments.length > 0 && (
                            <div className="univer-text-xs">
                                {localeService.t('threadCommentUI.panel.solved')}
                            </div>
                        )}
                        {solvedComments.map(renderComment)}
                    </div>
                )}
        </div>
    );
};
