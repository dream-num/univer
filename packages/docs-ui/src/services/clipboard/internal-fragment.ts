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

import type { IDocumentData } from '@univerjs/core';
import { Tools } from '@univerjs/core';

export const DOC_INTERNAL_FRAGMENT_MIME = 'application/x-doc-fragment+json';
export const DOC_INTERNAL_FRAGMENT_COMMENT_PREFIX = 'univer-doc-fragment:';

export interface IDocInternalClipboardFragment {
    version: 1;
    kind: 'univer-doc-fragment';
    doc: Partial<IDocumentData>;
}

export function createInternalClipboardFragment(doc: Partial<IDocumentData>): string {
    return JSON.stringify({
        version: 1,
        kind: 'univer-doc-fragment',
        doc: Tools.deepClone(doc),
    } satisfies IDocInternalClipboardFragment);
}

export function parseInternalClipboardFragment(value?: string): Partial<IDocumentData> | null {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as Partial<IDocInternalClipboardFragment>;
        if (parsed?.version === 1 && parsed.kind === 'univer-doc-fragment' && parsed.doc?.body) {
            return parsed.doc as Partial<IDocumentData>;
        }
    } catch {
        return null;
    }

    return null;
}

export function embedInternalClipboardFragment(html: string, fragmentJson: string): string {
    return `<!--${DOC_INTERNAL_FRAGMENT_COMMENT_PREFIX}${encodeBase64(fragmentJson)}-->${html}`;
}

export function extractInternalClipboardFragmentFromHtml(html?: string): Partial<IDocumentData> | null {
    if (!html) {
        return null;
    }

    const escapedPrefix = DOC_INTERNAL_FRAGMENT_COMMENT_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = html.match(new RegExp(`<!--\\s*${escapedPrefix}([A-Za-z0-9+/=]+)\\s*-->`));
    if (!match) {
        return null;
    }

    return parseInternalClipboardFragment(decodeBase64(match[1]));
}

export function wrapClipboardHtml(fragmentHtml: string): string {
    return `<html><head><meta charset="utf-8"></head><body><!--StartFragment-->${fragmentHtml}<!--EndFragment--></body></html>`;
}

function encodeBase64(value: string): string {
    return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value: string): string {
    return decodeURIComponent(escape(atob(value)));
}
