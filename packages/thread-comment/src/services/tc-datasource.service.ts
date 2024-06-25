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

import { createIdentifier } from '@wendellhu/redi';
import type { IThreadComment } from '../types/interfaces/i-thread-comment';
import { Disposable, Nullable } from '@univerjs/core';

export type ThreadCommentJSON = {
    id: string;
    threadId: string;
    ref: string
} & Partial<Omit<IThreadComment, 'id' | 'threadId' | 'ref'>>;

type Success = boolean;


export interface IThreadCommentDataSource {
    /**
     * handler for add-comment, throw error means fail and stop the process.
     */
    addComment: (comment: IThreadComment) => Promise<IThreadComment>;
    /**
     * handler for update-comment, throw error means fail and stop the process.
     */
    updateComment: (comment: IThreadComment) => Promise<Success>;
    /**
     * handler for delete-comment, throw error means fail and stop the process.
     */
    deleteComment: (commentId: string, threadId: string, unitId: string, subUnitId: string) => Promise<Success>;
    /**
     * handler for batch-delete-comment, throw error means fail and stop the process.
     */
    deleteCommentBatch: (commentIds: string[], threadId: string, unitId: string, subUnitId: string) => Promise<Success>;
    /**
     * handler for batch-fetch-comment, throw error means fail and stop the process.
     */
    listComments: (commentIds: ThreadCommentJSON[], unitId: string, subUnitId: string) => Promise<IThreadComment[]>;
    saveCommentToSnapshot: (comment: IThreadComment) => ThreadCommentJSON;
}


export interface IThreadCommentDataSourceService {
    dataSource: Nullable<IThreadCommentDataSource>;

    /**
     * should sync updates to ot-server
     */
    syncUpdates: boolean

    /**
     * handler for add-comment, throw error means fail and stop the process.
     */
    addComment: (comment: IThreadComment) => Promise<IThreadComment>;
    /**
    * handler for update-comment, throw error means fail and stop the process.
    */
    updateComment: (comment: IThreadComment) => Promise<Success>;
    /**
    * handler for delete-comment, throw error means fail and stop the process.
    */
    deleteComment: (commentId: string, threadId: string, unitId: string, subUnitId: string) => Promise<Success>;
    /**
    * handler for batch-delete-comment, throw error means fail and stop the process.
    */
    deleteCommentBatch: (commentIds: string[], threadId: string, unitId: string, subUnitId: string) => Promise<Success>;
    loadFormSnapshot: (unitComments: Record<string, ThreadCommentJSON[]>, unitId: string) => Promise<Record<string, IThreadComment[]>>;
    saveToSnapshot: (unitComments: Record<string, IThreadComment[]>, unitId: string) => Record<string, ThreadCommentJSON[]>;
}

/**
 * Preserve for import async comment system
 */
export class ThreadCommentDataSourceService extends Disposable implements IThreadCommentDataSourceService {
    private _dataSource: Nullable<IThreadCommentDataSource> = null;
    syncUpdates = true;

    set dataSource(dataSource: Nullable<IThreadCommentDataSource>) {
        this._dataSource = dataSource;
    }

    get dataSource() {
        return this._dataSource;
    }

    async addComment(comment: IThreadComment) {
        if (this._dataSource) {
            return this._dataSource.addComment(comment);
        }
        return comment;
    }

    async updateComment(comment: IThreadComment) {
        if (this._dataSource) {
            return this._dataSource.updateComment(comment);
        }
        return true;
    }

    async deleteComment(commentId: string, threadId: string, unitId: string, subUnitId: string) {
        if (this._dataSource) {
            return this._dataSource.deleteComment(commentId, threadId, unitId, subUnitId);
        }
        return true;
    }

    async deleteCommentBatch(commentIds: string[], threadId: string, unitId: string, subUnitId: string) {
        if (this._dataSource) {
            return this._dataSource.deleteCommentBatch(commentIds, threadId, unitId, subUnitId);
        }
        return true;
    }

    async loadFormSnapshot(unitComments: Record<string, ThreadCommentJSON[]>, unitId: string) {
        if (this._dataSource) {
            const serverUnitComments = await Promise.all(
                Object.keys(unitComments)
                    .map(subUnitId => [subUnitId, unitComments[subUnitId]] as const)
                    .map(async ([subUnitId, comments]) => {
                        const res = await this._dataSource!.listComments(comments, unitId, subUnitId);
                        return [subUnitId, res] as const;
                    })
            )
            const map: Record<string, IThreadComment[]> = {};
            serverUnitComments.forEach(([subUnitId, comments]) => {
                map[subUnitId] = comments;
            })
            return map;
        }

        return unitComments as Record<string, IThreadComment[]>;
    }

    saveToSnapshot(unitComments: Record<string, IThreadComment[]>, unitId: string) {

        if (this._dataSource) {
            const map: Record<string, ThreadCommentJSON[]> = {};
            Object.keys(unitComments).forEach(subUnitId => {
                const comments = unitComments[subUnitId];
                map[subUnitId] = comments.map(this.dataSource!.saveCommentToSnapshot);
            });
            return map;
        }

        return unitComments;
    }
}

export const IThreadCommentDataSourceService = createIdentifier<IThreadCommentDataSourceService>('univer.thread-comment.data-source-service');
