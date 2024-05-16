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

import type { IDocumentBody } from '@univerjs/core';

export interface IThreadCommentMention {
    label: string;
    id: string;
    icon?: string;
}

export interface IThreadComment {
    id: string;
    ref: string;
    dT: string;
    updateT?: string;
    personId: string;
    parentId?: string;
    text: IDocumentBody;
    attachments?: string[];
    resolved?: boolean;
    updated?: boolean;
    unitId: string;
    subUnitId: string;
    mentions?: string[];
}
