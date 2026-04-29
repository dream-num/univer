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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import type { DrawingInfo } from './parse-drawing';
import type { StylesIndex } from './parse-styles';
import type { ThemeFonts } from './parse-theme';
import type { DocumentChild, ParsedNumberingDef, ParsedRelationship } from './types';
import type { XmlNode } from './xml';
import { assembleDocument } from './assemble';
import { parseRelationships } from './parse-hyperlink';
import { parseParagraph } from './parse-paragraph';
import { parseTable } from './parse-table';
import {
    flattenSdt,
    nodeChildren,
    nodeName,
    xmlParser,

} from './xml';

export interface HeaderFooterParseContext {
    numbering: Map<string, ParsedNumberingDef>;
    styles?: StylesIndex;
    themeFonts?: ThemeFonts;
    media: Map<string, Uint8Array>;
  /** rels for THIS header/footer file (from word/_rels/headerN.xml.rels). */
    rels: Map<string, ParsedRelationship>;
}

/**
 * Result of parsing one header/footer xml. The body goes into IHeaderData/IFooterData;
 * `drawings`, `lists`, `tableSource` are top-level on IDocumentData and must be merged
 * into the host document by the caller — IHeaderData itself has no slot for them.
 */
export interface ParsedHeaderFooter {
    body: IDocumentBody;
    drawings?: IDocumentData['drawings'];
    lists?: IDocumentData['lists'];
    tableSource?: IDocumentData['tableSource'];
}

/**
 * Parse a header/footer xml string into a ParsedHeaderFooter.
 * Returns undefined if the root element isn't found / xml is empty.
 */
export function parseHeaderFooterXml(
    xml: string,
    rootTag: 'w:hdr' | 'w:ftr',
    ctx: HeaderFooterParseContext
): ParsedHeaderFooter | undefined {
    let parsed: XmlNode[];
    try {
        parsed = xmlParser.parse(xml) as XmlNode[];
    } catch {
        return undefined;
    }
    const root = parsed.find((n) => nodeName(n) === rootTag);
    if (!root) return undefined;

    const drawingInfoMap = new Map<string, DrawingInfo>();
    const children: DocumentChild[] = [];
    for (const child of flattenSdt(nodeChildren(root))) {
        const name = nodeName(child);
        try {
            if (name === 'w:p') {
                children.push({
                    kind: 'paragraph',
                    paragraph: parseParagraph(child, drawingInfoMap, ctx.styles, ctx.themeFonts),
                });
            } else if (name === 'w:tbl') {
                children.push({
                    kind: 'table',
                    table: parseTable(child, drawingInfoMap, ctx.styles, ctx.themeFonts),
                });
            }
        } catch (err) {
            console.warn(`[ieport-docx] Failed to parse <${name}> in ${rootTag}:`, (err as Error).message);
        }
    }

    const sub = assembleDocument(children, {
        numbering: ctx.numbering,
        rels: ctx.rels,
        media: ctx.media,
        drawingInfoMap,
    });

    return {
        body: sub.body!,
        drawings: sub.drawings,
        lists: sub.lists,
        tableSource: sub.tableSource,
    };
}

/**
 * Helper: parse a header/footer rels xml file (same schema as document.xml.rels)
 * with a thin wrapper around parseRelationships so callers don't need to import both.
 */
export function parseHeaderFooterRels(relsXml: string | undefined): Map<string, ParsedRelationship> {
    return parseRelationships(relsXml);
}
