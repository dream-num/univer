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

import { BehaviorSubject, map, Subject } from 'rxjs';
import { CustomRangeType, ICommandService } from '@univerjs/core';
import type { IThreadComment } from '../types/interfaces/i-thread-comment';
import type { IUpdateCommentPayload, IUpdateCommentRefPayload } from '../commands/mutations/comment.mutation';
import { Inject } from '@wendellhu/redi';
import { IThreadCommentDataSourceService, ThreadCommentJSON } from '../services/tc-datasource.service';
import { CommentUpdateOperation, ICommentUpdateOperationProps } from '../commands/operations/comment.operation';

export type CommentUpdate = {
    unitId: string;
    subUnitId: string;
    silent?: boolean;
} & ({
    type: 'add';
    payload: IThreadComment;
    isRoot: boolean;
} | {
    type: 'update';
    payload: IUpdateCommentPayload;
} | {
    type: 'delete';
    payload: {
        commentId: string;
        isRoot: boolean;
        comment: IThreadComment;
    };
} | {
    type: 'updateRef';
    payload: IUpdateCommentRefPayload;
} | {
    type: 'resolve';
    payload: {
        commentId: string;
        resolved: boolean;
    };
} | {
    type: 'syncUpdate',
    payload: IThreadComment
});

export class ThreadCommentModel {
    private _commentsMap: Record<string, Record<string, Record<string, IThreadComment>>> = {};
    private _commentsTreeMap: Map<string, Map<string, Map<string, IThreadComment>>> = new Map();
    private _threadMap: Map<string, Map<string, IThreadComment>> = new Map();

    private _commentUpdate$ = new Subject<CommentUpdate>();
    private _commentsMap$ = new BehaviorSubject<Record<string, Record<string, Record<string, IThreadComment>>>>({});

    commentUpdate$ = this._commentUpdate$.asObservable();
    commentMap$ = this._commentsMap$.asObservable();

    constructor(
        @Inject(IThreadCommentDataSourceService) private readonly _dataSourceService: IThreadCommentDataSourceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        this._initSync();
    }


    private _initSync() {
        this._commandService.onCommandExecuted(command => {
            if (command.id === CommentUpdateOperation.id) {
                const params = command.params as ICommentUpdateOperationProps
                const { unitId, subUnitId, commentId, threadId, rootId } = params;
                const rootComment = this.getComment(unitId, subUnitId, rootId);
                if (rootComment) {
                    this.syncComment(unitId, subUnitId, {
                        id: rootId,
                        threadId,
                        ref: rootComment.ref
                    })
                }

            }
        })
    }

    private _ensureCommentMap(unitId: string, subUnitId: string) {
        let unitMap = this._commentsMap[unitId];

        if (!unitMap) {
            unitMap = {};
            this._commentsMap[unitId] = unitMap;
        }

        let subUnitMap = unitMap[subUnitId];
        if (!subUnitMap) {
            subUnitMap = {};
            unitMap[subUnitId] = subUnitMap;
        }

        return subUnitMap;
    }

    private _ensureCommentChildrenMap(unitId: string, subUnitId: string) {
        let unitMap = this._commentsTreeMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._commentsTreeMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _ensureThreadMap(unitId: string) {
        let unitMap = this._threadMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._threadMap.set(unitId, unitMap);
        }

        return unitMap;
    }

    private _refreshCommentsMap$() {
        this._commentsMap$.next({
            ...this._commentsMap,
        });
    }

    ensureMap(unitId: string, subUnitId: string) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const commentChildrenMap = this._ensureCommentChildrenMap(unitId, subUnitId);

        return {
            commentMap,
            commentChildrenMap,
        };
    }

    addComment(unitId: string, subUnitId: string, origin: IThreadComment, sync = false) {
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);
        let comment = origin;

        const addCommentItem = (item: IThreadComment) => {
            commentMap[item.id] = item;
            this._commentUpdate$.next({
                unitId,
                subUnitId,
                type: 'add',
                payload: item,
                isRoot: !item.parentId,
            });
        }

        const parentId = comment.parentId;
        if (parentId) {
            const parent = commentMap[parentId];
            parent.children = [
                ...parent.children ?? [],
                comment,
            ];
            addCommentItem(comment);
        } else {
            commentChildrenMap.set(comment.id, comment);
            const threadMap = this._ensureThreadMap(unitId);
            threadMap.set(comment.threadId, comment);
            addCommentItem(comment);
            comment.children?.forEach(addCommentItem);
        }

        this._refreshCommentsMap$();
        if (sync) {
            this.syncComment(unitId, subUnitId, {
                ref: comment.ref,
                threadId: comment.threadId,
                id: comment.id
            })
        }
        return true;
    }

    async syncComment(unitId: string, subUnitId: string, info: ThreadCommentJSON) {
        const comment = await this._dataSourceService.getThreadComment(unitId, subUnitId, info);
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);
        if (comment) {
            commentMap[comment.id] = comment;
            comment.children?.forEach(child => {
                commentMap[child.id] = child;
            });
            commentChildrenMap.set(comment.id, comment);

            this._commentUpdate$.next({
                unitId,
                subUnitId,
                type: 'syncUpdate',
                payload: comment,
            });
            this._refreshCommentsMap$();
        }
    }

    updateComment(unitId: string, subUnitId: string, payload: IUpdateCommentPayload, silent?: boolean) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap[payload.commentId];
        if (!oldComment) {
            return false;
        }
        oldComment.updated = true;
        oldComment.text = payload.text;
        oldComment.attachments = payload.attachments;
        oldComment.updateT = payload.updateT;

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'update',
            payload,
            silent,
        });
        this._refreshCommentsMap$();
        return true;
    }

    updateCommentRef(unitId: string, subUnitId: string, payload: IUpdateCommentRefPayload, silent?: boolean) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap[payload.commentId];
        if (!oldComment) {
            return false;
        }

        oldComment.ref = payload.ref;

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'updateRef',
            payload,
            silent,
        });
        this._refreshCommentsMap$();
        return true;
    }

    resolveComment(unitId: string, subUnitId: string, commentId: string, resolved: boolean) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap[commentId];
        if (!oldComment) {
            return false;
        }

        oldComment.resolved = resolved;
        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'resolve',
            payload: {
                commentId,
                resolved,
            },
        });
        this._refreshCommentsMap$();
        return true;
    }

    getComment(unitId: string, subUnitId: string, commentId: string) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        return commentMap[commentId] as IThreadComment | undefined;
    }

    getComment$(unitId: string, subUnitId: string, commentId: string) {
        return this._commentsMap$.pipe(map((records) => records[unitId][subUnitId][commentId]));
    }

    getCommentWithChildren(unitId: string, subUnitId: string, commentId: string) {
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);
        const current = commentMap[commentId];
        if (!current) {
            return undefined;
        }

        const relativeUsers = new Set<string>();
        const root = commentChildrenMap.get(commentId);

        if (!root) {
            return undefined;
        }

        [root, ...root.children ?? []].forEach((comment) => {
            relativeUsers.add(comment.personId);
            comment.text.customRanges?.forEach((range) => {
                if (range.rangeType === CustomRangeType.MENTION) {
                    relativeUsers.add(range.rangeId);
                }
            });
        });

        return {
            root: current,
            children: root.children ?? [],
            relativeUsers,
        };
    }

    deleteComment(unitId: string, subUnitId: string, commentId: string) {
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);
        const current = commentMap[commentId];
        if (!current) {
            return false;
        }

        if (current.parentId) {
            const root = commentChildrenMap.get(current.parentId);
            if (root && root.children) {
                const index = root.children.findIndex((comment) => comment.id = commentId);
                root.children.splice(index, 1);
            }
            delete commentMap[commentId];
        } else {
            delete commentMap[commentId];
            const comment = commentChildrenMap.get(commentId);
            commentChildrenMap.delete(commentId);
            const threadMap = this._ensureThreadMap(unitId);
            threadMap.delete(current.threadId);
            comment?.children?.forEach(child => {
                delete commentMap[child.id];
                this._commentUpdate$.next({
                    unitId,
                    subUnitId,
                    type: 'delete',
                    payload: {
                        commentId: child.id,
                        isRoot: false,
                        comment: child,
                    },
                });
            })
        }

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'delete',
            payload: {
                commentId,
                isRoot: !current.parentId,
                comment: current,
            },
        });
        this._refreshCommentsMap$();
        return true;
    }

    getUnit(unitId: string) {
        const unitMap = this._commentsMap[unitId];
        if (!unitMap) {
            return [];
        }

        return Array.from(Object.entries(unitMap)).map(([subUnitId, subUnitMap]) => [subUnitId, Array.from(Object.values(subUnitMap))] as const);
    }

    deleteUnit(unitId: string) {
        const unitMap = this._commentsMap[unitId];
        if (!unitMap) {
            return;
        }

        Object.entries(unitMap).forEach(([subUnitId, subUnitMap]) => {
            Object.values(subUnitMap).forEach((comment) => {
                this.deleteComment(unitId, subUnitId, comment.id);
            });
        });
    }

    getRootCommentIds(unitId: string, subUnitId: string) {
        const commentChildrenMap = this._ensureCommentChildrenMap(unitId, subUnitId);
        return Array.from(commentChildrenMap.keys());
    }

    getAll() {
        return this._commentsMap;
    }

    getThread(unitId: string, threadId: string) {
        return this._ensureThreadMap(unitId).get(threadId)
    }
}
