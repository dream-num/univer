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

import { EDITOR_ACTIVATED, FOCUSING_DOC } from '@univerjs/core';
import { HTML_CLIPBOARD_MIME_TYPE, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DOC_INTERNAL_FRAGMENT_MIME } from '../../../services/clipboard/internal-fragment';
import { DocClipboardController } from '../doc-clipboard.controller';

function createClipboardEvent(options: {
    html?: string;
    internalJson?: string;
    text?: string;
    items?: Array<{ type: string; getAsFile: () => File | null }>;
}) {
    const data = new Map([
        [HTML_CLIPBOARD_MIME_TYPE, options.html ?? ''],
        [DOC_INTERNAL_FRAGMENT_MIME, options.internalJson ?? ''],
        [PLAIN_TEXT_CLIPBOARD_MIME_TYPE, options.text ?? ''],
    ]);

    return {
        preventDefault: vi.fn(),
        clipboardData: {
            getData: vi.fn((type: string) => data.get(type) ?? ''),
            items: options.items ?? [],
        },
    };
}

function createController(options?: { focusingDoc?: boolean; editorActivated?: boolean; editorExists?: boolean }) {
    const onPaste$ = new Subject<any>();
    const legacyPaste = vi.fn();
    const controller = new DocClipboardController(
        { unitId: 'doc-1' } as never,
        {} as never,
        { legacyPaste } as never,
        { onPaste$ } as never,
        {
            getContextValue: vi.fn((key: string) => {
                if (key === FOCUSING_DOC) return options?.focusingDoc ?? true;
                if (key === EDITOR_ACTIVATED) return options?.editorActivated ?? false;
                return false;
            }),
        } as never,
        { getEditor: vi.fn(() => options?.editorExists ? {} : null) } as never
    );

    return { controller, onPaste$, legacyPaste };
}

describe('DocClipboardController', () => {
    it('prevents the native paste and forwards html, internal json, text and image files to legacy paste', () => {
        const imageFile = new File(['image'], 'image.png', { type: 'image/png' });
        const { controller, onPaste$, legacyPaste } = createController();
        const event = createClipboardEvent({
            html: '<p>Hello</p>',
            internalJson: '{"body":true}',
            text: 'Hello',
            items: [
                { type: 'image/png', getAsFile: () => imageFile },
                { type: 'text/plain', getAsFile: () => null },
            ],
        });

        onPaste$.next({ event });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(legacyPaste).toHaveBeenCalledWith({
            html: '<p>Hello</p>',
            internalJson: '{"body":true}',
            text: 'Hello',
            files: [imageFile],
        });

        controller.dispose();
    });

    it('drops pasted table html while editing and ignores paste events outside docs or editors', () => {
        const editing = createController({ editorExists: true });
        const tableEvent = createClipboardEvent({ html: '<table><tr><td>A</td></tr></table>', text: 'A' });

        editing.onPaste$.next({ event: tableEvent });

        expect(editing.legacyPaste).toHaveBeenCalledWith(expect.objectContaining({
            html: '',
            text: 'A',
        }));
        editing.controller.dispose();

        const inactive = createController({ focusingDoc: false, editorActivated: false });
        const inactiveEvent = createClipboardEvent({ text: 'Ignored' });

        inactive.onPaste$.next({ event: inactiveEvent });

        expect(inactiveEvent.preventDefault).not.toHaveBeenCalled();
        expect(inactive.legacyPaste).not.toHaveBeenCalled();
        inactive.controller.dispose();
    });
});
