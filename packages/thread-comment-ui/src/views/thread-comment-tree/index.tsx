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

import type { IAddCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import type { IThreadCommentEditorInstance } from '../thread-comment-editor';
import { generateRandomId, useDependency } from '@univerjs/core';
import { ICommandService, type IUser, LocaleService, type UniverInstanceType, UserManagerService } from '@univerjs/core';
import { DropdownLegacy, Menu, MenuItem, Tooltip } from '@univerjs/design';
import { DeleteSingle, MoreHorizontalSingle, ReplyToCommentSingle, ResolvedSingle, SolveSingle } from '@univerjs/icons';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, getDT, ResolveCommentCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { useObservable } from '@univerjs/ui';
import cs from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import { ThreadCommentEditor } from '../thread-comment-editor';
import { transformDocument2TextNodes, transformTextNodes2Document } from '../thread-comment-editor/util';
import styles from './index.module.less';

export interface IThreadCommentTreeProps {
    id?: string;
    unitId: string;
    subUnitId: string;
    type: UniverInstanceType;
    refStr?: string;
    showEdit?: boolean;
    onClick?: () => void;
    showHighlight?: boolean;
    onClose?: () => void;
    getSubUnitName: (subUnitId: string) => string;
    prefix?: string;
    autoFocus?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onAddComment?: (comment: IThreadComment) => boolean;
    onDeleteComment?: (comment: IThreadComment) => boolean;
    onResolve?: (resolved: boolean) => void;
}

export interface IThreadCommentItemProps {
    item: IThreadComment;
    unitId: string;
    subUnitId: string;
    onEditingChange?: (editing: boolean) => void;
    editing?: boolean;
    onClick?: () => void;
    resolved?: boolean;
    onReply: (user: IUser | undefined) => void;
    isRoot?: boolean;
    onClose?: () => void;
    onAddComment?: (comment: IThreadComment) => boolean;
    onDeleteComment?: (comment: IThreadComment) => boolean;
    type: UniverInstanceType;
}

const MOCK_ID = '__mock__';

const ThreadCommentItem = (props: IThreadCommentItemProps) => {
    const { item, unitId, subUnitId, editing, onEditingChange, onReply, resolved, isRoot, onClose, onDeleteComment, type } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const userManagerService = useDependency(UserManagerService);
    const user = userManagerService.getUser(item.personId);
    const currentUser = useObservable(userManagerService.currentUser$);
    const isCommentBySelf = currentUser?.userID === item.personId;
    const isMock = item.id === MOCK_ID;
    const [showReply, setShowReply] = useState(false);

    const handleDeleteItem = () => {
        if (onDeleteComment?.(item) === false) {
            return;
        }

        commandService.executeCommand(
            isRoot ? DeleteCommentTreeCommand.id : DeleteCommentCommand.id,
            {
                unitId,
                subUnitId,
                commentId: item.id,
            }
        );
        if (isRoot) {
            onClose?.();
        }
    };

    return (
        <div className={styles.threadCommentItem} onMouseLeave={() => setShowReply(false)} onMouseEnter={() => setShowReply(true)}>
            <img className={styles.threadCommentItemHead} src={user?.avatar} />
            <div className={styles.threadCommentItemTitle}>
                <div className={styles.threadCommentUsername}>
                    {user?.name || ' '}
                </div>
                <div>
                    {(isMock || resolved)
                        ? null
                        : (
                            showReply
                                ? (
                                    <div className={styles.threadCommentIcon} onClick={() => onReply(user)}>
                                        <ReplyToCommentSingle />
                                    </div>
                                )
                                : null
                        )}
                    {isCommentBySelf && !isMock && !resolved
                        ? (
                            <DropdownLegacy
                                overlay={(
                                    <Menu>
                                        <MenuItem key="edit" onClick={() => onEditingChange?.(true)}>{localeService.t('threadCommentUI.item.edit')}</MenuItem>
                                        <MenuItem key="delete" onClick={handleDeleteItem}>{localeService.t('threadCommentUI.item.delete')}</MenuItem>
                                    </Menu>
                                )}
                            >
                                <div className={styles.threadCommentIcon}>
                                    <MoreHorizontalSingle />
                                </div>
                            </DropdownLegacy>
                        )
                        : null}
                </div>
            </div>
            <div className={styles.threadCommentItemTime}>{item.dT}</div>
            {editing
                ? (
                    <ThreadCommentEditor
                        type={type}
                        id={item.id}
                        comment={item}
                        onCancel={() => onEditingChange?.(false)}
                        autoFocus
                        unitId={unitId}
                        subUnitId={subUnitId}
                        onSave={({ text, attachments }) => {
                            onEditingChange?.(false);
                            commandService.executeCommand(
                                UpdateCommentCommand.id,
                                {
                                    unitId,
                                    subUnitId,
                                    payload: {
                                        commentId: item.id,
                                        text,
                                        attachments,
                                    },
                                } as IUpdateCommentCommandParams
                            );
                        }}
                    />
                )
                : (
                    <div className={styles.threadCommentItemContent}>
                        {transformDocument2TextNodes(item.text).map((paragraph, i) => (
                            <div key={i}>
                                {paragraph.map((item, i) => {
                                    switch (item.type) {
                                        case 'mention':
                                            return (
                                                <a className={styles.threadCommentItemAt} key={i}>
                                                    {item.content.label}
                                                    {' '}
                                                </a>
                                            );
                                        default:
                                            return item.content;
                                    }
                                })}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
};

export const ThreadCommentTree = (props: IThreadCommentTreeProps) => {
    const {
        id,
        unitId,
        subUnitId,
        refStr,
        showEdit = true,
        onClick,
        showHighlight,
        onClose,
        getSubUnitName,
        prefix,
        autoFocus,
        onMouseEnter,
        onMouseLeave,
        onAddComment,
        onDeleteComment,
        onResolve,
        type,
    } = props;
    const threadCommentModel = useDependency(ThreadCommentModel);
    const [isHover, setIsHover] = useState(false);
    const [editingId, setEditingId] = useState('');
    const updte$ = useMemo(() => threadCommentModel.commentUpdate$.pipe(debounceTime(16)), [threadCommentModel]);
    useObservable(updte$);
    const comments = id ? threadCommentModel.getCommentWithChildren(unitId, subUnitId, id) : null;
    const commandService = useDependency(ICommandService);
    const userManagerService = useDependency(UserManagerService);
    const resolved = comments?.root.resolved;
    const currentUser = useObservable(userManagerService.currentUser$);
    const editorRef = useRef<IThreadCommentEditorInstance>(null);
    const renderComments: IThreadComment[] = [
        ...comments ?
            [comments.root] :
            // mock empty comment
            [{
                id: MOCK_ID,
                text: {
                    dataStream: '\n\r',
                },
                personId: currentUser?.userID ?? '',
                ref: refStr ?? '',
                dT: '',
                unitId,
                subUnitId,
                threadId: '',
            }],
        ...(comments?.children ?? []) as IThreadComment[],
    ];
    const scroller = useRef<HTMLDivElement>(null);
    const handleResolve: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        if (!resolved) {
            commandService.executeCommand(SetActiveCommentOperation.id);
        } else {
            commandService.executeCommand(SetActiveCommentOperation.id, {
                unitId,
                subUnitId,
                commentId: id,
            });
        }

        commandService.executeCommand(ResolveCommentCommand.id, {
            unitId,
            subUnitId,
            commentId: id,
            resolved: !resolved,
        });

        onResolve?.(!resolved);
    };

    const handleDeleteRoot: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        commandService.executeCommand(SetActiveCommentOperation.id);
        if (comments?.root && (onDeleteComment?.(comments.root) === false)) {
            return;
        }

        commandService.executeCommand(
            DeleteCommentTreeCommand.id,
            {
                unitId,
                subUnitId,
                commentId: id,
            }
        );
        onClose?.();
    };

    useEffect(() => {
        return onMouseLeave?.();
    }, []);

    const subUnitName = getSubUnitName(comments?.root.subUnitId ?? subUnitId);
    const editorVisible = showEdit && !editingId && !resolved;
    const title = `${refStr || comments?.root.ref || ''}${subUnitName ? ' · ' : ''}${subUnitName}`;

    return (
        <div
            className={cs(styles.threadComment, {
                [styles.threadCommentActive]: !resolved && (showHighlight || isHover || prefix === 'cell'),
            })}
            onClick={onClick}
            id={`${prefix}-${unitId}-${subUnitId}-${id}`}
            onMouseEnter={() => {
                onMouseEnter?.();
                setIsHover(true);
            }}
            onMouseLeave={() => {
                onMouseLeave?.();
                setIsHover(false);
            }}
        >
            {!resolved && showHighlight ? <div className={styles.threadCommentHighlight} /> : null}
            <div className={styles.threadCommentTitle}>
                <div className={styles.threadCommentTitlePosition}>
                    <div className={styles.threadCommentTitleHighlight} />
                    <Tooltip showIfEllipsis title={title}>
                        <div className={styles.threadCommentTitlePositionText}>
                            {title}
                        </div>
                    </Tooltip>
                </div>
                {comments
                    ? (
                        <div className={styles.threadCommentIconContainer}>
                            <div
                                onClick={handleResolve}
                                className={styles.threadCommentIcon}
                                style={{ color: resolved ? 'rgb(var(--green-500))' : '' }}
                            >
                                {resolved ? <ResolvedSingle /> : <SolveSingle />}
                            </div>
                            {currentUser?.userID === comments.root.personId
                                ? (
                                    <div className={styles.threadCommentIcon} onClick={handleDeleteRoot}>
                                        <DeleteSingle />
                                    </div>
                                )
                                : null}
                        </div>
                    )
                    : null}
            </div>
            <div className={styles.threadCommentContent} ref={scroller}>
                {renderComments.map(
                    (item) => (
                        <ThreadCommentItem
                            onClose={onClose}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            item={item}
                            key={item.id}
                            isRoot={item.id === comments?.root.id}
                            editing={editingId === item.id}
                            resolved={comments?.root.resolved}
                            type={type}
                            onEditingChange={(editing) => {
                                if (editing) {
                                    setEditingId(item.id);
                                } else {
                                    setEditingId('');
                                }
                            }}
                            onReply={(user) => {
                                if (!user) {
                                    return;
                                }
                                requestAnimationFrame(() => {
                                    editorRef.current?.reply(transformTextNodes2Document([{
                                        type: 'mention',
                                        content: {
                                            id: user.userID,
                                            label: user.name,
                                        },
                                    }]));
                                });
                            }}
                            onAddComment={onAddComment}
                            onDeleteComment={onDeleteComment}
                        />
                    )
                )}
            </div>
            {editorVisible
                ? (
                    <div>
                        <ThreadCommentEditor
                            key={`${autoFocus}`}
                            ref={editorRef}
                            type={type}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            onSave={async ({ text, attachments }) => {
                                const comment: IThreadComment = {
                                    text,
                                    attachments,
                                    dT: getDT(),
                                    id: generateRandomId(),
                                    ref: refStr!,
                                    personId: currentUser?.userID!,
                                    parentId: comments?.root.id,
                                    unitId,
                                    subUnitId,
                                    threadId: comments?.root.threadId!,
                                };

                                if (onAddComment?.(comment) === false) {
                                    return;
                                }

                                await commandService.executeCommand(
                                    AddCommentCommand.id,
                                    {
                                        unitId,
                                        subUnitId,
                                        comment,
                                    } as IAddCommentCommandParams
                                );
                                if (scroller.current) {
                                    scroller.current.scrollTop = scroller.current.scrollHeight;
                                }
                            }}
                            autoFocus={autoFocus || (!comments)}
                            onCancel={() => {
                                if (!comments) {
                                    onClose?.();
                                }
                            }}
                        />
                    </div>
                )
                : null}
        </div>
    );
};
