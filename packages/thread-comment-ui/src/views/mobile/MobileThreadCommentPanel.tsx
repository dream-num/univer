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

import type { ISelectProps } from '@univerjs/design';
import type { IThreadComment } from '@univerjs/thread-comment';
import type { LocaleKey } from '../../locale/types';
import type { ThreadCommentPanelSection } from '../thread-comment-panel/util';
import type { IThreadCommentPanelProps } from '../ThreadCommentPanel';
import { ICommandService, LocaleService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { Button, clsx, MobileActionRowGroup, resetButtonClassName } from '@univerjs/design';
import { IncreaseIcon, MoreLeftIcon } from '@univerjs/icons';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import { ThreadCommentPanelService } from '../../services/thread-comment-panel.service';
import { getThreadCommentPanelItemKey, isSameThreadCommentTarget, shouldClearThreadCommentTarget } from '../thread-comment-panel/util';
import { ThreadCommentTreeLocation } from '../ThreadCommentTree';
import { MobileThreadCommentTree } from './MobileThreadCommentTree';

interface IThreadCommentWithUsers extends IThreadComment {
    users: Set<string>;
}

function MobileCommentFilter({ value, options = [], onChange }: ISelectProps) {
    return (
        <div
            className="
              univer-flex univer-gap-1 univer-overflow-x-auto univer-rounded-xl univer-bg-gray-100 univer-p-1
              dark:!univer-bg-gray-800
            "
        >
            {options.flatMap((option) => option.options ?? [option]).map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={option.value === value}
                    className={clsx(resetButtonClassName, `
                      univer-h-10 univer-shrink-0 univer-rounded-lg univer-px-3 univer-text-sm univer-text-gray-700
                      active:univer-scale-95
                      dark:!univer-text-gray-200
                    `, option.value === value && `
                      univer-bg-gray-0 univer-font-medium univer-text-primary-600 univer-shadow-sm
                      dark:!univer-bg-gray-700 dark:!univer-text-primary-300
                    `)}
                    onClick={() => option.value != null && onChange?.(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

function MobileCommentHeader({ comment: activeComment, displayRef }: { comment: IThreadComment; displayRef?: string }) {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    return (
        <div
            className="
              univer-mt-2 univer-flex univer-min-h-12 univer-items-center univer-gap-2 univer-border-0 univer-border-b
              univer-border-solid univer-border-gray-200 univer-pb-2
              dark:!univer-border-gray-700
            "
        >
            <button
                type="button"
                aria-label={localeService.t<LocaleKey>('thread-comment-ui.mobile.back')}
                className={`
                  ${resetButtonClassName}
                  univer-flex univer-size-12 univer-shrink-0 univer-items-center univer-justify-center univer-rounded-xl
                  univer-text-2xl univer-text-gray-700
                  active:univer-bg-gray-100
                  dark:!univer-text-gray-200
                  dark:active:!univer-bg-gray-700
                `}
                onClick={() => commandService.executeCommand(SetActiveCommentOperation.id)}
            >
                <MoreLeftIcon />
            </button>
            <div className="univer-min-w-0 univer-flex-1">
                <div
                    className="
                      univer-truncate univer-text-base univer-font-semibold univer-text-gray-900
                      dark:!univer-text-gray-0
                    "
                >
                    {localeService.t<LocaleKey>('thread-comment-ui.panel.title')}
                </div>
                {activeComment.ref && (
                    <div
                        className="
                          univer-truncate univer-text-xs univer-text-gray-500
                          dark:!univer-text-gray-400
                        "
                    >
                        {displayRef ?? activeComment.ref}
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileAddComment({ onAdd }: { onAdd: () => void }) {
    const localeService = useDependency(LocaleService);
    return (
        <MobileActionRowGroup className="univer-mt-3">
            <Button className="univer-w-full" onClick={onAdd}>
                <IncreaseIcon className="univer-mr-1.5" />
                {localeService.t<LocaleKey>('thread-comment-ui.panel.addComment')}
            </Button>
        </MobileActionRowGroup>
    );
}

export function MobileThreadCommentPanel(props: IThreadCommentPanelProps) {
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
        autoFocusActiveComment = false,
    } = props;
    const [unit, setUnit] = useState('all');
    const [status, setStatus] = useState('all');
    const localeService = useDependency(LocaleService);
    const userService = useDependency(UserManagerService);
    const threadCommentModel = useDependency(ThreadCommentModel);
    const panelService = useDependency(ThreadCommentPanelService);
    const commandService = useDependency(ICommandService);
    const activeCommentId = useObservable(panelService.activeCommentId$);
    useObservable(threadCommentModel.commentUpdate$);
    const subUnitId = useObservable(subUnitId$);
    const currentUser = useObservable(userService.currentUser$);
    const shouldScrollRef = useRef(true);
    const location = ThreadCommentTreeLocation.PANEL;
    const unitComments = threadCommentModel.getUnit(unitId);
    const scopedTempComment = tempComment?.unitId === unitId ? tempComment : null;
    const activeExists = activeCommentId
        ? Boolean(
            threadCommentModel.getComment(activeCommentId.unitId, activeCommentId.subUnitId, activeCommentId.commentId) ||
            (scopedTempComment && isSameThreadCommentTarget(activeCommentId, scopedTempComment))
        )
        : false;
    const shouldClearActiveTarget = shouldClearThreadCommentTarget(activeCommentId, unitId, activeExists);
    const comments = useMemo(() => {
        const allComments = unit === 'all' && type !== UniverInstanceType.UNIVER_SLIDE
            ? unitComments
            : unitComments.filter((comment) => comment.subUnitId === subUnitId);
        const sortedComments = sortComments ?? ((commentList) => commentList);
        const result: IThreadCommentWithUsers[] = allComments.map((comment) => ({
            ...comment.root,
            children: comment.children ?? [],
            users: comment.relativeUsers,
        }));

        if (!showComments) {
            return sortedComments(result) as IThreadCommentWithUsers[];
        }

        const commentMap = new Map(result.map((comment) => [comment.id, comment]));
        return [...showComments, ''].map((id) => commentMap.get(id)).filter(Boolean) as IThreadCommentWithUsers[];
    }, [showComments, sortComments, subUnitId, type, unit, unitComments]);
    const commentsSorted = useMemo(() => [
        ...comments.filter((comment) => !comment.resolved),
        ...comments.filter((comment) => comment.resolved),
    ], [comments]);
    const statusComments = useMemo(() => {
        if (status === 'resolved') {
            return commentsSorted.filter((comment) => comment.resolved);
        }
        if (status === 'unsolved') {
            return commentsSorted.filter((comment) => !comment.resolved);
        }
        if (status === 'concern_me' && currentUser?.userID) {
            return commentsSorted.filter((comment) => comment.users.has(currentUser.userID));
        }
        return commentsSorted;
    }, [commentsSorted, currentUser?.userID, status]);
    const renderComments = scopedTempComment ? [scopedTempComment, ...statusComments] : statusComments;
    const activeComment = activeCommentId
        ? renderComments.find((comment) => isSameThreadCommentTarget(activeCommentId, comment))
        : undefined;
    const visibleComments = activeComment ? [activeComment] : renderComments;
    const unsolvedComments = visibleComments.filter((comment) => !comment.resolved);
    const solvedComments = visibleComments.filter((comment) => comment.resolved);
    const isFiltering = status !== 'all' || unit !== 'all';
    const unitFilterOptions = [
        { value: 'current', label: localeService.t<LocaleKey>('thread-comment-ui.filter.sheet.current') },
        { value: 'all', label: localeService.t<LocaleKey>('thread-comment-ui.filter.sheet.all') },
    ];
    const statusFilterOptions = [
        { value: 'all', label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.all') },
        { value: 'resolved', label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.resolved') },
        { value: 'unsolved', label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.unsolved') },
        { value: 'concern_me', label: localeService.t<LocaleKey>('thread-comment-ui.filter.status.concernMe') },
    ];

    const handleReset = () => {
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
            const activeTarget = panelService.activeCommentId;
            const target = event.target;
            if (event.button !== 0 || !activeTarget || !(target instanceof Element)) {
                return;
            }

            const activeElement = document.getElementById(
                `${location}-${activeTarget.unitId}-${activeTarget.subUnitId}-${activeTarget.commentId}`
            );
            if (
                activeElement?.contains(target) ||
                target.closest('button, input, textarea, select, a, [contenteditable="true"], [role="menu"], [role="menuitem"], [role="option"], [role="listbox"], [role="combobox"], [role="separator"]')
            ) {
                return;
            }

            commandService.executeCommand(SetActiveCommentOperation.id);
            if (scopedTempComment && isSameThreadCommentTarget(activeTarget, scopedTempComment)) {
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
        const { unitId: activeUnitId, subUnitId: activeSubUnitId, commentId } = activeCommentId;
        document.getElementById(`${location}-${activeUnitId}-${activeSubUnitId}-${commentId}`)?.scrollIntoView({ block: 'center' });
    }, [activeCommentId, location]);

    const renderComment = (section: ThreadCommentPanelSection) => (comment: IThreadComment, index: number) => (
        <MobileThreadCommentTree
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
            autoFocus={autoFocusActiveComment && isSameThreadCommentTarget(activeCommentId, comment)}
            onClick={() => {
                shouldScrollRef.current = false;
                if (comment.resolved) {
                    commandService.executeCommand(SetActiveCommentOperation.id);
                    return;
                }
                commandService.executeCommand(SetActiveCommentOperation.id, {
                    unitId: comment.unitId,
                    subUnitId: comment.subUnitId,
                    commentId: comment.id,
                    temp: false,
                });
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
            onResolve={(resolved) => onResolve?.(comment.id, resolved)}
            onClose={!comment.id ? onTempCommentClose : undefined}
        />
    );

    return (
        <div className="univer-flex univer-min-h-full univer-flex-col univer-pb-3">
            {activeComment && <MobileCommentHeader comment={activeComment} displayRef={formatRef?.(activeComment)} />}
            {!activeComment && (
                <div className="univer-mt-3 univer-flex univer-flex-col univer-gap-2">
                    {type === UniverInstanceType.UNIVER_SHEET && (
                        <MobileCommentFilter value={unit} options={unitFilterOptions} onChange={setUnit} />
                    )}
                    <MobileCommentFilter value={status} options={statusFilterOptions} onChange={setStatus} />
                </div>
            )}
            {!activeComment && !disableAdd && !scopedTempComment && <MobileAddComment onAdd={onAdd} />}
            {visibleComments.length === 0
                ? (
                    <div
                        className="
                          univer-flex univer-flex-1 univer-flex-col univer-items-center univer-justify-center
                          univer-text-sm univer-text-gray-600
                          dark:!univer-text-gray-200
                        "
                    >
                        {localeService.t<LocaleKey>('thread-comment-ui.panel.empty')}
                        {isFiltering
                            ? (
                                <MobileActionRowGroup className="univer-mt-2 univer-flex univer-flex-row">
                                    <Button onClick={handleReset}>
                                        {localeService.t<LocaleKey>('thread-comment-ui.panel.reset')}
                                    </Button>
                                </MobileActionRowGroup>
                            )
                            : null}
                    </div>
                )
                : (
                    <div className="univer-mt-3 univer-flex univer-flex-col univer-gap-3">
                        {unsolvedComments.map(renderComment('unsolved'))}
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
}
