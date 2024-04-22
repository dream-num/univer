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
import type { IUpdateCommentPayload } from '../commands/mutations/comment.mutation';

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
    payload: string[];
};

export class ThreadCommentModel {
    private _commentsMap: Map<string, Map<string, Map<string, IThreadComment>>> = new Map();
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

    ensureMap(unitId: string, subUnitId: string) {
        const commentMap = this._ensureCommentMap(unitId, subUnitId);

        return {
            commentMap,
        };
    }

    addComment(unitId: string, subUnitId: string, comment: IThreadComment) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);

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

    resolveComment(unitId: string, subUnitId: string, commentId: string, resolved: boolean) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        const oldComment = commentMap.get(commentId);
        if (!oldComment) {
            return false;
        }

        oldComment.resolved = resolved;
        return true;
    }

    deleteComment(unitId: string, subUnitId: string, commentIds: string[]) {
        const { commentMap } = this.ensureMap(unitId, subUnitId);
        commentIds.forEach((id) => {
            commentMap.delete(id);
        });

        this._commentUpdate$.next({
            unitId,
            subUnitId,
            type: 'delete',
            payload: commentIds,
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
            const deleteIds: string[] = [];
            subUnitMap.forEach((comment) => {
                deleteIds.push(comment.id);
            });

            this.deleteComment(unitId, subUnitId, deleteIds);
        });
    }
}
