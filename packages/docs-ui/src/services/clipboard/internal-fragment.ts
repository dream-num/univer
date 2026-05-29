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
import { generateRandomId, Tools } from '@univerjs/core';

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

export function createInternalClipboardDocData(doc: IDocumentData): Partial<IDocumentData> {
    const body = Tools.deepClone(doc.body);
    const internalDocData: Partial<IDocumentData> = { body };

    if (body?.tables?.length && doc.tableSource) {
        internalDocData.tableSource = {};
        body.tables.forEach((tableRange) => {
            const table = doc.tableSource?.[tableRange.tableId];
            if (table) {
                internalDocData.tableSource![tableRange.tableId] = Tools.deepClone(table);
            }
        });
    }

    const listTypes = new Set(body?.paragraphs?.map((paragraph) => paragraph.bullet?.listType).filter(Boolean));
    if (listTypes.size && doc.lists) {
        internalDocData.lists = {};
        listTypes.forEach((listType) => {
            const list = doc.lists?.[String(listType)];
            if (list) {
                internalDocData.lists![String(listType)] = Tools.deepClone(list);
            }
        });
    }

    if (body?.customBlocks?.length) {
        internalDocData.drawings = {};

        for (const block of body.customBlocks) {
            const { blockId } = block;
            const drawing = doc.drawings?.[blockId];

            if (drawing) {
                const id = generateRandomId(6);

                block.blockId = id;
                internalDocData.drawings[id] = {
                    ...Tools.deepClone(drawing),
                    drawingId: id,
                };
            }
        }
    }

    return internalDocData;
}

export function createInternalClipboardDocDataList(docs: IDocumentData[]): Partial<IDocumentData> | null {
    if (docs.length === 0) {
        return null;
    }

    if (docs.length === 1) {
        return createInternalClipboardDocData(docs[0]);
    }

    const merged: Partial<IDocumentData> = {
        body: {
            dataStream: '',
        },
    };

    for (const doc of docs) {
        const part = createInternalClipboardDocData(doc);
        const body = part.body;
        if (!body) {
            continue;
        }

        const offset = merged.body!.dataStream.length;
        merged.body!.dataStream += body.dataStream ?? '';
        appendOffsetRanges(merged.body!, body, offset);

        if (part.tableSource) {
            merged.tableSource ??= {};
            Object.assign(merged.tableSource, part.tableSource);
        }

        if (part.lists) {
            merged.lists ??= {};
            Object.assign(merged.lists, part.lists);
        }

        if (part.drawings) {
            merged.drawings ??= {};
            Object.assign(merged.drawings, part.drawings);
        }
    }

    return merged.body?.dataStream ? merged : null;
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

const WORD_CLIPBOARD_HTML_HEAD = `<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Normal</w:View><w:Zoom>0</w:Zoom><w:TrackFormatting/><w:DoNotPromoteQF/></w:WordDocument></xml><![endif]-->
<style><!--
p.MsoNormal, li.MsoNormal, div.MsoNormal{margin:0cm;margin-bottom:8.0pt;line-height:115%;font-size:11.0pt;font-family:Arial,sans-serif;mso-pagination:widow-orphan;}
p.UniverNormal, li.UniverNormal, div.UniverNormal, p.univernormal, li.univernormal, div.univernormal{mso-style-name:univernormal;margin-top:0cm;margin-right:0cm;margin-bottom:8.0pt;margin-left:0cm;line-height:115%;mso-pagination:widow-orphan;font-size:11.0pt;font-family:Arial,sans-serif;mso-bidi-font-family:Arial;}
p.UniverHeading, li.UniverHeading, div.UniverHeading, p.univerheading, li.univerheading, div.univerheading{mso-style-name:univerheading;margin-top:6.0pt;margin-right:0cm;margin-bottom:4.0pt;margin-left:0cm;mso-pagination:widow-orphan;font-size:12.0pt;font-family:Arial,sans-serif;mso-bidi-font-family:Arial;font-weight:bold;}
table.MsoNormalTable, table.UniverTable{mso-style-name:"Normal Table";mso-tstyle-rowband-size:0;mso-tstyle-colband-size:0;mso-style-noshow:yes;mso-style-priority:99;mso-style-parent:"";mso-padding-alt:0cm 5.4pt 0cm 5.4pt;mso-para-margin:0cm;mso-pagination:widow-orphan;font-size:11.0pt;font-family:Arial,sans-serif;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
td.UniverTableCell, th.UniverTableCell{mso-padding-alt:0cm 5.4pt 0cm 5.4pt;}
--></style>
</head>`;

export function wrapClipboardHtml(fragmentHtml: string): string {
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">${WORD_CLIPBOARD_HTML_HEAD}<body lang="ZH-CN" style="tab-interval:21.0pt;word-wrap:break-word"><!--StartFragment-->${fragmentHtml}<!--EndFragment--></body></html>`;
}

function appendOffsetRanges(target: NonNullable<Partial<IDocumentData>['body']>, source: NonNullable<Partial<IDocumentData>['body']>, offset: number): void {
    if (source.textRuns?.length) {
        target.textRuns ??= [];
        target.textRuns.push(...source.textRuns.map((textRun) => ({
            ...textRun,
            st: textRun.st + offset,
            ed: textRun.ed + offset,
        })));
    }

    if (source.paragraphs?.length) {
        target.paragraphs ??= [];
        target.paragraphs.push(...source.paragraphs.map((paragraph) => ({
            ...paragraph,
            startIndex: paragraph.startIndex + offset,
        })));
    }

    if (source.sectionBreaks?.length) {
        target.sectionBreaks ??= [];
        target.sectionBreaks.push(...source.sectionBreaks.map((sectionBreak) => ({
            ...sectionBreak,
            startIndex: sectionBreak.startIndex + offset,
        })));
    }

    if (source.tables?.length) {
        target.tables ??= [];
        target.tables.push(...source.tables.map((table) => ({
            ...table,
            startIndex: table.startIndex + offset,
            endIndex: table.endIndex + offset,
        })));
    }

    if (source.blockRanges?.length) {
        target.blockRanges ??= [];
        target.blockRanges.push(...source.blockRanges.map((blockRange) => ({
            ...blockRange,
            startIndex: blockRange.startIndex + offset,
            endIndex: blockRange.endIndex + offset,
        })));
    }

    if (source.customRanges?.length) {
        target.customRanges ??= [];
        target.customRanges.push(...source.customRanges.map((customRange) => ({
            ...customRange,
            startIndex: customRange.startIndex + offset,
            endIndex: customRange.endIndex + offset,
        })));
    }

    if (source.customDecorations?.length) {
        target.customDecorations ??= [];
        target.customDecorations.push(...source.customDecorations.map((customDecoration) => ({
            ...customDecoration,
            startIndex: customDecoration.startIndex + offset,
            endIndex: customDecoration.endIndex + offset,
        })));
    }

    if (source.customBlocks?.length) {
        target.customBlocks ??= [];
        target.customBlocks.push(...source.customBlocks.map((customBlock) => ({
            ...customBlock,
            startIndex: customBlock.startIndex + offset,
        })));
    }
}

function encodeBase64(value: string): string {
    return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(value: string): string {
    return decodeURIComponent(escape(atob(value)));
}
