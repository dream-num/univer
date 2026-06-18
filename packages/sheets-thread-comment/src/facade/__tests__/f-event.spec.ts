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

import { FEventName } from '@univerjs/core/facade';
import { describe, expect, it } from 'vitest';
import { FSheetsThreadCommentEventNameMixin } from '../f-event';

describe('FSheetsThreadCommentEventNameMixin', () => {
    it('adds thread-comment event names to facade event names', () => {
        const eventName = Object.create(FSheetsThreadCommentEventNameMixin.prototype) as FSheetsThreadCommentEventNameMixin;
        const extended = new FEventName();

        expect(eventName.CommentAdded).toBe('CommentAdded');
        expect(eventName.BeforeCommentAdd).toBe('BeforeCommentAdd');
        expect(eventName.CommentUpdated).toBe('CommentUpdated');
        expect(eventName.BeforeCommentUpdate).toBe('BeforeCommentUpdate');
        expect(eventName.CommentDeleted).toBe('CommentDeleted');
        expect(eventName.BeforeCommentDelete).toBe('BeforeCommentDelete');
        expect(eventName.CommentResolved).toBe('CommentResolved');
        expect(eventName.BeforeCommentResolve).toBe('BeforeCommentResolve');
        expect(extended.CommentAdded).toBe('CommentAdded');
        expect(extended.BeforeCommentResolve).toBe('BeforeCommentResolve');
    });
});
