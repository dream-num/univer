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

import type { IDocumentData, IParagraphStyle, ITextStyle } from '@univerjs/core';
import { BuildTextUtils, DataStreamTreeTokenType, Tools } from '@univerjs/core';

export type DocPasteMode = 'source' | 'destination' | 'text';

export interface IDocPasteStyle {
    textStyle: ITextStyle;
    paragraphStyle?: IParagraphStyle;
}

export const DOC_PASTE_OPTIONS = [
    { value: 'source', label: 'docs-ui.pasteOptions.source' },
    { value: 'destination', label: 'docs-ui.pasteOptions.destination' },
    { value: 'text', label: 'docs-ui.pasteOptions.text' },
] as const;

export function getClipboardPlainText(doc: Partial<IDocumentData>): string {
    const token = DataStreamTreeTokenType;
    return (doc.body?.dataStream ?? '')
        .split(`${token.TABLE_CELL_END}${token.TABLE_CELL_START}`)
        .join('\t')
        .split(`${token.TABLE_ROW_END}${token.TABLE_ROW_START}`)
        .join('\n')
        .replace(/\r\n/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

export function applyDocPasteMode(
    source: Partial<IDocumentData>,
    mode: DocPasteMode,
    style: IDocPasteStyle,
    text?: string
): Partial<IDocumentData> {
    if (mode === 'source') {
        return Tools.deepClone(source);
    }
    let doc: Partial<IDocumentData>;
    if (mode === 'text') {
        const plainText = source.body?.tables?.length
            ? getClipboardPlainText(source)
            : text ?? getClipboardPlainText(source);
        doc = { body: BuildTextUtils.transform.fromPlainText(plainText) };
    } else {
        doc = Tools.deepClone(source);
    }
    const body = doc.body;
    if (!body) {
        return doc;
    }
    const sourceRuns = [...body.textRuns ?? []].sort((a, b) => a.st - b.st);
    const boundaries = [...new Set([0, body.dataStream.length, ...sourceRuns.flatMap(({ st, ed }) => [st, ed])])]
        .filter((offset) => offset >= 0 && offset <= body.dataStream.length)
        .sort((a, b) => a - b);
    let runIndex = 0;
    body.textRuns = boundaries.slice(0, -1).map((st, index) => {
        const ts = Tools.deepClone(style.textStyle);
        while (runIndex < sourceRuns.length && sourceRuns[runIndex].ed <= st) {
            runIndex++;
        }
        const run = sourceRuns[runIndex];
        const original = run && run.st <= st ? run.ts : undefined;
        if (mode === 'destination' && original) {
            for (const key of ['bl', 'it', 'ul', 'st', 'va'] as const) {
                if (original[key] !== undefined) {
                    Object.assign(ts, { [key]: original[key] });
                }
            }
        }
        return { st, ed: boundaries[index + 1], ts };
    });
    body.paragraphs?.forEach((paragraph) => {
        paragraph.paragraphStyle = Tools.deepClone(style.paragraphStyle ?? {});
        delete paragraph.paragraphStyle.headingId;
    });
    if (mode === 'text') {
        delete body.customRanges;
    }
    return doc;
}
