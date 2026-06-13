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

import type { ThreadCommentTreeLocation } from '../ThreadCommentTree';
import { DOCS_COMMENT_EDITOR_UNIT_ID_KEY } from '@univerjs/core';

interface IGetThreadCommentEditorIdParams {
    location: ThreadCommentTreeLocation;
    unitId: string;
    subUnitId: string;
    commentId?: string;
    fallbackId: string;
}

export function getThreadCommentEditorId(params: IGetThreadCommentEditorIdParams) {
    const { location, unitId, subUnitId, commentId, fallbackId } = params;

    return `${DOCS_COMMENT_EDITOR_UNIT_ID_KEY}_${location}_${unitId}_${subUnitId}_${commentId || fallbackId}`;
}
