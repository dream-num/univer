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
import type { ParsedSection } from './utils/parse/parse-section';
import type { DocumentChild } from './utils/parse/types';
import {
    assembleDocument,

    findChild,
    flattenSdt,
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
        for (const child of flattenSdt(nodeChildren(body))) {
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

    const { documentStyle, sectionBreakDefaults } = parseSectionProperties(body);
    const bodyEndSection = parseSectionProperties(body);

  // Collect all inline `<w:pPr><w:sectPr>` from body paragraphs. They live on
  // ParsedParagraph.sectionBreakAfter (set by parse-paragraph). Each entry
  // describes the section that ENDS at that paragraph; the body-end sectPr
  // (parsed above) describes the trailing section.
    const inlineSections: ParsedSection[] = [];
    for (const c of children) {
        if (c.kind === 'paragraph' && c.paragraph.sectionBreakAfter) {
            inlineSections.push(c.paragraph.sectionBreakAfter);
        }
    }

  // ── Headers / footers ───────────────────────────────────────────────────────
  // Resolve <w:headerReference r:id> → "headerN" stem via document rels
  // (Target like "header1.xml" → strip ".xml"). Use the stem as IHeaderData.headerId
  // so it's stable across re-imports and easy to debug. Then plumb the IDs into
  // documentStyle (as document-level fallback) and onto each per-section break.
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
    // Already parsed (same header referenced by multiple types/sections) — reuse the id.
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

  // For each section (inline + body-end), resolve its rIds to stems and stash
  // the resolved IDs back on the ParsedSection (read by assemble.sectionToBreakFields).
    const resolveSection = (sec: ParsedSection) => {
        sec.resolvedHeaderIds = {
            default: parseHF(refToStem(sec.headerRefs.default), 'header'),
            first: parseHF(refToStem(sec.headerRefs.first), 'header'),
            even: parseHF(refToStem(sec.headerRefs.even), 'header'),
        };
        sec.resolvedFooterIds = {
            default: parseHF(refToStem(sec.footerRefs.default), 'footer'),
            first: parseHF(refToStem(sec.footerRefs.first), 'footer'),
            even: parseHF(refToStem(sec.footerRefs.even), 'footer'),
        };
    };
    for (const sec of inlineSections) resolveSection(sec);
    resolveSection(bodyEndSection);

  // Document-level fallback IDs: prefer the body-end sectPr's refs; if it has
  // none (common in python-docx output where the body-end sectPr is "empty"),
  // fall back to the FIRST inline sectPr that has any ref. This roughly mirrors
  // Word's section-inheritance behaviour for sections with no own refs.
  // (Run BEFORE inheritance fill-forward so we see each section's own refs.)
    const pickFallbackSection = (): ParsedSection | undefined => {
        const hasAnyRef = (s: ParsedSection) =>
            s.resolvedHeaderIds?.default || s.resolvedHeaderIds?.first || s.resolvedHeaderIds?.even
            || s.resolvedFooterIds?.default || s.resolvedFooterIds?.first || s.resolvedFooterIds?.even;
        if (hasAnyRef(bodyEndSection)) return bodyEndSection;
        return inlineSections.find(hasAnyRef);
    };
    const fallback = pickFallbackSection();
    const fallbackHeaderIds = fallback?.resolvedHeaderIds ?? {};
    const fallbackFooterIds = fallback?.resolvedFooterIds ?? {};

  // Cross-section inheritance: per ECMA-376 §17.6, a section that omits a
  // headerReference inherits from the previous section (and ultimately from
  // the body-end sectPr). python-docx keeps refs only on the FIRST sectPr
  // and leaves the rest empty; without this fill-forward, the early sections
  // render with no header even though documentStyle.defaultHeaderId is set,
  // because the sectionBreak entry's empty headerId short-circuits the global
  // fallback in prepareSectionBreakConfig.
    const allSections = [...inlineSections, bodyEndSection];
    const carried = { default: undefined as string | undefined, first: undefined as string | undefined, even: undefined as string | undefined };
    const carriedF = { default: undefined as string | undefined, first: undefined as string | undefined, even: undefined as string | undefined };
    for (const s of allSections) {
        const h = s.resolvedHeaderIds ?? (s.resolvedHeaderIds = {});
        const f = s.resolvedFooterIds ?? (s.resolvedFooterIds = {});
        h.default = h.default ?? carried.default;
        h.first = h.first ?? carried.first;
        h.even = h.even ?? carried.even;
        f.default = f.default ?? carriedF.default;
        f.first = f.first ?? carriedF.first;
        f.even = f.even ?? carriedF.even;
        carried.default = h.default;
        carried.first = h.first;
        carried.even = h.even;
        carriedF.default = f.default;
        carriedF.first = f.first;
        carriedF.even = f.even;
    }

    const evenAndOdd = parseEvenAndOddHeaders(bundle.settingsXml);

    if (fallbackHeaderIds.default) documentStyle.defaultHeaderId = fallbackHeaderIds.default;
    if (fallbackFooterIds.default) documentStyle.defaultFooterId = fallbackFooterIds.default;
    if (fallbackHeaderIds.first) documentStyle.firstPageHeaderId = fallbackHeaderIds.first;
    if (fallbackFooterIds.first) documentStyle.firstPageFooterId = fallbackFooterIds.first;
    if (fallbackHeaderIds.even) documentStyle.evenPageHeaderId = fallbackHeaderIds.even;
    if (fallbackFooterIds.even) documentStyle.evenPageFooterId = fallbackFooterIds.even;
  // useFirstPageHeaderFooter is per-section in OOXML (<w:titlePg/> lives on
  // each <w:sectPr>) and per-section in Univer (sectionBreak.useFirstPageHeaderFooter
  // falls back to the global only when the section omits it). Setting the
  // global from body-end's titlePg poisons every earlier section that didn't
  // set its own — section #0 ends up walking the first-page path with no
  // firstPageHeaderId and renders blank. sectionToBreakFields already writes
  // the per-section value; leave the global at its default (FALSE).
    if (evenAndOdd) documentStyle.evenAndOddHeaders = 1;

    const docData = assembleDocument(children, {
        numbering,
        rels,
        media: bundle.media ?? new Map(),
        drawingInfoMap,
        documentStyle,
        sectionBreakDefaults,
        bodyEndSection,
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
