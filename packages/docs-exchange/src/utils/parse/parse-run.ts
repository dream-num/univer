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

import type { IUniverTextStyle } from '../types';
import type { DrawingInfo } from './parse-drawing';
import type { StylesIndex } from './parse-styles';
import type { ThemeFonts } from './parse-theme';
import type { ParsedRun } from './types';
import type { XmlNode } from './xml';
import { generateRandomId } from '@univerjs/core';
import { hpToPt } from '../units';
import { parseDrawingFromXmlNode } from './parse-drawing';
import { findChild, nodeAttrs, nodeChildren, nodeName, textOf, xmlParser } from './xml';

const uuidv4 = () => generateRandomId();

// TODO(unsupported): <w:br w:type="page"/> — treated as plain newline like <w:br/>

/**
 * Word's 16 named highlight colors (ECMA-376 §17.18.40 ST_HighlightColor).
 * "none" → no highlight. Anything else maps to a fixed RGB.
 */
const HIGHLIGHT_COLORS: Record<string, string> = {
    black: '000000',
    blue: '0000FF',
    cyan: '00FFFF',
    green: '00FF00',
    magenta: 'FF00FF',
    red: 'FF0000',
    yellow: 'FFFF00',
    white: 'FFFFFF',
    darkBlue: '000080',
    darkCyan: '008080',
    darkGreen: '008000',
    darkMagenta: '800080',
    darkRed: '800000',
    darkYellow: '808000',
    darkGray: '808080',
    lightGray: 'C0C0C0',
};

function isToggleOn(val: string | undefined): boolean {
    return val !== '0' && val !== 'false' && val !== 'none';
}

export function parseRPr(rPr: XmlNode | undefined): IUniverTextStyle | undefined {
    if (!rPr) return undefined;
    const style: IUniverTextStyle = {};
    for (const child of nodeChildren(rPr)) {
        const name = nodeName(child);
        const attrs = nodeAttrs(child);
        switch (name) {
            case 'w:b':
                if (isToggleOn(attrs['@_w:val'])) style.bl = 1;
                break;
            case 'w:i':
                if (isToggleOn(attrs['@_w:val'])) style.it = 1;
                break;
            case 'w:u':
                if (isToggleOn(attrs['@_w:val'])) style.ul = { s: 1 };
                break;
            case 'w:strike':
                if (isToggleOn(attrs['@_w:val'])) style.st = { s: 1 };
                break;
            case 'w:sz': {
                const val = Number(attrs['@_w:val']);
                if (!Number.isNaN(val)) style.fs = hpToPt(val);
                break;
            }
            case 'w:rFonts': {
                const fam = attrs['@_w:ascii'] || attrs['@_w:hAnsi'] || attrs['@_w:cs'];
                if (fam) style.ff = fam;
                break;
            }
            case 'w:color': {
                const v = attrs['@_w:val'];
                if (v && v !== 'auto') style.cl = { rgb: `#${v.toUpperCase()}` };
                break;
            }
            case 'w:highlight': {
                const v = attrs['@_w:val'];
                const rgb = v ? HIGHLIGHT_COLORS[v] : undefined;
                if (rgb) style.bg = { rgb: `#${rgb}` };
                break;
            }
            case 'w:shd': {
                const fill = attrs['@_w:fill'];
                if (fill && fill !== 'auto') style.bg = { rgb: `#${fill.toUpperCase()}` };
                break;
            }
            case 'w:vertAlign': {
                const v = attrs['@_w:val'];
                if (v === 'superscript') style.va = 3;
                else if (v === 'subscript') style.va = 2;
                break;
            }
        }
    }
    return Object.keys(style).length > 0 ? style : undefined;
}

/** Read the w:rStyle styleId reference from a w:rPr (used for character-style inheritance). */
export function rPrStyleRef(rPr: XmlNode | undefined): string | undefined {
    if (!rPr) return undefined;
    for (const child of nodeChildren(rPr)) {
        if (nodeName(child) === 'w:rStyle') {
            return nodeAttrs(child)['@_w:val'] as string | undefined;
        }
    }
    return undefined;
}

export interface RFontsAttrs {
    ascii?: string;
    hAnsi?: string;
    eastAsia?: string;
    cs?: string;
    asciiTheme?: string;
    hAnsiTheme?: string;
    eastAsiaTheme?: string;
    cstheme?: string;
}

/**
 * Extract the w:rFonts attrs from a w:rPr without resolving — both direct
 * (w:ascii) and theme (w:asciiTheme) attrs. Returns undefined if no rFonts.
 *
 * Theme refs are kept verbatim ("minorHAnsi" etc.) and resolved later via
 * ThemeFonts so we don't need to thread the theme through every parse fn.
 */
export function extractRFonts(rPr: XmlNode | undefined): RFontsAttrs | undefined {
    if (!rPr) return undefined;
    for (const child of nodeChildren(rPr)) {
        if (nodeName(child) !== 'w:rFonts') continue;
        const a = nodeAttrs(child);
        const out: RFontsAttrs = {};
        if (a['@_w:ascii']) out.ascii = a['@_w:ascii'] as string;
        if (a['@_w:hAnsi']) out.hAnsi = a['@_w:hAnsi'] as string;
        if (a['@_w:eastAsia']) out.eastAsia = a['@_w:eastAsia'] as string;
        if (a['@_w:cs']) out.cs = a['@_w:cs'] as string;
        if (a['@_w:asciiTheme']) out.asciiTheme = a['@_w:asciiTheme'] as string;
        if (a['@_w:hAnsiTheme']) out.hAnsiTheme = a['@_w:hAnsiTheme'] as string;
        if (a['@_w:eastAsiaTheme']) out.eastAsiaTheme = a['@_w:eastAsiaTheme'] as string;
        if (a['@_w:cstheme']) out.cstheme = a['@_w:cstheme'] as string;
        return Object.keys(out).length > 0 ? out : undefined;
    }
    return undefined;
}

// CJK ranges as escape sequences (avoid no-irregular-whitespace lint on literal U+3000):
// CJK symbols/punct (U+3000–U+303F), Hiragana (U+3040–U+309F), Katakana (U+30A0–U+30FF),
// CJK Ext A (U+3400–U+4DBF), CJK Unified (U+4E00–U+9FFF), CJK Compat Ideographs
// (U+F900–U+FAFF), Halfwidth/Fullwidth (U+FF00–U+FFEF).
const CJK_PATTERN = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/;

/**
 * Pick a single font name from the rFonts attrs based on the run's actual text.
 * Univer's IUniverTextStyle has only one `ff`, so we have to choose: text
 * containing CJK characters → eastAsia variant (with theme fallback);
 * otherwise → ascii/hAnsi (with theme fallback).
 */
export function resolveFontFamily(
    rfonts: RFontsAttrs | undefined,
    text: string,
    themeFonts?: ThemeFonts
): string | undefined {
    if (!rfonts) return undefined;
    const wantsEastAsia = CJK_PATTERN.test(text);
    const themeOf = (ref: string | undefined) => (themeFonts && ref ? themeFonts.resolve(ref) : undefined);
    if (wantsEastAsia) {
        return (
            rfonts.eastAsia ??
      themeOf(rfonts.eastAsiaTheme) ??
      rfonts.ascii ??
      rfonts.hAnsi ??
      themeOf(rfonts.asciiTheme) ??
      themeOf(rfonts.hAnsiTheme) ??
      rfonts.cs ??
      themeOf(rfonts.cstheme)
        );
    }
    return (
        rfonts.ascii ??
    rfonts.hAnsi ??
    themeOf(rfonts.asciiTheme) ??
    themeOf(rfonts.hAnsiTheme) ??
    rfonts.eastAsia ??
    themeOf(rfonts.eastAsiaTheme) ??
    rfonts.cs ??
    themeOf(rfonts.cstheme)
    );
}

function mergeRFonts(parent: RFontsAttrs | undefined, child: RFontsAttrs | undefined): RFontsAttrs | undefined {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

function runTextFromR(r: XmlNode): string {
    let text = '';
    for (const child of nodeChildren(r)) {
        const name = nodeName(child);
        if (name === 'w:t') text += textOf(child);
        else if (name === 'w:tab') text += '\t';
        else if (name === 'w:br') text += '\n';
    }
    return text;
}

/**
 * Inspect a <w:r> for OOXML field-state markers.
 *   - <w:fldChar w:fldCharType="begin|separate|end"/>
 *   - <w:instrText>FIELDCODE args</w:instrText>
 *
 * A run can carry a fldChar OR an instrText, never both meaningfully. We surface
 * both signals so the caller can drive its own begin/separate/end state machine
 * and discard cached values that sit between `separate` and `end`.
 */
interface RunFieldSignals {
    fldChar?: 'begin' | 'separate' | 'end';
    instrText?: string;
}

function readRunFieldSignals(r: XmlNode): RunFieldSignals | undefined {
    let out: RunFieldSignals | undefined;
    for (const child of nodeChildren(r)) {
        const name = nodeName(child);
        if (name === 'w:fldChar') {
            const v = nodeAttrs(child)['@_w:fldCharType'] as string | undefined;
            if (v === 'begin' || v === 'separate' || v === 'end') {
                (out ??= {}).fldChar = v;
            }
        } else if (name === 'w:instrText') {
            (out ??= {}).instrText = textOf(child);
        }
    }
    return out;
}

/**
 * Map a field instruction body ("PAGE", " PAGE  \\* MERGEFORMAT", "NUMPAGES \\* Arabic")
 * to the subset of fields we preserve. The first whitespace-separated token is the
 * field name per ECMA-376 §17.16.5; switches and arguments after it are ignored
 * because we don't render formatting hints today.
 */
function classifyFieldInstr(instr: string): 'PAGE' | 'NUMPAGES' | undefined {
    const head = instr.trim().split(/\s+/, 1)[0]?.toUpperCase();
    if (head === 'PAGE') return 'PAGE';
    if (head === 'NUMPAGES') return 'NUMPAGES';
    return undefined;
}

export function parseRunsFromParagraphXml(paragraphXml: string): ParsedRun[] {
    const parsed = xmlParser.parse(paragraphXml) as Array<Record<string, unknown>>;
    if (parsed.length === 0) return [];
    const pNode = parsed[0];
    return parseRunsFromPNode(pNode);
}

export function parseRunsFromPNode(
    pNode: Record<string, unknown>,
    drawingsOut?: Map<string, DrawingInfo>,
    styles?: StylesIndex,
    pStyleRpr?: IUniverTextStyle,
    themeFonts?: ThemeFonts,
    pStyleRFonts?: RFontsAttrs
): ParsedRun[] {
    const docDefaultRpr = styles?.docDefaults.rPr;
    const docDefaultRFonts = styles?.docDefaults.rFonts;
    const baseRpr = mergeRpr(docDefaultRpr, pStyleRpr);
    const baseRFonts = mergeRFonts(docDefaultRFonts, pStyleRFonts);

    const runs: ParsedRun[] = [];

  // Field-state machine. OOXML wraps a field as:
  //   <w:r><w:fldChar w:fldCharType="begin"/></w:r>
  //   <w:r><w:instrText>PAGE</w:instrText></w:r>           ← field code (may span multiple runs)
  //   <w:r><w:fldChar w:fldCharType="separate"/></w:r>
  //   <w:r><w:t>2</w:t></w:r>                              ← cached value (must NOT leak as text)
  //   <w:r><w:fldChar w:fldCharType="end"/></w:r>
  //
  // We collect instrText between begin/separate, classify it, and on `end` we emit
  // a single placeholder run carrying `fieldType`. Runs between `separate` and `end`
  // (the cached value) are dropped — keeping them would freeze "PAGE" at whatever
  // page number Word last wrote.
    let fieldDepth = 0;
    let fieldInstr = '';
    let inFieldResult = false; // true while between `separate` and `end` of current field

    const emitField = (rPrForStyle: XmlNode | undefined, fallbackText: string) => {
        const kind = classifyFieldInstr(fieldInstr);
        if (!kind) {
      // Unrecognized field — surface the cached fallback text so the user at least
      // sees *something* instead of a blank. Better-known fields (PAGE/NUMPAGES)
      // render as placeholders the renderer is expected to substitute.
            if (fallbackText.length > 0) {
                const style = resolveRunStyle(rPrForStyle, baseRpr, baseRFonts, styles, themeFonts, fallbackText);
                runs.push(style ? { text: fallbackText, style } : { text: fallbackText });
            }
            return;
        }
        const placeholder = kind === 'PAGE' ? '{{page}}' : '{{numpages}}';
        const style = resolveRunStyle(rPrForStyle, baseRpr, baseRFonts, styles, themeFonts, placeholder);
        runs.push(style ? { text: placeholder, style, fieldType: kind } : { text: placeholder, fieldType: kind });
    };

    let pendingFieldRPr: XmlNode | undefined;
    let pendingFieldFallback = '';

    for (const child of nodeChildren(pNode)) {
        const name = nodeName(child);
        if (name === 'w:r') {
            const rPr = findChild(child, 'w:rPr');
            const signals = readRunFieldSignals(child);

            if (signals?.fldChar === 'begin') {
                fieldDepth++;
                fieldInstr = '';
                inFieldResult = false;
                pendingFieldRPr = rPr;
                pendingFieldFallback = '';
                continue;
            }
            if (signals?.fldChar === 'separate') {
                if (fieldDepth > 0) inFieldResult = true;
                continue;
            }
            if (signals?.fldChar === 'end') {
                if (fieldDepth > 0) {
                    emitField(pendingFieldRPr, pendingFieldFallback);
                    fieldDepth--;
                    fieldInstr = '';
                    inFieldResult = false;
                    pendingFieldRPr = undefined;
                    pendingFieldFallback = '';
                }
                continue;
            }

      // Inside a field: collect the instruction code, drop cached result text.
            if (fieldDepth > 0) {
                if (signals?.instrText !== undefined && !inFieldResult) {
                    fieldInstr += signals.instrText;
                    continue;
                }
                if (inFieldResult) {
          // Keep around in case the field is unrecognized and we need to fall back.
                    pendingFieldFallback += runTextFromR(child);
                    continue;
                }
        // Pre-separate non-instrText content (rare) — ignore.
                continue;
            }

            const text = runTextFromR(child);
            const style = resolveRunStyle(rPr, baseRpr, baseRFonts, styles, themeFonts, text);
      // Handle text content
            if (text.length > 0) runs.push(style ? { text, style } : { text });
      // Handle drawing content
            const drawingNode = findChild(child, 'w:drawing');
            if (drawingNode && drawingsOut) {
                const info = parseDrawingFromXmlNode(drawingNode);
                if (info) {
                    const drawingId = uuidv4();
                    drawingsOut.set(drawingId, info);
                    runs.push({ text: '', drawingId });
                }
            }
        } else if (name === 'w:hyperlink') {
            const rId = nodeAttrs(child)['@_r:id'];
            for (const inner of nodeChildren(child)) {
                if (nodeName(inner) === 'w:r') {
                    const rPr = findChild(inner, 'w:rPr');
                    const text = runTextFromR(inner);
                    if (text.length === 0) continue;
                    const style = resolveRunStyle(rPr, baseRpr, baseRFonts, styles, themeFonts, text);
                    if (rId) runs.push({ text, style, hyperlink: { url: rId } });
                    else runs.push(style ? { text, style } : { text });
                }
            }
        }
    }

  // Unterminated field (malformed xml) — flush whatever we accumulated so we don't
  // silently drop the user's content. Emits as fallback text, not a placeholder.
    if (fieldDepth > 0 && pendingFieldFallback.length > 0) {
        const style = resolveRunStyle(pendingFieldRPr, baseRpr, baseRFonts, styles, themeFonts, pendingFieldFallback);
        runs.push(style ? { text: pendingFieldFallback, style } : { text: pendingFieldFallback });
    }

    return runs;
}

function mergeRpr(
    parent: IUniverTextStyle | undefined,
    child: IUniverTextStyle | undefined
): IUniverTextStyle | undefined {
    if (!parent) return child;
    if (!child) return parent;
    return { ...parent, ...child };
}

/** Apply the full inheritance chain: docDefaults+pStyle (passed in baseRpr/baseRFonts) → rStyle → inline rPr. */
function resolveRunStyle(
    rPr: XmlNode | undefined,
    baseRpr: IUniverTextStyle | undefined,
    baseRFonts: RFontsAttrs | undefined,
    styles: StylesIndex | undefined,
    themeFonts: ThemeFonts | undefined,
    text: string
): IUniverTextStyle | undefined {
    let merged = baseRpr;
    let rfonts = baseRFonts;
    if (styles && rPr) {
        const ref = rPrStyleRef(rPr);
        if (ref) {
            merged = mergeRpr(merged, styles.resolveRStyle(ref));
            rfonts = mergeRFonts(rfonts, styles.resolveRFonts(ref));
        }
    }
    const inline = parseRPr(rPr);
    merged = mergeRpr(merged, inline);
    rfonts = mergeRFonts(rfonts, extractRFonts(rPr));

  // Resolve final ff using the run's text (CJK detection) and theme refs.
    const ff = resolveFontFamily(rfonts, text, themeFonts);
    if (ff) merged = { ...(merged ?? {}), ff };
    return merged;
}
