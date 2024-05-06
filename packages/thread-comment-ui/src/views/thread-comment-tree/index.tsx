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
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import React, { useState } from 'react';
import { DeleteSingle, MoreSingle } from '@univerjs/icons';
import { ICommandService, Tools, type UniverInstanceType } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
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
}

const ThreadCommentItem = (props: IThreadCommentItemProps) => {
    const { item, unitId, subUnitId, editing, onEditingChange } = props;
    const commandService = useDependency(ICommandService);

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
                {item.personId}
                <div className={styles.threadCommentIcon}>
                    <MoreSingle onClick={handleDeleteItem} />
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
                        {item.text}
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
    const renderComments = [
        ...comments ?
            [comments.root] :
            // mock empty comment
            [{ id: 'mock', text: '', personId: personId ?? '', ref: refStr ?? '', dT: '' }],
        ...comments?.children ?? [],
    ];


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
                        <div>
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
            {showEdit && !editingId
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
                                            dT: new Date().toLocaleDateString(),
                                            id: Tools.generateRandomId(),
                                            ref: refStr,
                                            personId,
                                            parentId: comments?.root.id,
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
