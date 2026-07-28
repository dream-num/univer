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

import { FWorkbook } from '@univerjs/sheets/facade';
import { ThreadCommentModel } from '@univerjs/thread-comment';
import { FThreadComment } from './f-thread-comment';

/**
 * @ignore
 */
export interface IFWorkbookSheetsThreadCommentMixin {
    /**
     * Get all comments in the current workbook
     * @returns {FThreadComment[]} All comments in the current workbook
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const comments = fWorkbook.getComments();
     * comments.forEach((comment) => {
     *   const isRoot = comment.getIsRoot();
     *
     *   if (isRoot) {
     *     console.log('root comment:', comment.getCommentData());
     *
     *     const replies = comment.getReplies();
     *     replies.forEach((reply) => {
     *       console.log('reply comment:', reply.getCommentData());
     *     });
     *   }
     * });
     * ```
     */
    getComments(): FThreadComment[];

    /**
     * Clear all comments in the current workbook
     * @returns {Promise<boolean>} Whether the comments are cleared successfully.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const result = await fWorkbook.clearComments();
     * console.log(result);
     * ```
     */
    clearComments(): Promise<boolean>;
}

/**
 * @ignore
 */
export class FWorkbookSheetsThreadCommentMixin extends FWorkbook implements IFWorkbookSheetsThreadCommentMixin {
    declare _threadCommentModel: ThreadCommentModel;

    /**
     * @ignore
     */
    override _initialize(): void {
        Object.defineProperty(this, '_threadCommentModel', {
            get() {
                return this._injector.get(ThreadCommentModel);
            },
        });
    }

    override getComments(): FThreadComment[] {
        return this._threadCommentModel.getUnit(this._workbook.getUnitId()).map((i) => this._injector.createInstance(FThreadComment, i.root));
    }

    override clearComments(): Promise<boolean> {
        const comments = this.getComments();
        const promises = comments.map((comment) => comment.deleteAsync());

        return Promise.all(promises).then(() => true);
    }
}

FWorkbook.extend(FWorkbookSheetsThreadCommentMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsThreadCommentMixin {}
}
