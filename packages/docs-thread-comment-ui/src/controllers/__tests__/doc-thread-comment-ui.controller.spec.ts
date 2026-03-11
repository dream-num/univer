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

import { describe, expect, it, vi } from 'vitest';

import { DocThreadCommentPanel } from '../../views/doc-thread-comment-panel';
import { DocThreadCommentUIController } from '../doc-thread-comment-ui.controller';

describe('DocThreadCommentUIController', () => {
    it('should register commands, menus and components', () => {
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const mergeMenu = vi.fn();
        const registerComponent = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new DocThreadCommentUIController(
            { registerCommand } as any,
            { mergeMenu } as any,
            { register: registerComponent } as any
        );

        expect(registerCommand).toHaveBeenCalled();
        expect(mergeMenu).toHaveBeenCalled();
        expect(registerComponent).toHaveBeenCalledWith(DocThreadCommentPanel.componentKey, DocThreadCommentPanel);

        controller.dispose();
    });
});
