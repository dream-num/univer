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

import { FEnum } from '@univerjs/core/facade';
import { ThreadCommentAnchorKind } from '@univerjs/thread-comment';

export interface IFThreadCommentEnumMixin {
    /**
     * Stable product anchor kinds used when creating or filtering comments.
     * @example
     * ```ts
     * const kind = univerAPI.Enum.ThreadCommentAnchorKind.BOARD_ELEMENT;
     * const comments = univerAPI.getComments({ anchorKinds: [kind] });
     * ```
     */
    ThreadCommentAnchorKind: typeof ThreadCommentAnchorKind;
}

export class FThreadCommentEnumMixin extends FEnum implements IFThreadCommentEnumMixin {
    /** @inheritdoc */
    override get ThreadCommentAnchorKind(): typeof ThreadCommentAnchorKind {
        return ThreadCommentAnchorKind;
    }
}

FEnum.extend(FThreadCommentEnumMixin);

declare module '@univerjs/core/facade' {
    interface FEnum extends IFThreadCommentEnumMixin {}
}
