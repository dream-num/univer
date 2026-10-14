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
import { CustomRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { focusThreadCommentEditor, transformDocument2TextNodes, transformTextNodes2Document } from '../util';

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

describe('comment text conversion', () => {
    it('preserves mixed text, mentions and hyperlink metadata through a round trip', () => {
        const text = 'Hello @Ada see website.';
        const body: IDocumentBody = {
            dataStream: `${text}\r\n`,
            paragraphs: [{ startIndex: text.length, paragraphId: 'para_comment_round_trip' }],
            customRanges: [
                {
                    rangeId: 'person-1',
                    rangeType: CustomRangeType.MENTION,
                    startIndex: 6,
                    endIndex: 9,
                    wholeEntity: true,
                    properties: {},
                },
                {
                    rangeId: 'link-1',
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 15,
                    endIndex: 21,
                    wholeEntity: false,
                    properties: { url: 'https://univer.ai', textStyleMode: 'text' },
                },
            ],
        };

        const [nodes] = transformDocument2TextNodes(body);
        expect(nodes.map((node) => node.type)).toEqual(['text', 'mention', 'text', 'hyperlink', 'text']);
        const restored = transformTextNodes2Document(nodes);
        expect(restored.dataStream).toBe(body.dataStream);
        expect(restored.customRanges).toEqual(body.customRanges);
    });

    it('keeps paragraph boundaries and paragraph-relative hyperlink offsets', () => {
        const nodes = transformDocument2TextNodes({
            dataStream: 'Intro\rRead site\r\n',
            paragraphs: [
                { startIndex: 5, paragraphId: 'para_comment_intro' },
                { startIndex: 15, paragraphId: 'para_comment_link' },
            ],
            customRanges: [{
                rangeId: 'link-1',
                rangeType: CustomRangeType.HYPERLINK,
                startIndex: 11,
                endIndex: 14,
                properties: { url: 'https://univer.ai' },
            }],
        });

        expect(nodes[0]).toEqual([{ type: 'text', content: 'Intro' }]);
        expect(nodes[1]).toContainEqual(expect.objectContaining({ type: 'hyperlink', content: 'site' }));
        expect(transformTextNodes2Document(nodes[1]).customRanges?.[0]).toMatchObject({ startIndex: 5, endIndex: 8 });
    });

    it('renders unsupported custom range kinds as plain text', () => {
        const nodes = transformDocument2TextNodes({
            dataStream: 'field\r\n',
            paragraphs: [{ startIndex: 5, paragraphId: 'para_comment_unknown_range' }],
            customRanges: [{ rangeId: 'unknown', rangeType: 999, startIndex: 0, endIndex: 4 }],
        });

        expect(nodes[0].every((node) => node.type === 'text')).toBe(true);
        expect(nodes[0].map((node) => node.content).join('')).toBe('field');
    });
});
