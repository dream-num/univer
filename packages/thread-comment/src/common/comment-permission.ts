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

import type { IThreadComment } from '../types/interfaces/i-thread-comment';

/**
 * Boolean flag or per-comment callback. Omitted values and `true` keep the action allowed.
 */
export type ThreadCommentPermission = boolean | ((comment: IThreadComment) => boolean);

export interface IThreadCommentPermissions {
    /**
     * Whether existing comments can be edited.
     * @default true
     */
    edit?: ThreadCommentPermission;
    /**
     * Whether comments or whole threads can be deleted.
     * @default true
     */
    delete?: ThreadCommentPermission;
    /**
     * Whether threads can be resolved or reopened.
     * @default true
     */
    resolve?: ThreadCommentPermission;
    /**
     * Whether replies can be added to existing threads.
     * @default true
     */
    reply?: ThreadCommentPermission;
}

export function isThreadCommentPermissionAllowed(
    rule: ThreadCommentPermission | undefined,
    comment: IThreadComment
): boolean {
    if (rule === undefined) {
        return true;
    }
    if (typeof rule === 'function') {
        return rule(comment);
    }
    return rule;
}
