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

import { Subject } from 'rxjs';
import type { IThreadComment } from '../types/interfaces/i-thread-comment';
import type { IUpdateCommentPayload, IUpdateCommentRefPayload } from '../commands/mutations/comment.mutation';

export type CommentUpdate = {
    unitId: string;
    subUnitId: string;
    type: 'add';
    payload: IThreadComment;
} | {
    unitId: string;
    subUnitId: string;
    type: 'update';
    payload: IUpdateCommentPayload;
} | {
    unitId: string;
    subUnitId: string;
    type: 'delete';
    payload: {
        commentId: string;
        isRoot: boolean;
    };
} | {
    unitId: string;
    subUnitId: string;
    type: 'updateRef';
    payload: IUpdateCommentRefPayload;
};

export class ThreadCommentModel {
    private _commentsMap: Map<string, Map<string, Map<string, IThreadComment>>> = new Map();
    private _commentsChildrenMap: Map<string, Map<string, Map<string, string[]>>> = new Map();
    private _commentUpdate$ = new Subject<CommentUpdate>();

    commentUpdate$ = this._commentUpdate$.asObservable();

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

    private _ensureCommentChildrenMap(unitId: string, subUnitId: string) {
        let unitMap = this._commentsChildrenMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._commentsChildrenMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    ensureMap(unitId: string, subUnitId: string) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);
        const commentChildrenMap = this._ensureCommentChildrenMap(unitId, subUnitId);

        return {
            commentMap,
            commentChildrenMap,
        };
    }

    addComment(unitId: string, subUnitId: string, comment: IThreadComment) {
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);

        const parentId = comment.parentId;
        if (parentId) {
            let children = commentChildrenMap.get(parentId);
            if (!children) {
                children = [];
            }
            children.push(comment.id);
            commentChildrenMap.set(parentId, children);
        }

        commentMap.set(comment.id, comment);
        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'add',
            payload: comment,
        });
    }

    updateComment(unitId: string, subUnitId: string, payload: IUpdateCommentPayload) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap.get(payload.commentId);
        if (!oldComment) {
            return false;
        }
        oldComment.updated = true;
        oldComment.text = payload.text;
        oldComment.attachments = payload.attachment;

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'update',
            payload,
        });
        return true;
    }

    updateCommentRef(unitId: string, subUnitId: string, payload: IUpdateCommentRefPayload) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap.get(payload.commentId);
        if (!oldComment) {
            return false;
        }

        oldComment.ref = payload.ref;

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'updateRef',
            payload,
        });
        return true;
    }

    resolveComment(unitId: string, subUnitId: string, commentId: string, resolved: boolean) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap.get(commentId);
        if (!oldComment) {
            return false;
        }

        oldComment.resolved = resolved;
        return true;
    }

    getComment(unitId: string, subUnitId: string, commentId: string) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        return commentMap.get(commentId);
    }

    getCommentWithChildren(unitId: string, subUnitId: string, commentId: string) {
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);
        const current = commentMap.get(commentId);
        if (!current) {
            return undefined;
        }

        const children = commentChildrenMap.get(commentId) ?? [];
        const childrenComments = children?.map((childId) => commentMap.get(childId)!);

        return {
            root: current,
            children: childrenComments,
        };
    }

    deleteComment(unitId: string, subUnitId: string, commentId: string) {
        const { commentMap, commentChildrenMap } = this.ensureMap(unitId, subUnitId);
        const current = commentMap.get(commentId);
        if (!current) {
            return;
        }

        if (current.parentId) {
            const children = commentChildrenMap.get(current.parentId);
            if (!children) {
                return;
            }
            const index = children.indexOf(commentId);
            children.splice(index, 1);
            commentMap.delete(commentId);
        } else {
            const children = commentChildrenMap.get(commentId);
            if (!children) {
                return;
            }
            commentMap.delete(commentId);
            commentChildrenMap.delete(commentId);
            children.forEach((childId) => {
                commentMap.delete(childId);
            });
        }

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'delete',
            payload: {
                commentId,
                isRoot: !current.parentId,
            },
        });
    }

    getUnit(unitId: string) {
        const unitMap = this._commentsMap.get(unitId);
        if (!unitMap) {
            return [];
        }

        return Array.from(unitMap.entries()).map(([subUnitId, subUnitMap]) => [subUnitId, Array.from(subUnitMap.values())] as const);
    }

    deleteUnit(unitId: string) {
        const unitMap = this._commentsMap.get(unitId);
        if (!unitMap) {
            return;
        }


        unitMap.forEach((subUnitMap, subUnitId) => {
            subUnitMap.forEach((comment) => {
                this.deleteComment(unitId, subUnitId, comment.id);
            });
        });
    }
}
