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

import type { IDocumentData, IFooterData, IHeaderData } from '@univerjs/core';
import type { DocxInput, XmlNode } from './utils/parse/index';
import type { DrawingInfo } from './utils/parse/parse-drawing';
import type { DocumentChild } from './utils/parse/types';
import {
    assembleDocument,

    findChild,
    nodeChildren,
    nodeName,
    parseEvenAndOddHeaders,
    parseHeaderFooterRels,
    parseHeaderFooterXml,
    parseNumbering,
    parseParagraph,
    parseRelationships,
    parseSectionProperties,
    parseStyles,
    parseTable,
    parseTheme,
    readOoxmlBundle,

    xmlParser,
} from './utils/parse/index';

export async function docxToUniverData(input: DocxInput): Promise<IDocumentData> {
    const bundle = await readOoxmlBundle(input);

    const numbering = parseNumbering(bundle.numberingXml);
    const rels = parseRelationships(bundle.relsXml);
    const styles = parseStyles(bundle.stylesXml);
    const themeFonts = parseTheme(bundle.themeXml);

    const docTree = xmlParser.parse(bundle.documentXml) as XmlNode[];
    const docRoot = docTree.find((n) => nodeName(n) === 'w:document');
    const body = docRoot ? findChild(docRoot, 'w:body') : undefined;

    const drawingInfoMap = new Map<string, DrawingInfo>();
    const children: DocumentChild[] = [];
    if (body) {
        for (const child of nodeChildren(body)) {
            const name = nodeName(child);
            try {
                if (name === 'w:p') {
                    children.push({ kind: 'paragraph', paragraph: parseParagraph(child, drawingInfoMap, styles, themeFonts) });
                } else if (name === 'w:tbl') {
                    children.push({ kind: 'table', table: parseTable(child, drawingInfoMap, styles, themeFonts) });
                }
            } catch (err) {
                console.warn(`[ieport-docx] Failed to parse <${name}>:`, (err as Error).message);
            }
        }
    }

    const { documentStyle, sectionBreakDefaults, headerRefs, footerRefs, titlePage } = parseSectionProperties(body);

  // ── Headers / footers ───────────────────────────────────────────────────────
  // Resolve <w:headerReference r:id> → "headerN" stem via document rels
  // (Target like "header1.xml" → strip ".xml"). Use the stem as IHeaderData.headerId
  // so it's stable across re-imports and easy to debug. Then plumb the IDs into
  // documentStyle so the renderer (prepareSectionBreakConfig) picks them up.
    const headers: Record<string, IHeaderData> = {};
    const footers: Record<string, IFooterData> = {};
  // Top-level drawings/lists/tableSource collected from header/footer parses.
    const extraDrawings: IDocumentData['drawings'] = {};
    const extraLists: NonNullable<IDocumentData['lists']> = {};
    const extraTableSource: NonNullable<IDocumentData['tableSource']> = {};

    const refToStem = (rId: string | undefined): string | undefined => {
        if (!rId) return undefined;
        const rel = rels.get(rId);
        if (!rel || !rel.target) return undefined;
    // Targets look like "header1.xml" or "footer2.xml" (sometimes prefixed by relative path).
        const m = /(?:^|\/)((?:header|footer)\d+)\.xml$/.exec(rel.target);
        return m?.[1];
    };

    const parseHF = (
        stem: string | undefined,
        kind: 'header' | 'footer'
    ): string | undefined => {
        if (!stem) return undefined;
        const xmlMap = kind === 'header' ? bundle.headers : bundle.footers;
        const relsMap = kind === 'header' ? bundle.headerRels : bundle.footerRels;
        const xml = xmlMap?.get(stem);
        if (!xml) return undefined;
    // Already parsed (same header referenced by multiple types) — reuse the id.
        if (kind === 'header' ? headers[stem] : footers[stem]) return stem;
        const hfRels = parseHeaderFooterRels(relsMap?.get(stem));
        const parsed = parseHeaderFooterXml(xml, kind === 'header' ? 'w:hdr' : 'w:ftr', {
            numbering,
            styles,
            themeFonts,
            media: bundle.media ?? new Map(),
            rels: hfRels,
        });
        if (!parsed) return undefined;
        if (kind === 'header') headers[stem] = { headerId: stem, body: parsed.body };
        else footers[stem] = { footerId: stem, body: parsed.body };
        if (parsed.drawings) Object.assign(extraDrawings, parsed.drawings);
        if (parsed.lists) Object.assign(extraLists, parsed.lists);
        if (parsed.tableSource) Object.assign(extraTableSource, parsed.tableSource);
        return stem;
    };

    const defaultHeaderId = parseHF(refToStem(headerRefs.default), 'header');
    const firstPageHeaderId = parseHF(refToStem(headerRefs.first), 'header');
    const evenPageHeaderId = parseHF(refToStem(headerRefs.even), 'header');
    const defaultFooterId = parseHF(refToStem(footerRefs.default), 'footer');
    const firstPageFooterId = parseHF(refToStem(footerRefs.first), 'footer');
    const evenPageFooterId = parseHF(refToStem(footerRefs.even), 'footer');

    const evenAndOdd = parseEvenAndOddHeaders(bundle.settingsXml);

    if (defaultHeaderId) documentStyle.defaultHeaderId = defaultHeaderId;
    if (defaultFooterId) documentStyle.defaultFooterId = defaultFooterId;
    if (firstPageHeaderId) documentStyle.firstPageHeaderId = firstPageHeaderId;
    if (firstPageFooterId) documentStyle.firstPageFooterId = firstPageFooterId;
    if (evenPageHeaderId) documentStyle.evenPageHeaderId = evenPageHeaderId;
    if (evenPageFooterId) documentStyle.evenPageFooterId = evenPageFooterId;
  // BooleanNumber.TRUE = 1, FALSE = 0 — see @univerjs/core/types/enum/text-style.
    if (titlePage) documentStyle.useFirstPageHeaderFooter = 1;
    if (evenAndOdd) documentStyle.evenAndOddHeaders = 1;

    const docData = assembleDocument(children, {
        numbering,
        rels,
        media: bundle.media ?? new Map(),
        drawingInfoMap,
        documentStyle,
        sectionBreakDefaults,
    });

    if (Object.keys(headers).length > 0) docData.headers = headers;
    if (Object.keys(footers).length > 0) docData.footers = footers;
  // Merge header/footer auxiliary data into the host document.
    if (Object.keys(extraDrawings).length > 0) {
        docData.drawings = { ...(docData.drawings ?? {}), ...extraDrawings };
    }
    if (Object.keys(extraLists).length > 0) {
        docData.lists = { ...(docData.lists ?? {}), ...extraLists };
    }
    if (Object.keys(extraTableSource).length > 0) {
        docData.tableSource = { ...(docData.tableSource ?? {}), ...extraTableSource };
    }

    return docData;
}

export type { DocxInput };
