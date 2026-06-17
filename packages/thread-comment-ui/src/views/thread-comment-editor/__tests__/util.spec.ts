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

import { describe, expect, it } from 'vitest';
import { focusThreadCommentEditor } from '../util';

class TestEditorService {
    focusedEditorId = '';

    focus(editorId: string): void {
        this.focusedEditorId = editorId;
    }
}

class TestEditor {
    focused = false;

    focus(): void {
        this.focused = true;
    }
}

describe('focusThreadCommentEditor', () => {
    it('focuses the editor instance even when the editor service already tracks the id', () => {
        const editorId = 'comment-editor-id';
        const editorService = new TestEditorService();
        const editor = new TestEditor();

        focusThreadCommentEditor(editorService, editorId, editor);

        expect(editorService.focusedEditorId).toBe(editorId);
        expect(editor.focused).toBe(true);
    });
});
