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
import type { LocaleKey } from '../locale/types';
import type { ThreadCommentPanelSection } from './thread-comment-panel/util';
import type { IThreadCommentTreeProps } from './ThreadCommentTree';
import { ICommandService, LocaleService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { ActionRow, Button, Select } from '@univerjs/design';
import { IncreaseIcon } from '@univerjs/icons';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SetActiveCommentOperation } from '../commands/operations/comment.operations';
import { ThreadCommentPanelService } from '../services/thread-comment-panel.service';
import { getThreadCommentPanelItemKey, isSameThreadCommentTarget, shouldClearThreadCommentTarget } from './thread-comment-panel/util';
import { ThreadCommentTree, ThreadCommentTreeLocation } from './ThreadCommentTree';

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
    onAfterDeleteComment?: IThreadCommentTreeProps['onAfterDeleteComment'];
    showComments?: string[];
    formatRef?: (comment: IThreadComment) => string;
    onTempCommentClose?: () => void;
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
        onAfterDeleteComment,
        showComments,
        formatRef,
        onTempCommentClose,
    } = props;
    const [unit, setUnit] = useState('all');
    const [status, setStatus] = useState('all');
    const localeService = useDependency(LocaleService);
    const userService = useDependency(UserManagerService);
    const threadCommentModel = useDependency(ThreadCommentModel);
    const panelService = useDependency(ThreadCommentPanelService);
    const activeCommentId = useObservable(panelService.activeCommentId$);
    useObservable(threadCommentModel.commentUpdate$);
    const unitComments = threadCommentModel.getUnit(unitId);
    const scopedTempComment = tempComment?.unitId === unitId ? tempComment : null;
    const activeExists = activeCommentId
        ? Boolean(
            threadCommentModel.getComment(activeCommentId.unitId, activeCommentId.subUnitId, activeCommentId.commentId) ||
            (scopedTempComment && isSameThreadCommentTarget(activeCommentId, scopedTempComment))
        )
        : false;
    const shouldClearActiveTarget = shouldClearThreadCommentTarget(activeCommentId, unitId, activeExists);
    const commandService = useDependency(ICommandService);
    const subUnitId = useObservable(subUnitId$);
    const shouldScrollRef = useRef(true);
    const location = ThreadCommentTreeLocation.PANEL;
    const currentUser = useObservable(userService.currentUser$);
    const comments = useMemo(() => {
        const allComments = unit === 'all' && type !== UniverInstanceType.UNIVER_SLIDE
            ? unitComments
            : unitComments.filter((i) => i.subUnitId === subUnitId);

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
    }, [showComments, unit, unitComments, sortComments, subUnitId, type]);

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

    const renderComments = scopedTempComment
        ? [scopedTempComment, ...statuedComments]
        : statuedComments;

    const unSolvedComments = renderComments.filter((comment) => !comment.resolved);
    const solvedComments = renderComments.filter((comment) => comment.resolved);

    const isFiltering = status !== 'all' || unit !== 'all';

    const onReset = () => {
        setStatus('all');
        setUnit('all');
    };

    useEffect(() => {
        if (shouldClearActiveTarget) {
            panelService.setActiveComment(undefined);
        }
    }, [panelService, shouldClearActiveTarget]);

    useEffect(() => {
        if (tempComment && (tempComment.unitId !== unitId || (subUnitId && tempComment.subUnitId !== subUnitId))) {
            onTempCommentClose?.();
        }
    }, [onTempCommentClose, subUnitId, tempComment, unitId]);

    useEffect(() => {
        if (!activeCommentId) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            const activeComment = panelService.activeCommentId;
            const target = event.target;
            if (event.button !== 0 || !activeComment || !(target instanceof Element)) {
                return;
            }

            const activeElement = document.getElementById(
                `${location}-${activeComment.unitId}-${activeComment.subUnitId}-${activeComment.commentId}`
            );
            if (
                activeElement?.contains(target) ||
                target.closest('button, input, textarea, select, a, [contenteditable="true"], [role="menu"], [role="menuitem"], [role="option"], [role="listbox"], [role="combobox"], [role="separator"]')
            ) {
                return;
            }

            commandService.executeCommand(SetActiveCommentOperation.id);
            if (scopedTempComment && isSameThreadCommentTarget(activeComment, scopedTempComment)) {
                onTempCommentClose?.();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [activeCommentId, commandService, location, onTempCommentClose, panelService, scopedTempComment]);

    useEffect(() => {
        if (!activeCommentId) {
            return;
        }
        if (!shouldScrollRef.current) {
            shouldScrollRef.current = true;
            return;
        }
        const { unitId, subUnitId, commentId } = activeCommentId;
        const id = `${location}-${unitId}-${subUnitId}-${commentId}`;
        document.getElementById(id)?.scrollIntoView({ block: 'center' });
    }, [activeCommentId, location]);

    const renderComment = (section: ThreadCommentPanelSection) => (comment: IThreadComment, index: number) => (
        <ThreadCommentTree
            full
            location={location}
            getSubUnitName={getSubUnitName}
            key={getThreadCommentPanelItemKey(comment, index, section)}
            id={comment.id}
            unitId={comment.unitId}
            subUnitId={comment.subUnitId}
            refStr={comment.ref}
            displayRef={formatRef?.(comment)}
            type={type}
            showEdit={!comment.id || isSameThreadCommentTarget(activeCommentId, comment)}
            showHighlight={isSameThreadCommentTarget(activeCommentId, comment)}
            onClick={() => {
                shouldScrollRef.current = false;
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
            onMouseEnter={() => {
                panelService.setHoveredComment({
                    unitId: comment.unitId,
                    subUnitId: comment.subUnitId,
                    commentId: comment.id,
                    trigger: 'panel-hover',
                });
                onItemEnter?.(comment);
            }}
            onMouseLeave={() => {
                if (isSameThreadCommentTarget(panelService.hoveredCommentId, comment)) {
                    panelService.setHoveredComment(undefined);
                }
                onItemLeave?.(comment);
            }}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onAfterDeleteComment={onAfterDeleteComment}
            onResolve={(resolved: boolean) => onResolve?.(comment.id, resolved)}
            onClose={!comment.id ? onTempCommentClose : undefined}
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
                                    label: localeService.t<LocaleKey>('thread-comment-ui.filter.sheet.current'),
                                },
                                {
                                    value: 'all',
                                    label: localeService.t<LocaleKey>('thread-comment-ui.filter.sheet.all'),
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
                            label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.all'),
                        },
                        {
                            value: 'resolved',
                            label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.resolved'),
                        },
                        {
                            value: 'unsolved',
                            label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.unsolved'),
                        },
                        {
                            value: 'concern_me',
                            label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.concernMe'),
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
                          dark:!univer-text-gray-200
                        `}
                    >
                        {localeService.t<LocaleKey>('thread-comment-ui.panel.empty')}
                        {isFiltering
                            ? (
                                <ActionRow className="univer-mt-2 univer-flex univer-flex-row">
                                    <Button onClick={onReset}>
                                        {localeService.t<LocaleKey>('thread-comment-ui.panel.reset')}
                                    </Button>
                                </ActionRow>
                            )
                            : !disableAdd
                                ? (
                                    <ActionRow
                                        className="univer-mt-2 univer-flex univer-flex-row"
                                    >
                                        <Button onClick={onAdd}>
                                            <IncreaseIcon className="univer-mr-1.5" />
                                            {localeService.t<LocaleKey>('thread-comment-ui.panel.addComment')}
                                        </Button>
                                    </ActionRow>
                                )
                                : null}
                    </div>
                )
                : (
                    <div className="univer-mt-3 univer-flex univer-flex-col univer-gap-3">
                        {unSolvedComments.map(renderComment('unsolved'))}
                        {solvedComments.length > 0 && (
                            <div className="univer-text-xs">
                                {localeService.t<LocaleKey>('thread-comment-ui.panel.solved')}
                            </div>
                        )}
                        {solvedComments.map(renderComment('solved'))}
                    </div>
                )}
        </div>
    );
};
