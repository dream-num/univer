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
import React, { useState } from 'react';
import { DeleteSingle, MoreSingle } from '@univerjs/icons';
import { ICommandService, LocaleService, Tools, type UniverInstanceType } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
import dayjs from 'dayjs';
import { Dropdown, Menu, MenuItem } from '@univerjs/design';
import { ThreadCommentEditor } from '../thread-comment-editor';
import styles from './index.module.less';

export interface IThreadCommentTreeProps {
    id?: string;
    unitId: string;
    subUnitId: string;
    type: UniverInstanceType;
    refStr?: string;
    personId?: string;
    showEdit?: boolean;
    onClick?: () => void;
    showHighlight?: boolean;
}

export interface IThreadCommentItemProps {
    item: IThreadComment;
    unitId: string;
    subUnitId: string;
    onEditingChange?: (editing: boolean) => void;
    editing?: boolean;
    onClick?: () => void;
    resolved?: boolean;
}

const ThreadCommentItem = (props: IThreadCommentItemProps) => {
    const { item, unitId, subUnitId, editing, onEditingChange } = props;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const handleDeleteItem = () => {
        commandService.executeCommand(
            DeleteCommentCommand.id,
            {
                unitId,
                subUnitId,
                commentId: item.id,
            }
        );
    };

    return (
        <div className={styles.threadCommentItem}>
            <img className={styles.threadCommentItemHead} />
            <div className={styles.threadCommentItemTitle}>
                <div>
                    {item.personId || ' '}
                </div>
                <Dropdown
                    overlay={(
                        <Menu>
                            <MenuItem onClick={() => onEditingChange?.(true)}>{localeService.t('threadCommentUI.item.edit')}</MenuItem>
                            <MenuItem onClick={handleDeleteItem}>{localeService.t('threadCommentUI.item.delete')}</MenuItem>
                        </Menu>
                    )}
                >
                    <div className={styles.threadCommentIcon}>
                        <MoreSingle />
                    </div>
                </Dropdown>

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
                                case 'user':
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
    const { id, unitId, subUnitId, refStr, personId, showEdit = true, onClick, showHighlight } = props;
    const threadCommentModel = useDependency(ThreadCommentModel);
    const [editingId, setEditingId] = useState('');
    useObservable(threadCommentModel.commentMap$);
    const comments = id ? threadCommentModel.getCommentWithChildren(unitId, subUnitId, id) : null;
    const commandService = useDependency(ICommandService);
    const resolved = comments?.root.resolved;
    const renderComments = [
        ...comments ?
            [comments.root] :
            // mock empty comment
            [{
                id: 'mock',
                text: [],
                personId: personId ?? '',
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
    };

    return (
        <div className={styles.threadComment} onClick={onClick}>
            {showHighlight ? <div className={styles.threadCommentHighlight} /> : null}
            <div className={styles.threadCommentTitle}>
                <div className={styles.threadCommentTitlePosition}>
                    <div className={styles.threadCommentTitleHighlight} />
                    {refStr || comments?.root.ref}
                </div>
                {comments
                    ? (
                        <div className={styles.threadCommentIconContainer}>
                            <div className={styles.threadCommentIcon}>
                                <DeleteSingle onClick={handleResolve} />
                            </div>
                            <div className={styles.threadCommentIcon}>
                                <DeleteSingle onClick={handleDeleteRoot} />
                            </div>
                        </div>
                    )
                    : null}
            </div>
            {renderComments.map(
                (item) => (
                    <ThreadCommentItem
                        unitId={unitId}
                        subUnitId={subUnitId}
                        item={item}
                        key={item.id}
                        editing={editingId === item.id}
                        onEditingChange={(editing) => {
                            if (editing) {
                                setEditingId(item.id);
                            } else {
                                setEditingId('');
                            }
                        }}
                    />
                )
            )}
            {showEdit && !editingId && !resolved
                ? (
                    <div>
                        <ThreadCommentEditor
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
                                            personId,
                                            parentId: comments?.root.id,
                                            unitId,
                                            subUnitId,
                                        },
                                    } as IAddCommentCommandParams
                                );
                            }}
                        />
                    </div>
                )
                : null}
        </div>
    );
};
