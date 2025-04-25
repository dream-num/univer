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

import type { IUser, UniverInstanceType } from '@univerjs/core';
import type { IAddCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import type { IUniverUIConfig } from '@univerjs/ui';
import type { IThreadCommentEditorInstance } from '../thread-comment-editor';
import { generateRandomId, ICommandService, LocaleService, UserManagerService } from '@univerjs/core';
import { clsx, Dropdown, Tooltip } from '@univerjs/design';
import { DeleteSingle, MoreHorizontalSingle, ReplyToCommentSingle, ResolvedSingle, SolveSingle } from '@univerjs/icons';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, getDT, ResolveCommentCommand, ThreadCommentModel, UpdateCommentCommand } from '@univerjs/thread-comment';
import { UI_PLUGIN_CONFIG_KEY, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { SetActiveCommentOperation } from '../../commands/operations/comment.operations';
import { ThreadCommentEditor } from '../thread-comment-editor';
import { transformDocument2TextNodes, transformTextNodes2Document } from '../thread-comment-editor/util';

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
    style?: React.CSSProperties;
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
    const uiConfig = useConfigValue<IUniverUIConfig>(UI_PLUGIN_CONFIG_KEY);
    const avatarFallback = uiConfig?.avatarFallback;

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
        <div className="univer-relative univer-mb-3 univer-pl-[30px]" onMouseLeave={() => setShowReply(false)} onMouseEnter={() => setShowReply(true)}>
            <div
                className={`
                  univer-absolute univer-left-0 univer-top-0 univer-h-6 univer-w-6 univer-rounded-full univer-bg-cover
                  univer-bg-center univer-bg-no-repeat
                `}
                style={{
                    backgroundImage: `url(${user?.avatar || avatarFallback})`,
                }}
            />
            {user
                ? (
                    <div className="univer-mb-1 univer-flex univer-h-6 univer-items-center univer-justify-between">
                        <div className="univer-text-sm univer-font-medium univer-leading-5">
                            {user?.name || ' '}
                        </div>
                        <div>
                            {(isMock || resolved)
                                ? null
                                : (
                                    showReply && user
                                        ? (
                                            <div
                                                className={`
                                                  univer-ml-1 univer-inline-flex univer-h-6 univer-w-6
                                                  univer-cursor-pointer univer-items-center univer-justify-center
                                                  univer-rounded-[3px] univer-text-base
                                                  hover:univer-bg-gray-50
                                                `}
                                                onClick={() => onReply(user)}
                                            >
                                                <ReplyToCommentSingle />
                                            </div>
                                        )
                                        : null
                                )}
                            {isCommentBySelf && !isMock && !resolved
                                ? (
                                    <Dropdown
                                        overlay={(
                                            <div className="univer-rounded-lg univer-p-4 univer-theme">
                                                <ul
                                                    className={`
                                                      univer-m-0 univer-grid univer-list-none univer-gap-2 univer-p-0
                                                      univer-text-sm
                                                      [&_a]:univer-cursor-pointer [&_a]:univer-rounded [&_a]:univer-p-1
                                                    `}
                                                >
                                                    <li>
                                                        <a
                                                            className="hover:univer-bg-gray-200"
                                                            onClick={() => onEditingChange?.(true)}
                                                        >
                                                            {localeService.t('threadCommentUI.item.edit')}
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="hover:univer-bg-gray-200"
                                                            onClick={handleDeleteItem}
                                                        >
                                                            {localeService.t('threadCommentUI.item.delete')}
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    >
                                        <div
                                            className={`
                                              univer-ml-1 univer-inline-flex univer-h-6 univer-w-6 univer-cursor-pointer
                                              univer-items-center univer-justify-center univer-rounded-[3px]
                                              univer-text-base
                                              hover:univer-bg-gray-50
                                            `}
                                        >
                                            <MoreHorizontalSingle />
                                        </div>
                                    </Dropdown>
                                )
                                : null}
                        </div>
                    </div>
                )
                : null}
            <div className="univer-mb-1 univer-text-xs univer-leading-[1.5] univer-text-gray-600">{item.dT}</div>
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
                    <div className="univer-text-[13px] univer-leading-5 univer-text-black">
                        {transformDocument2TextNodes(item.text).map((paragraph, i) => (
                            <div key={i} className="univer-break-words">
                                {paragraph.map((item, i) => {
                                    switch (item.type) {
                                        case 'mention':
                                            return (
                                                <a className="univer-text-blue-600" key={i}>
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
        style,
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
            className={clsx(
                `
                  univer-relative univer-box-border univer-w-[278px] univer-rounded-lg univer-border univer-border-solid
                  univer-border-gray-200 univer-bg-white univer-p-4
                `,
                {
                    'univer-shadow': !resolved && (showHighlight || isHover || prefix === 'cell'),
                }
            )}
            style={style}
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
            {!resolved && showHighlight
                ? (
                    <div
                        className={`
                          univer-absolute univer-left-0 univer-right-0 univer-top-0 univer-h-[6px]
                          univer-rounded-t-[6px] univer-bg-yellow-400
                        `}
                    />
                )
                : null}
            <div
                className={`
                  univer-mb-4 univer-flex univer-flex-row univer-items-center univer-justify-between univer-text-sm
                  univer-leading-5
                `}
            >
                <div className="univer-flex univer-flex-1 univer-flex-row univer-items-center univer-overflow-hidden">
                    <div
                        className={`
                          univer-mr-2 univer-h-[14px] univer-w-[3px] univer-flex-shrink-0 univer-flex-grow-0
                          univer-rounded-[1.5px] univer-bg-yellow-400
                        `}
                    />
                    <Tooltip showIfEllipsis title={title}>
                        <div
                            className={`
                              univer-flex-1 univer-overflow-hidden univer-text-ellipsis univer-whitespace-nowrap
                            `}
                        >
                            {title}
                        </div>
                    </Tooltip>
                </div>
                {comments
                    ? (
                        <div className="univer-flex univer-flex-shrink-0 univer-flex-grow-0 univer-flex-row">
                            <div
                                onClick={handleResolve}
                                className={clsx(
                                    `
                                      univer-ml-1 univer-inline-flex univer-h-6 univer-w-6 univer-cursor-pointer
                                      univer-items-center univer-justify-center univer-rounded-[3px] univer-text-base
                                      hover:univer-bg-gray-50
                                    `,
                                    {
                                        'univer-text-green-500': resolved,
                                    }
                                )}
                            >
                                {resolved ? <ResolvedSingle /> : <SolveSingle />}
                            </div>
                            {currentUser?.userID === comments.root.personId
                                ? (
                                    <div
                                        className={`
                                          univer-ml-1 univer-inline-flex univer-h-6 univer-w-6 univer-cursor-pointer
                                          univer-items-center univer-justify-center univer-rounded-[3px]
                                          univer-text-base
                                          hover:univer-bg-gray-50
                                        `}
                                        onClick={handleDeleteRoot}
                                    >
                                        <DeleteSingle />
                                    </div>
                                )
                                : null}
                        </div>
                    )
                    : null}
            </div>
            <div
                className={`
                  univer-max-h-[300px] univer-overflow-y-auto univer-overflow-x-hidden
                  [scrollbar-gutter:auto]
                  [scrollbar-width:thin]
                `}
                ref={scroller}
            >
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
                                            label: `@${user.name}`,
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
