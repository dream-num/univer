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

import type { Nullable } from '@univerjs/core';
import type { IUpdateCommentPayload, IUpdateCommentRefPayload } from '../commands/mutations/comment.mutation';
import type { ThreadCommentAnchorKind } from '../types/comment-anchor';
import type { IBaseComment, IThreadComment } from '../types/interfaces/i-thread-comment';
import { Disposable, Inject, LifecycleService, LifecycleStages } from '@univerjs/core';
import { Subject } from 'rxjs';
import { IThreadCommentDataSourceService } from '../services/tc-datasource.service';
import { deserializeThreadCommentAnchor } from '../types/comment-anchor';

export interface IThreadCommentQuery {
    unitIds?: string[];
    subUnitIds?: string[];
    anchorKinds?: ThreadCommentAnchorKind[];
    authorIds?: string[];
    resolved?: boolean;
}

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
    threadId: string;
} | {
    type: 'resolve';
    payload: {
        commentId: string;
        resolved: boolean;
    };
} | {
    type: 'syncUpdate';
    payload: IThreadComment;
});

export interface IThreadInfo {
    unitId: string;
    subUnitId: string;
    threadId: string;
    root: IThreadComment;
    children: IThreadComment[];
    relativeUsers: Set<string>;
}

export class ThreadCommentModel extends Disposable {
    private _commentsMap: Map<string, Map<string, Map<string, IThreadComment>>> = new Map();
    private _threadMap: Map<string, Map<string, Map<string, IThreadComment>>> = new Map();
    private _syncVersions = new Map<string, number>();
    private _nextSyncVersion = 0;

    private _commentUpdate$ = new Subject<CommentUpdate>();
    commentUpdate$ = this._commentUpdate$.asObservable();

    private _tasks: { unitId: string; subUnitId: string; threadIds: string[] }[] = [];

    constructor(
        @Inject(IThreadCommentDataSourceService) private readonly _dataSourceService: IThreadCommentDataSourceService,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        super();

        this.disposeWithMe(() => {
            this._commentUpdate$.complete();
        });

        this.disposeWithMe(this._lifecycleService.lifecycle$.subscribe((stage) => {
            const taskMap = new Map<string, Map<string, Set<string>>>();

            if (stage === LifecycleStages.Rendered) {
                this._tasks.forEach(({ unitId, subUnitId, threadIds }) => {
                    let unitMap = taskMap.get(unitId);
                    if (!unitMap) {
                        unitMap = new Map();
                        taskMap.set(unitId, unitMap);
                    }
                    let subUnitMap = unitMap.get(subUnitId);
                    if (!subUnitMap) {
                        subUnitMap = new Set();
                        unitMap.set(subUnitId, subUnitMap);
                    }
                    for (const threadId of threadIds) {
                        subUnitMap.add(threadId);
                    }
                });

                this._tasks = [];
                taskMap.forEach((subUnitMap, unitId) => {
                    subUnitMap.forEach((threadIds, subUnitId) => {
                        this.syncThreadComments(unitId, subUnitId, Array.from(threadIds));
                    });
                });
            }
        }));
    }

    private _ensureCommentMap(unitId: string, subUnitId: string) {
        let unitMap = this._commentsMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._commentsMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    ensureMap(unitId: string, subUnitId: string) {
        return this._ensureCommentMap(unitId, subUnitId);
    }

    private _ensureThreadMap(unitId: string, subUnitId: string) {
        let unitMap = this._threadMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._threadMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _syncKey(unitId: string, subUnitId: string, threadId: string): string {
        return `${unitId}\0${subUnitId}\0${threadId}`;
    }

    private _invalidateSync(unitId: string, subUnitId: string, threadId: string): void {
        this._syncVersions.delete(this._syncKey(unitId, subUnitId, threadId));
    }

    private _replaceComment(unitId: string, subUnitId: string, comment: IBaseComment) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const currentComment = commentMap.get(comment.id);

        if (!currentComment) {
            this.addComment(unitId, subUnitId, comment as IThreadComment);
            return;
        }

        const { children = [], ...rest } = comment;
        const seenChildIds = new Set([comment.id]);
        const safeChildren = children.filter((child) => {
            const current = commentMap.get(child.id);
            if (
                child.threadId !== comment.threadId
                || seenChildIds.has(child.id)
                || (current && current.threadId !== comment.threadId)
            ) {
                return false;
            }
            seenChildIds.add(child.id);
            return true;
        });
        const newComment = {
            ...rest,
            ref: currentComment.ref,
        };
        commentMap.set(comment.id, newComment);
        if (!newComment.parentId) {
            this._ensureThreadMap(unitId, subUnitId).set(newComment.threadId, newComment);
        }

        const remoteCommentIds = new Set([comment.id, ...safeChildren.map((child) => child.id)]);
        commentMap.forEach((localComment, commentId) => {
            if (localComment.threadId === comment.threadId && !remoteCommentIds.has(commentId)) {
                this._deleteComment(unitId, subUnitId, commentId);
            }
        });

        safeChildren.forEach((child) => {
            commentMap.set(child.id, {
                ...child,
                parentId: comment.id,
                ref: '',
            });
        });

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'syncUpdate',
            payload: newComment,
        });

        if (Boolean(comment.resolved) !== Boolean(currentComment.resolved)) {
            this._commentUpdate$.next({
                unitId,
                subUnitId,
                type: 'resolve',
                payload: {
                    commentId: comment.id,
                    resolved: Boolean(comment.resolved),
                },
            });
        }
    }

    async syncThreadComments(unitId: string, subUnitId: string, threadIds: string[]) {
        if (this._lifecycleService.stage < LifecycleStages.Rendered) {
            this._tasks.push({ unitId, subUnitId, threadIds });
            return;
        }

        const versions = new Map(threadIds.map((threadId) => {
            const key = this._syncKey(unitId, subUnitId, threadId);
            const version = ++this._nextSyncVersion;
            this._syncVersions.set(key, version);
            return [threadId, { key, version }] as const;
        }));
        const releaseVersions = () => versions.forEach(({ key, version }) => {
            if (this._syncVersions.get(key) === version) {
                this._syncVersions.delete(key);
            }
        });
        let comments: IBaseComment[] | false;
        try {
            comments = await this._dataSourceService.listThreadComments(unitId, subUnitId, threadIds);
        } catch (error) {
            releaseVersions();
            throw error;
        }
        if (!comments) {
            releaseVersions();
            return;
        }
        const deleteThreads = new Set(threadIds.filter((threadId) => {
            const request = versions.get(threadId)!;
            return this._syncVersions.get(request.key) === request.version;
        }));
        if (!deleteThreads.size) {
            releaseVersions();
            return;
        }
        const threadMap = this._ensureThreadMap(unitId, subUnitId);
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        comments.forEach((comment) => {
            if (!deleteThreads.has(comment.threadId)) {
                return;
            }

            this._replaceComment(unitId, subUnitId, comment);
            deleteThreads.delete(comment.threadId);
        });

        deleteThreads.forEach((id) => {
            threadMap.delete(id);
            commentMap.forEach((comment, commentId) => {
                if (comment.threadId === id) {
                    this._deleteComment(unitId, subUnitId, commentId);
                }
            });
        });
        releaseVersions();
    }

    addComment(unitId: string, subUnitId: string, origin: IThreadComment, shouldSync?: boolean) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        if (commentMap.has(origin.id)) {
            return true;
        }
        const { parentId, children = [], ...rest } = origin;
        const comment = {
            ...rest,
            parentId: parentId === origin.id ? undefined : parentId,
        };
        if (!comment.threadId) {
            comment.threadId = comment.parentId || comment.id;
        }
        this._invalidateSync(unitId, subUnitId, comment.threadId);

        const addCommentItem = (item: IThreadComment) => {
            commentMap.set(item.id, item);
            this._commentUpdate$.next({
                unitId,
                subUnitId,
                type: 'add',
                payload: item,
                isRoot: !item.parentId,
            });
        };

        addCommentItem(comment);
        const threadMap = this._ensureThreadMap(unitId, subUnitId);
        if (!comment.parentId) {
            threadMap.set(comment.threadId, comment);
            for (const child of children) {
                if (
                    child.id === comment.id
                    || child.threadId !== comment.threadId
                    || commentMap.has(child.id)
                ) {
                    continue;
                }
                addCommentItem({
                    ...child,
                    parentId: comment.id,
                    ref: '',
                } as IThreadComment);
            }
        }

        if (shouldSync) {
            this.syncThreadComments(unitId, subUnitId, [comment.threadId]);
        }
        return true;
    }

    updateComment(unitId: string, subUnitId: string, payload: IUpdateCommentPayload, silent?: boolean) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const oldComment = commentMap.get(payload.commentId);
        if (!oldComment) {
            return false;
        }
        this._invalidateSync(unitId, subUnitId, oldComment.threadId);

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
        return true;
    }

    updateCommentRef(unitId: string, subUnitId: string, payload: IUpdateCommentRefPayload, silent?: boolean) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const oldComment = commentMap.get(payload.commentId);
        if (!oldComment) {
            return false;
        }

        this._invalidateSync(unitId, subUnitId, oldComment.threadId);
        oldComment.ref = payload.ref;
        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'updateRef',
            payload,
            silent,
            threadId: oldComment.threadId,
        });
        return true;
    }

    resolveComment(unitId: string, subUnitId: string, commentId: string, resolved: boolean) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const oldComment = commentMap.get(commentId);
        if (!oldComment) {
            return false;
        }

        this._invalidateSync(unitId, subUnitId, oldComment.threadId);
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
        return true;
    }

    getComment(unitId: string, subUnitId: string, commentId: string) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        return commentMap.get(commentId) as IThreadComment | undefined;
    }

    getRootComment(unitId: string, subUnitId: string, threadId: string) {
        const threadMap = this._ensureThreadMap(unitId, subUnitId);
        return threadMap.get(threadId);
    }

    getThread(unitId: string, subUnitId: string, threadId: string): Nullable<IThreadInfo> {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const comments = Array.from(commentMap.values()).filter((comment) => comment.threadId === threadId);

        let root: IThreadComment | undefined;
        const children: IThreadComment[] = [];
        const relativeUsers = new Set<string>();

        for (const comment of comments) {
            if (!comment.parentId) {
                root = comment;
            } else {
                children.push(comment);
            }

            relativeUsers.add(comment.personId);
        }

        if (!root) {
            return undefined;
        }

        return {
            root,
            children,
            relativeUsers,
            unitId,
            subUnitId,
            threadId,
        };
    }

    getCommentWithChildren(unitId: string, subUnitId: string, commentId: string) {
        const comment = this.getComment(unitId, subUnitId, commentId);
        if (!comment) {
            return undefined;
        }
        return this.getThread(unitId, subUnitId, comment.threadId);
    }

    private _deleteComment(unitId: string, subUnitId: string, commentId: string) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const current = commentMap.get(commentId);
        if (!current) {
            return;
        }

        this._invalidateSync(unitId, subUnitId, current.threadId);
        commentMap.delete(commentId);

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
    }

    deleteThread(unitId: string, subUnitId: string, threadId: string) {
        this._invalidateSync(unitId, subUnitId, threadId);
        const threadMap = this._ensureThreadMap(unitId, subUnitId);
        threadMap.delete(threadId);

        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        commentMap.forEach((comment) => {
            if (comment.threadId === threadId) {
                this._deleteComment(unitId, subUnitId, comment.id);
            }
        });
    }

    deleteComment(unitId: string, subUnitId: string, commentId: string) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const current = commentMap.get(commentId);
        if (!current) {
            return true;
        }

        if (current.parentId) {
            this._deleteComment(unitId, subUnitId, commentId);
        } else {
            this.deleteThread(unitId, subUnitId, current.threadId);
        }

        return true;
    }

    deleteUnit(unitId: string) {
        const unitMap = this._commentsMap.get(unitId);
        unitMap?.forEach((subUnitMap, subUnitId) => {
            subUnitMap.forEach((comment) => {
                this.deleteComment(unitId, subUnitId, comment.id);
            });
        });
        this._commentsMap.delete(unitId);
        this._threadMap.delete(unitId);
        this._tasks = this._tasks.filter((task) => task.unitId !== unitId);
        const syncPrefix = `${unitId}\0`;
        this._syncVersions.forEach((_version, key) => {
            if (key.startsWith(syncPrefix)) {
                this._syncVersions.delete(key);
            }
        });
    }

    getUnit(unitId: string) {
        const unitMap = this._commentsMap.get(unitId);
        if (!unitMap) {
            return [];
        }

        const threads: IThreadInfo[] = [];

        unitMap.forEach((commentMap, subUnitId) => {
            const threadInfos = new Map<string, Omit<IThreadInfo, 'root'> & { root?: IThreadComment }>();
            commentMap.forEach((comment) => {
                let thread = threadInfos.get(comment.threadId);
                if (!thread) {
                    thread = {
                        unitId,
                        subUnitId,
                        threadId: comment.threadId,
                        children: [],
                        relativeUsers: new Set(),
                    };
                    threadInfos.set(comment.threadId, thread);
                }
                if (comment.parentId) {
                    thread.children.push(comment);
                } else {
                    thread.root = comment;
                }
                thread.relativeUsers.add(comment.personId);
            });
            threadInfos.forEach((thread) => {
                if (thread.root) {
                    threads.push(thread as IThreadInfo);
                }
            });
        });

        return threads;
    }

    getAll() {
        const all: { unitId: string; threads: IThreadInfo[] }[] = [];
        this._commentsMap.forEach((unitMap, unitId) => {
            all.push({
                unitId,
                threads: this.getUnit(unitId),
            });
        });

        return all;
    }

    query(query: IThreadCommentQuery = {}): IThreadInfo[] {
        const unitIds = query.unitIds ? new Set(query.unitIds) : null;
        const subUnitIds = query.subUnitIds ? new Set(query.subUnitIds) : null;
        const anchorKinds = query.anchorKinds ? new Set(query.anchorKinds) : null;
        const authorIds = query.authorIds ? new Set(query.authorIds) : null;

        return this.getAll().flatMap(({ unitId, threads }) => {
            if (unitIds && !unitIds.has(unitId)) {
                return [];
            }

            return threads.filter((thread) => {
                if (subUnitIds && !subUnitIds.has(thread.subUnitId)) {
                    return false;
                }
                if (query.resolved !== undefined && Boolean(thread.root.resolved) !== query.resolved) {
                    return false;
                }
                if (anchorKinds) {
                    const anchor = deserializeThreadCommentAnchor(thread.root.ref);
                    if (!anchor || !anchorKinds.has(anchor.kind)) {
                        return false;
                    }
                }
                if (authorIds && ![thread.root, ...thread.children].some((comment) => authorIds.has(comment.personId))) {
                    return false;
                }
                return true;
            });
        });
    }
}
