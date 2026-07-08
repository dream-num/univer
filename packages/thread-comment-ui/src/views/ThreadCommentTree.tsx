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

import type { IUser, LocaleType, UniverInstanceType } from '@univerjs/core';
import type { IAddCommentCommandParams, IThreadComment, IUpdateCommentCommandParams } from '@univerjs/thread-comment';
import type { IUniverUIConfig } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import type { IThreadCommentEditorInstance } from './ThreadCommentEditor';
import { dateKit, generateRandomId, ICommandService, LOCALE_META, LocaleService, UserManagerService } from '@univerjs/core';
import { borderClassName, clsx, Dropdown, scrollbarClassName, Tooltip } from '@univerjs/design';
import { DeleteIcon, MoreHorizontalIcon, ReplyToCommentIcon, SuccessIcon, SuccessOutlineIcon } from '@univerjs/icons';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    getDT,
    ResolveCommentCommand,
    ThreadCommentModel,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
import { UI_PLUGIN_CONFIG_KEY, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { SetActiveCommentOperation } from '../commands/operations/comment.operations';
import { transformDocument2TextNodes, transformTextNodes2Document } from './thread-comment-editor/util';
import { getThreadCommentEditorId } from './thread-comment-tree/util';
import { ThreadCommentEditor } from './ThreadCommentEditor';

export enum ThreadCommentTreeLocation {
    CELL = 'CELL',
    PANEL = 'PANEL',
};

export interface IThreadCommentTreeProps {
    full?: boolean;
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
    location: ThreadCommentTreeLocation;
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
    threadCommentEditorId: string;
}

const MOCK_ID = '__mock__';

function formatCommentDateTime(value: string, locale: LocaleType): string {
    const date = dateKit(value);
    const localeTag = LOCALE_META[locale].tag;

    return date.formatIntl(localeTag, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

const ThreadCommentItem = (props: IThreadCommentItemProps) => {
    const { item, unitId, subUnitId, editing, onEditingChange, onReply, resolved, isRoot, onClose, onDeleteComment, type, threadCommentEditorId } = props;
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
    const currentLocale = useObservable(localeService.currentLocale$, localeService.getCurrentLocale());
    const dateText = formatCommentDateTime(item.dT, currentLocale);

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
        <div
            className="
              univer-relative univer-mb-3 univer-pl-[30px]
              rtl:univer-pl-0 rtl:univer-pr-[30px]
            "
            onMouseLeave={() => setShowReply(false)}
            onMouseEnter={() => setShowReply(true)}
        >
            <div
                className={`
                  univer-absolute univer-left-0 univer-top-0 univer-size-6 univer-rounded-full univer-bg-cover
                  univer-bg-center univer-bg-no-repeat
                  rtl:univer-left-auto rtl:univer-right-0
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
                                                  univer-ml-1 univer-inline-flex univer-size-6 univer-cursor-pointer
                                                  univer-items-center univer-justify-center univer-rounded-sm
                                                  univer-text-base
                                                  hover:univer-bg-gray-50
                                                  rtl:univer-ml-0 rtl:univer-mr-1
                                                  dark:hover:!univer-bg-gray-800
                                                `}
                                                onClick={() => onReply(user)}
                                            >
                                                <ReplyToCommentIcon />
                                            </div>
                                        )
                                        : null
                                )}
                            {isCommentBySelf && !isMock && !resolved
                                ? (
                                    <Dropdown
                                        overlay={(
                                            <div className="univer-rounded-lg">
                                                <ul
                                                    className={`
                                                      univer-m-0 univer-box-border univer-grid univer-list-none
                                                      univer-p-1.5 univer-text-sm
                                                      [&_a]:univer-block [&_a]:univer-cursor-pointer
                                                      [&_a]:univer-rounded [&_a]:univer-px-2 [&_a]:univer-py-1.5
                                                      [&_a]:univer-transition-colors
                                                    `}
                                                >
                                                    <li>
                                                        <a
                                                            className="hover:univer-bg-gray-200"
                                                            onClick={() => onEditingChange?.(true)}
                                                        >
                                                            {localeService.t<LocaleKey>('thread-comment-ui.item.edit')}
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="hover:univer-bg-gray-200"
                                                            onClick={handleDeleteItem}
                                                        >
                                                            {localeService.t<LocaleKey>('thread-comment-ui.item.delete')}
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    >
                                        <div
                                            className={`
                                              univer-ml-1 univer-inline-flex univer-size-6 univer-cursor-pointer
                                              univer-items-center univer-justify-center univer-rounded-sm
                                              univer-text-base
                                              hover:univer-bg-gray-50
                                              rtl:univer-ml-0 rtl:univer-mr-1
                                              dark:hover:!univer-bg-gray-800
                                            `}
                                        >
                                            <MoreHorizontalIcon />
                                        </div>
                                    </Dropdown>
                                )
                                : null}
                        </div>
                    </div>
                )
                : null}
            <time
                dir="ltr"
                className={`
                  univer-mb-1 univer-block univer-text-xs/normal univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {dateText}
            </time>
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
                        editorId={threadCommentEditorId}
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
                    <div
                        className={`
                          univer-text-sm univer-text-gray-900
                          dark:!univer-text-white
                        `}
                    >
                        {transformDocument2TextNodes(item.text).map((paragraph, i) => (
                            <div key={i} className="univer-break-words">
                                {paragraph.map((item, i) => {
                                    switch (item.type) {
                                        case 'mention':
                                            return (
                                                <a className="univer-text-primary-600" key={i}>
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
        location,
        autoFocus,
        onMouseEnter,
        onMouseLeave,
        onAddComment,
        onDeleteComment,
        onResolve,
        type,
        style,
        full,
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
    const fallbackEditorId = useMemo(() => generateRandomId(6), []);
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
    const threadCommentEditorId = getThreadCommentEditorId({
        location,
        unitId,
        subUnitId,
        commentId: id,
        fallbackId: fallbackEditorId,
    });

    return (
        <div
            id={`${location}-${unitId}-${subUnitId}-${id}`}
            className={clsx(`
              univer-relative univer-box-border univer-rounded-md univer-bg-white univer-p-4
              dark:!univer-bg-gray-900 dark:!univer-text-white
            `, borderClassName, {
                'univer-w-[278px]': !full,
                'univer-w-full': full,
                'univer-shadow': !resolved && (showHighlight || isHover || location === ThreadCommentTreeLocation.CELL),
            })}
            style={style}
            onClick={onClick}
            onMouseEnter={() => {
                onMouseEnter?.();
                setIsHover(true);
            }}
            onMouseLeave={() => {
                onMouseLeave?.();
                setIsHover(false);
            }}
        >
            {!resolved && showHighlight && (
                <div
                    className={`
                      univer-absolute univer-left-0 univer-right-0 univer-top-0 univer-h-1.5 univer-rounded-t-md
                      univer-bg-yellow-400
                    `}
                />
            )}
            <div
                className={`
                  univer-mb-4 univer-flex univer-flex-row univer-items-center univer-justify-between univer-text-sm
                  univer-leading-5
                `}
            >
                <div className="univer-flex univer-flex-1 univer-flex-row univer-items-center univer-overflow-hidden">
                    <div
                        className={`
                          univer-mr-2 univer-h-3.5 univer-w-[3px] univer-flex-shrink-0 univer-flex-grow-0
                          univer-rounded-sm univer-bg-yellow-500
                          rtl:univer-ml-2 rtl:univer-mr-0
                        `}
                    />
                    <Tooltip showIfEllipsis title={title}>
                        <span
                            className="univer-flex-1 univer-truncate"
                        >
                            {title}
                        </span>
                    </Tooltip>
                </div>
                {!!comments && (
                    <div className="univer-flex univer-flex-shrink-0 univer-flex-grow-0 univer-flex-row">
                        <div
                            className={clsx(`
                              univer-ml-1 univer-inline-flex univer-size-6 univer-cursor-pointer univer-items-center
                              univer-justify-center univer-rounded-[3px] univer-text-base
                              hover:univer-bg-gray-50
                              rtl:univer-ml-0 rtl:univer-mr-1
                              dark:hover:!univer-bg-gray-800
                            `, {
                                'univer-text-green-500': resolved,
                            })}
                            onClick={handleResolve}
                        >
                            {resolved ? <SuccessIcon /> : <SuccessOutlineIcon />}
                        </div>
                        {currentUser?.userID === comments.root.personId
                            ? (
                                <div
                                    className={`
                                      univer-ml-1 univer-inline-flex univer-size-6 univer-cursor-pointer
                                      univer-items-center univer-justify-center univer-rounded-[3px] univer-text-base
                                      hover:univer-bg-gray-50
                                      rtl:univer-ml-0 rtl:univer-mr-1
                                      dark:hover:!univer-bg-gray-800
                                    `}
                                    onClick={handleDeleteRoot}
                                >
                                    <DeleteIcon />
                                </div>
                            )
                            : null}
                    </div>
                )}
            </div>
            <div
                ref={scroller}
                className={clsx('univer-max-h-80 univer-overflow-y-auto univer-overflow-x-hidden', scrollbarClassName)}
            >
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
                            type={type}
                            threadCommentEditorId={threadCommentEditorId}
                            onClose={onClose}
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
                                    editorRef.current?.reply(transformTextNodes2Document([
                                        {
                                            type: 'mention',
                                            content: {
                                                id: user.userID,
                                                label: `@${user.name}`,
                                            },
                                        },
                                        {
                                            type: 'text',
                                            content: ' ',
                                        },
                                    ]));
                                });
                            }}
                            onAddComment={onAddComment}
                            onDeleteComment={onDeleteComment}
                        />
                    )
                )}
            </div>
            {editorVisible && (
                <div>
                    <ThreadCommentEditor
                        key={`${autoFocus}`}
                        ref={editorRef}
                        type={type}
                        unitId={unitId}
                        subUnitId={subUnitId}
                        editorId={threadCommentEditorId}
                        onSave={async ({ text, attachments }) => {
                            const comment: IThreadComment = {
                                text,
                                attachments,
                                dT: getDT(),
                                id: generateRandomId(),
                                ref: refStr!,
                                personId: currentUser?.userID ?? '',
                                parentId: comments?.root.id,
                                unitId,
                                subUnitId,
                                threadId: comments?.root.threadId ?? '',
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
            )}
        </div>
    );
};
