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
import { AddCommentCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import React, { useEffect, useMemo, useState } from 'react';
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
}

export interface IThreadCommentItemProps {
    item: IThreadComment;
    unitId: string;
    subUnitId: string;
}

const ThreadCommentItem = (props: IThreadCommentItemProps) => {
    const { item, unitId, subUnitId } = props;
    const [editing, setEditing] = useState(false);
    const commandService = useDependency(ICommandService);

    useEffect(() => {
        if (!item.id) {
            setEditing(true);
        }
    }, [item.id]);

    return (
        <div className={styles.threadCommentItem}>
            <img className={styles.threadCommentItemHead} />
            <div className={styles.threadCommentItemTitle}>
                {item.personId}
                <div className={styles.threadCommentIcon}>
                    <MoreSingle />
                </div>
            </div>
            <div className={styles.threadCommentItemTime}>{item.dT}</div>
            {editing
                ? (
                    <ThreadCommentEditor
                        id={item.id}
                        comment={item}
                        onCancel={() => setEditing(false)}
                        autoFocus
                        onSave={({ text, attachments }) => {
                            setEditing(false);
                            if (item.id) {
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
                            } else {
                                commandService.executeCommand(
                                    AddCommentCommand.id,
                                    {
                                        unitId,
                                        subUnitId,
                                        comment: {
                                            ...item,
                                            text,
                                            attachments,
                                            dT: new Date().toLocaleDateString(),
                                            id: Tools.generateRandomId(),
                                        },
                                    } as IAddCommentCommandParams
                                );
                            }
                        }}
                    />
                )
                : <div className={styles.threadCommentItemContent}>{item.text}</div>}
        </div>
    );
};

export const ThreadCommentTree = (props: IThreadCommentTreeProps) => {
    const { id, unitId, subUnitId, refStr, personId } = props;
    const threadCommentModel = useDependency(ThreadCommentModel);
    useObservable(threadCommentModel.commentMap$);
    const comments = id ? threadCommentModel.getCommentWithChildren(unitId, subUnitId, id) : null;
    const commandService = useDependency(ICommandService);
    const renderComments = [
        ...comments ?
            [comments.root] :
            // mock empty comment
            [{ id: '', text: '', personId: personId ?? '', ref: refStr ?? '', dT: '' }],
        ...comments?.children ?? [],
    ];


    return (
        <div className={styles.threadComment}>
            <div className={styles.threadCommentTitle}>
                <div className={styles.threadCommentTitlePosition}>
                    <div className={styles.threadCommentTitleHighlight} />
                    {refStr}
                </div>
                {comments
                    ? (
                        <div>
                            <div className={styles.threadCommentIcon}>
                                <DeleteSingle />
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
                    />
                )
            )}
            {comments
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
