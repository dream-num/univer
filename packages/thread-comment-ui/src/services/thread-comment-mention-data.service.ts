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

import type { MentionProps } from '@univerjs/design';
import type { IThreadCommentMention } from '@univerjs/thread-comment';
import { createIdentifier } from '@wendellhu/redi';

export interface IThreadCommentMentionDataService {
    getMentions: (search: string) => Promise<IThreadCommentMention[]>;
    trigger: string;
    renderSuggestion?: MentionProps['renderSuggestion'];
}

export class ThreadCommentMentionDataService implements IThreadCommentMentionDataService {
    async getMentions(search: string) {
        return [];
    }

    trigger = '@';
}

export const IThreadCommentMentionDataService = createIdentifier<IThreadCommentMentionDataService>('thread-comment.mention-data.service');
