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

export type ThreadCommentJSON = { id: string } & Partial<Omit<IThreadComment, 'id'>>;

export interface IThreadCommentDataSourceService {
    addComment: (comment: IThreadComment) => Promise<IThreadComment>;
    updateComment: (comment: IThreadComment) => Promise<boolean>;
    deleteComment: (commentId: string) => Promise<boolean>;
    deleteCommentBatch: (commentIds: string[]) => Promise<boolean>;
    loadFormSnapshot: (unitComments: Record<string, ThreadCommentJSON[]>) => Promise<Record<string, IThreadComment[]>>;
    saveToSnapshot: (unitComments: Record<string, IThreadComment[]>) => Record<string, ThreadCommentJSON[]>;
}

/**
 * Preserve for import async comment system
 */
export class ThreadCommentDataSourceService implements IThreadCommentDataSourceService {
    async addComment(comment: IThreadComment) {
        return comment;
    }

    async updateComment(_comment: IThreadComment) {
        return true;
    }

    async deleteComment(_commentId: string) {
        return true;
    }

    async deleteCommentBatch(_commentIds: string[]) {
        return true;
    }

    async loadFormSnapshot(unitComments: Record<string, ThreadCommentJSON[]>) {
        return unitComments as Record<string, IThreadComment[]>;
    }

    saveToSnapshot(unitComments: Record<string, IThreadComment[]>) {
        return unitComments;
    }
}

export const IThreadCommentDataSourceService = createIdentifier<IThreadCommentDataSourceService>('univer.thread-comment.data-source-service');
