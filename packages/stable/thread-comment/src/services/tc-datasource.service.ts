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
import type { IBaseComment, IThreadComment } from '../types/interfaces/i-thread-comment';
import { createIdentifier, Disposable } from '@univerjs/core';

export type ThreadCommentJSON = {
    id: string;
    threadId: string;
    ref: string;
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
    resolveComment: (comment: IThreadComment) => Promise<Success>;
    /**
     * handler for delete-comment, throw error means fail and stop the process.
     */
    deleteComment: (unitId: string, subUnitId: string, threadId: string, commentId: string,) => Promise<Success>;
    /**
     * handler for batch-fetch-comment, throw error means fail and stop the process.
     */
    listComments: (unitId: string, subUnitId: string, threadId: string[]) => Promise<IBaseComment[]>;
    saveCommentToSnapshot: (comment: IThreadComment) => ThreadCommentJSON;
}

export interface IThreadCommentDataSourceService {
    dataSource: Nullable<IThreadCommentDataSource>;

    /**
     * should sync update mutations to collaboration-server
     */
    syncUpdateMutationToColla: boolean;

    /**
     * handler for add-comment, throw error means fail and stop the process.
     */
    addComment: (comment: IThreadComment) => Promise<IThreadComment>;
    /**
     * handler for update-comment, throw error means fail and stop the process.
     */
    updateComment: (comment: IThreadComment) => Promise<Success>;
    /**
     * handler for resolve-comment, throw error means fail and stop the process.
     */
    resolveComment: (comment: IThreadComment) => Promise<Success>;
    /**
     * handler for delete-comment, throw error means fail and stop the process.
     */
    deleteComment: (unitId: string, subUnitId: string, threadId: string, commentId: string) => Promise<Success>;
    saveToSnapshot: (unitComments: Record<string, IThreadComment[]>, unitId: string) => Record<string, ThreadCommentJSON[]>;
    getThreadComment: (unitId: string, subUnitId: string, threadId: string) => Promise<Nullable<IBaseComment>>;
    listThreadComments: (unitId: string, subUnitId: string, threadId: string[]) => Promise<IBaseComment[] | false>;
}

/**
 * Preserve for import async comment system
 */
export class ThreadCommentDataSourceService extends Disposable implements IThreadCommentDataSourceService {
    private _dataSource: Nullable<IThreadCommentDataSource> = null;
    syncUpdateMutationToColla = true;

    set dataSource(dataSource: Nullable<IThreadCommentDataSource>) {
        this._dataSource = dataSource;
    }

    get dataSource() {
        return this._dataSource;
    }

    constructor() {
        super();
    }

    async getThreadComment(unitId: string, subUnitId: string, threadId: string): Promise<Nullable<IBaseComment>> {
        if (this._dataSource) {
            const comments = await this._dataSource.listComments(unitId, subUnitId, [threadId]);
            return comments[0];
        }

        return null;
    }

    async addComment(comment: IThreadComment) {
        if (this._dataSource) {
            return this._dataSource.addComment(comment);
        }
        return { ...comment, threadId: comment.threadId ?? comment.id };
    }

    async updateComment(comment: IThreadComment) {
        if (this._dataSource) {
            return this._dataSource.updateComment(comment);
        }
        return true;
    }

    async resolveComment(comment: IThreadComment) {
        if (this._dataSource) {
            return this._dataSource.resolveComment(comment);
        }
        return true;
    }

    async deleteComment(unitId: string, subUnitId: string, threadId: string, commentId: string) {
        if (this._dataSource) {
            return this._dataSource.deleteComment(unitId, subUnitId, threadId, commentId);
        }
        return true;
    }

    async listThreadComments(unitId: string, subUnitId: string, threadIds: string[]) {
        if (this.dataSource) {
            return this.dataSource.listComments(unitId, subUnitId, threadIds);
        }

        return false;
    }

    saveToSnapshot(unitComments: Record<string, IThreadComment[]>, unitId: string) {
        if (this._dataSource) {
            const map: Record<string, ThreadCommentJSON[]> = {};
            Object.keys(unitComments).forEach((subUnitId) => {
                const comments = unitComments[subUnitId];
                map[subUnitId] = comments.map(this.dataSource!.saveCommentToSnapshot);
            });
            return map;
        }

        return unitComments;
    }
}

export const IThreadCommentDataSourceService = createIdentifier<IThreadCommentDataSourceService>('univer.thread-comment.data-source-service');
