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

import { Injector } from '@univerjs/core';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { DocThreadCommentService } from '../doc-thread-comment.service';

class TestSidebarService {}

class TestThreadCommentPanelService {}

describe('DocThreadCommentService', () => {
    it('should track adding comment lifecycle', () => {
        const injector = new Injector();
        injector.add([ISidebarService, { useClass: TestSidebarService }]);
        injector.add([ThreadCommentPanelService, { useClass: TestThreadCommentPanelService }]);
        injector.add([DocThreadCommentService]);
        const service = injector.get(DocThreadCommentService);

        expect(service.addingComment).toBeUndefined();

        const comment = { id: 'c1', startOffset: 1, endOffset: 2 };
        service.startAdd(comment as any);
        expect(service.addingComment).toEqual(comment);

        service.endAdd();
        expect(service.addingComment).toBeUndefined();

        service.dispose();
    });
});
