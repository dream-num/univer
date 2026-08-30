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
import { convertClipboardRtfToPlainText } from '../rtf-to-plain-text';

describe('convertClipboardRtfToPlainText', () => {
    it('preserves Word text, line breaks, tabs, unicode, and escaped punctuation', () => {
        const rtf = String.raw`{\rtf1\ansi\uc1{\fonttbl{\f0 Calibri;}}Hello\tab Word\par \u20013?\u25991? \'93quote\'94 \\ \{ok\}}`;

        expect(convertClipboardRtfToPlainText(rtf)).toBe('Hello\tWord\n中文 “quote” \\ {ok}');
    });

    it('ignores non-text destinations and rejects non-RTF input', () => {
        expect(convertClipboardRtfToPlainText(String.raw`{\rtf1 Before{\pict abc123}After}`)).toBe('BeforeAfter');
        expect(convertClipboardRtfToPlainText('plain text')).toBe('');
    });
});
