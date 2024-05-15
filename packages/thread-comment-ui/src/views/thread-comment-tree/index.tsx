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

import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IAddCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ResolveCommentCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import React, { useRef, useState } from 'react';
import { DeleteSingle, MoreHorizontalSingle, ReplyToCommentSingle, ResolvedSingle } from '@univerjs/icons';
import { ICommandService, LocaleService, Tools, type UniverInstanceType, UserManagerService } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
import dayjs from 'dayjs';
import { Dropdown, Menu, MenuItem } from '@univerjs/design';
import type { IUser } from '@univerjs/protocol';
import type { IThreadCommentEditorInstance } from '../thread-comment-editor';
import { ThreadCommentEditor } from '../thread-comment-editor';
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
}

const MOCK_ID = '__mock__';

const ThreadCommentItem = (props: IThreadCommentItemProps) => {
    const { item, unitId, subUnitId, editing, onEditingChange, onReply, resolved, isRoot } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const userManagerService = useDependency(UserManagerService);
    const user = userManagerService.getUser(item.personId);
    const currentUser = useObservable(userManagerService.currentUser$);
    const isCommentBySelf = currentUser?.userID === item.personId;
    const isMock = item.id === MOCK_ID;
    const handleDeleteItem = () => {
        commandService.executeCommand(
            isRoot ? DeleteCommentTreeCommand.id : DeleteCommentCommand.id,
            {
                unitId,
                subUnitId,
                commentId: item.id,
            }
        );
    };

    return (
        <div className={styles.threadCommentItem}>
            <img className={styles.threadCommentItemHead} src={user?.avatar} />
            <div className={styles.threadCommentItemTitle}>
                <div>
                    {user?.name || ' '}
                </div>
                <div>
                    {(isMock || resolved)
                        ? null
                        : (
                            <div className={styles.threadCommentIcon} onClick={() => onReply(user)}>
                                <ReplyToCommentSingle />
                            </div>
                        )}
                    {isCommentBySelf && !isMock
                        ? (
                            <Dropdown
                                overlay={(
                                    <Menu>
                                        <MenuItem onClick={() => onEditingChange?.(true)}>{localeService.t('threadCommentUI.item.edit')}</MenuItem>
                                        <MenuItem onClick={handleDeleteItem}>{localeService.t('threadCommentUI.item.delete')}</MenuItem>
                                    </Menu>
                                )}
                            >
                                <div className={styles.threadCommentIcon}>
                                    <MoreHorizontalSingle />
                                </div>
                            </Dropdown>
                        )
                        : null}
                </div>
            </div>
            <div className={styles.threadCommentItemTime}>{item.dT}</div>
            {editing
                ? (
                    <ThreadCommentEditor
                        id={item.id}
                        comment={item}
                        onCancel={() => onEditingChange?.(false)}
                        autoFocus
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
                        {item.text.map((item, i) => {
                            switch (item.type) {
                                case 'mention':
                                    return (
                                        <a className={styles.threadCommentItemAt} key={i}>
                                            @
                                            {item.content.label}
                                            {' '}
                                        </a>
                                    );
                                default:
                                    return item.content;
                            }
                        })}
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
    } = props;
    const threadCommentModel = useDependency(ThreadCommentModel);
    const [editingId, setEditingId] = useState('');
    useObservable(threadCommentModel.commentMap$);
    const comments = id ? threadCommentModel.getCommentWithChildren(unitId, subUnitId, id) : null;
    const commandService = useDependency(ICommandService);
    const userManagerService = useDependency(UserManagerService);
    const resolved = comments?.root.resolved;
    const currentUser = useObservable(userManagerService.currentUser$);
    const editorRef = useRef<IThreadCommentEditorInstance>(null);
    const renderComments = [
        ...comments ?
            [comments.root] :
            // mock empty comment
            [{
                id: MOCK_ID,
                text: [],
                personId: currentUser?.userID ?? '',
                ref: refStr ?? '',
                dT: '',
                unitId,
                subUnitId,
            }],
        ...comments?.children ?? [],
    ];

    const handleResolve = () => {
        commandService.executeCommand(ResolveCommentCommand.id, {
            unitId,
            subUnitId,
            commentId: id,
            resolved: !resolved,
        });
        onClose?.();
    };

    const handleDeleteRoot = () => {
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

    return (
        <div className={styles.threadComment} onClick={onClick} id={`${prefix}-${unitId}-${subUnitId}-${id}`}>
            {showHighlight ? <div className={styles.threadCommentHighlight} /> : null}
            <div className={styles.threadCommentTitle}>
                <div className={styles.threadCommentTitlePosition}>
                    <div className={styles.threadCommentTitleHighlight} />
                    {refStr || comments?.root.ref}
                    {' · '}
                    {getSubUnitName(comments?.root.subUnitId ?? subUnitId)}
                </div>
                {comments
                    ? (
                        <div className={styles.threadCommentIconContainer}>
                            <div
                                onClick={handleResolve}
                                className={styles.threadCommentIcon}
                                style={{ color: resolved ? 'rgb(var(--green-500))' : '' }}
                            >
                                <ResolvedSingle />
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
            <div className={styles.threadCommentContent}>
                {renderComments.map(
                    (item) => (
                        <ThreadCommentItem
                            unitId={unitId}
                            subUnitId={subUnitId}
                            item={item}
                            key={item.id}
                            isRoot={item.id === comments?.root.id}
                            editing={editingId === item.id}
                            resolved={comments?.root.resolved}
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
                                editorRef.current?.reply([{
                                    type: 'mention',
                                    content: {
                                        type: 'user',
                                        id: user.userID,
                                        label: user.name,
                                        extra: user,
                                    },
                                }]);
                            }}
                        />
                    )
                )}
            </div>
            {showEdit && !editingId && !resolved
                ? (
                    <div>
                        <ThreadCommentEditor
                            ref={editorRef}
                            onSave={({ text, attachments }) => {
                                commandService.executeCommand(
                                    AddCommentCommand.id,
                                    {
                                        unitId,
                                        subUnitId,
                                        comment: {
                                            text,
                                            attachments,
                                            dT: dayjs().format('YYYY/MM/DD HH:mm'),
                                            id: Tools.generateRandomId(),
                                            ref: refStr,
                                            personId: currentUser?.userID,
                                            parentId: comments?.root.id,
                                            unitId,
                                            subUnitId,
                                        },
                                    } as IAddCommentCommandParams
                                );
                            }}
                            autoFocus={!comments}
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
