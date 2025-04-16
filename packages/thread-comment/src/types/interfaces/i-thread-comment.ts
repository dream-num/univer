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

import type { IDocumentBody } from '@univerjs/core';

export interface IThreadCommentMention {
    label: string;
    id: string;
    icon?: string;
}

export interface IBaseComment {
    id: string;
    threadId: string;
    dT: string;
    updateT?: string;
    personId: string;
    text: IDocumentBody;
    attachments?: string[];
    updated?: boolean;
    mentions?: string[];
    parentId?: string;
    resolved?: boolean;
    unitId: string;
    subUnitId: string;
    children?: IBaseComment[];
}

export interface IThreadComment extends IBaseComment {
    ref: string;
}
