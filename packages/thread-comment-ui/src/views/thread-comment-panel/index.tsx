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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IThreadComment } from '@univerjs/thread-comment';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { ICommandService, LocaleService, type UniverInstanceType, UserManagerService } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
import { Button, Select } from '@univerjs/design';
import { IncreaseSingle } from '@univerjs/icons';
import type { Observable } from 'rxjs';
import { ThreadCommentTree } from '../thread-comment-tree';
import { ThreadCommentPanelService } from '../../services/thread-comment-panel.service';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import styles from './index.module.less';

export interface IThreadCommentPanelProps {
    unitId: string;
    subUnitId$: Observable<string | undefined>;
    type: UniverInstanceType;
    onAdd: () => void;
    getSubUnitName: (subUnitId: string) => string;
    onResolve?: (id: string) => void;
    sortComments?: (comments: IThreadComment[]) => IThreadComment[];
    onItemLeave?: (comment: IThreadComment) => void;
    onItemEnter?: (comment: IThreadComment) => void;
}

export const ThreadCommentPanel = (props: IThreadCommentPanelProps) => {
    const { unitId, subUnitId$, type, onAdd, getSubUnitName, onResolve, sortComments, onItemLeave, onItemEnter } = props;
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
    const currentUser = userService.currentUser;
    const shouldScroll = useRef(true);
    const prefix = 'panel';
    const comments = useMemo(() => {
        if (unit === 'all') {
            const filteredComments = unitComments.map((i) => i[1]).flat().filter((i) => !i.parentId);
            return sortComments ? sortComments(filteredComments) : filteredComments;
        } else {
            return unitComments.find((i) => i[0] === subUnitId)?.[1] ?? [];
        }
    }, [unit, unitComments, subUnitId, sortComments]);

    const statuedComments = useMemo(() => {
        if (status === 'resolved') {
            return comments.filter((comment) => comment.resolved);
        }

        if (status === 'unsolved') {
            return comments.filter((comment) => !comment.resolved);
        }
        if (status === 'concern_me') {
            if (!currentUser?.userID) {
                return comments;
            }

            return comments.map((comment) => threadCommentModel.getCommentWithChildren(comment.unitId, comment.subUnitId, comment.id)).map((comment) => {
                if (comment?.relativeUsers.has(currentUser.userID)) {
                    return comment.root;
                }
                return null;
            }).filter(Boolean) as IThreadComment[];
        }

        return comments;
    }, [comments, currentUser?.userID, status, threadCommentModel]);

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

    return (
        <div className={styles.threadCommentPanel}>
            <div className={styles.threadCommentPanelForms}>
                <Select
                    borderless
                    value={unit}
                    onChange={(e) => setUnit(e)}
                    options={[
                        {
                            value: 'current',
                            label: localeService.t('threadCommentUI.filter.sheet.current'),
                        }, {
                            value: 'all',
                            label: localeService.t('threadCommentUI.filter.sheet.all'),
                        },
                    ]}
                />
                <Select
                    borderless
                    value={status}
                    onChange={(e) => setStatus(e)}
                    options={[
                        {
                            value: 'all',
                            label: localeService.t('threadCommentUI.filter.status.all'),
                        }, {
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
                />
            </div>
            {statuedComments?.map((comment) => (
                <ThreadCommentTree
                    prefix={prefix}
                    getSubUnitName={getSubUnitName}
                    key={comment.id}
                    id={comment.id}
                    unitId={comment.unitId}
                    subUnitId={comment.subUnitId}
                    type={type}
                    showEdit={activeCommentId?.commentId === comment.id}
                    showHighlight={activeCommentId?.commentId === comment.id}
                    onClick={() => {
                        shouldScroll.current = false;
                        commandService.executeCommand(SetActiveCommentOperation.id, {
                            unitId: comment.unitId,
                            subUnitId: comment.subUnitId,
                            commentId: comment.id,
                            temp: true,
                        });
                    }}
                    onClose={() => onResolve?.(comment.id)}
                    onMouseEnter={() => onItemEnter?.(comment)}
                    onMouseLeave={() => onItemLeave?.(comment)}
                />
            ))}
            {statuedComments.length
                ? null
                : (
                    <div className={styles.threadCommentPanelEmpty}>
                        {isFiltering ?
                            localeService.t('threadCommentUI.panel.filterEmpty')
                            : localeService.t('threadCommentUI.panel.empty')}
                        {isFiltering
                            ? (
                                <Button
                                    onClick={onReset}
                                    type="link"
                                >
                                    {localeService.t('threadCommentUI.panel.reset')}
                                </Button>
                            )
                            : (
                                <Button
                                    id="thread-comment-add"
                                    className={styles.threadCommentPanelAdd}
                                    type="primary"
                                    onClick={onAdd}
                                >
                                    <IncreaseSingle />
                                    {localeService.t('threadCommentUI.panel.addComment')}
                                </Button>
                            )}
                    </div>
                )}
        </div>
    );
};
