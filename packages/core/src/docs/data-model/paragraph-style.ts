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

import type { Nullable } from '../../shared/types';
import type { IBullet, IDocStyles, IDocumentData, IDocumentStyle, INumberUnit, IParagraph, IParagraphStyle, ITextStyle } from '../../types/interfaces/i-document-data';
import { Tools } from '../../shared/tools';
import { DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING, DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE, DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW, NAMED_STYLE_SPACE_MAP } from '../../types/const/const';
import { BooleanNumber } from '../../types/enum/text-style';
import { DocStyleType, DocumentFlavor, NamedStyleType, NumberUnitType } from '../../types/interfaces/i-document-data';

export interface IResolveDocumentParagraphStyleOptions {
    /** Exclude document-level outer spacing while retaining all other defaults. */
    excludeDocumentOuterSpacing?: boolean;
    /** Preserve the legacy Modern Doc spacing defaults when no explicit flavor is available. */
    useLegacyModernDefaults?: boolean;
    /** Named document styles keyed by stable style id. */
    styles?: IDocStyles;
    /** Named paragraph style referenced by the paragraph. */
    paragraphStyleId?: string;
    /** List definitions used by inherited or direct paragraph numbering. */
    lists?: IDocumentData['lists'];
    /** Omitted numbering inherits; null explicitly disables it. */
    bullet?: IParagraph['bullet'];
}

/** Resolves style numbering and partial direct overrides without changing persisted paragraph data. */
export function resolveDocumentParagraphBullet(
    document: Partial<Pick<IDocumentData, 'styles' | 'lists' | 'documentStyle'>>,
    paragraph: Pick<IParagraph, 'styleId' | 'bullet'>
): IBullet | undefined {
    if (paragraph.bullet === null) {
        return;
    }
    const chain: IDocStyles[string][] = [];
    const visited = new Set<string>();
    let styleId = paragraph.styleId ?? document.documentStyle?.defaultParagraphStyleId;
    while (styleId && !visited.has(styleId)) {
        visited.add(styleId);
        const style = document.styles?.[styleId];
        if (!style || style.type !== DocStyleType.paragraph) {
            break;
        }
        chain.unshift(style);
        styleId = style.basedOn;
    }
    let resolved: Partial<IBullet> = {};
    for (const bullet of [...chain.map((style) => style.bullet), paragraph.bullet]) {
        if (bullet === null) {
            resolved = {};
            continue;
        }
        if (bullet?.listId != null && bullet.listId !== resolved.listId && bullet.listType == null) {
            delete resolved.listType;
        }
        resolved = { ...resolved, ...bullet };
    }
    const { listId, nestingLevel = 0 } = resolved;
    if (listId == null || listId === '0') {
        return;
    }
    const definition = Object.keys(document.lists ?? {}).find((key) => document.lists?.[key].counterIds?.includes(listId));
    const listType = resolved.listType ?? definition ?? listId;
    return { ...resolved, listId, listType, nestingLevel };
}

function _definedStyle(style: Nullable<IParagraphStyle>): IParagraphStyle {
    if (style == null) {
        return {};
    }

    const definedStyle = Tools.deepClone(style);
    Tools.removeNull(definedStyle);
    for (const key of ['textStyle', 'paragraphMarkTextStyle'] as const) {
        if (style[key]?.eastAsiaFontTheme === null) {
            (definedStyle[key] ??= {}).eastAsiaFontTheme = null;
        }
    }
    return definedStyle;
}

function _mergeWordLength(previous: INumberUnit | undefined, next: INumberUnit, relativeUnit: NumberUnitType): INumberUnit {
    if (next.u === relativeUnit) {
        const fallback = next.fallback ?? (previous?.u === relativeUnit ? previous.fallback : previous?.v);
        return fallback == null ? { ...next } : { ...next, fallback };
    }
    if (previous?.u === relativeUnit) {
        return { ...previous, fallback: next.v };
    }
    return { ...next };
}

function _assignWordIndents(result: IParagraphStyle, style: IParagraphStyle): void {
    const firstLineKeys = ['indentFirstLine', 'hanging'] as const;
    for (const key of ['indentStart', 'indentEnd', ...firstLineKeys] as const) {
        const value = style[key];
        if (value == null) {
            continue;
        }
        if (key === 'indentFirstLine' || key === 'hanging') {
            const opposite = key === 'hanging' ? 'indentFirstLine' : 'hanging';
            if (value.u === NumberUnitType.CHARACTER && result[opposite]?.u === NumberUnitType.CHARACTER) {
                result[opposite] = { ...result[opposite], v: 0 };
            }
            if (value.u !== NumberUnitType.CHARACTER || value.fallback != null) {
                if (result[opposite]?.u === NumberUnitType.CHARACTER) {
                    result[opposite] = { ...result[opposite] };
                    delete result[opposite].fallback;
                } else {
                    delete result[opposite];
                }
            }
        }
        result[key] = _mergeWordLength(result[key], value, NumberUnitType.CHARACTER);
    }
}

function _assignParagraphStyle(result: IParagraphStyle, style: Nullable<IParagraphStyle>, useWordIndents = false): void {
    // Word's zero-character override preserves the inherited list hanging indent.
    const zeroCharacterFirstLine = style?.indentFirstLine?.u === NumberUnitType.CHARACTER &&
        style.indentFirstLine.v === 0;
    if (!useWordIndents && style?.indentFirstLine != null && style.hanging == null && !zeroCharacterFirstLine) {
        delete result.hanging;
    } else if (!useWordIndents && style?.hanging != null && style.indentFirstLine == null) {
        delete result.indentFirstLine;
    }
    const inheritedTabs = result.tabStops;
    const inheritedIndents = {
        indentStart: result.indentStart,
        indentEnd: result.indentEnd,
        indentFirstLine: result.indentFirstLine,
        hanging: result.hanging,
        spaceAbove: result.spaceAbove,
        spaceBelow: result.spaceBelow,
    };
    Object.assign(result, style);
    if (useWordIndents && style) {
        Object.assign(result, inheritedIndents);
        _assignWordIndents(result, style);
        for (const key of ['spaceAbove', 'spaceBelow'] as const) {
            const value = style[key];
            if (value != null) {
                result[key] = _mergeWordLength(result[key], value, NumberUnitType.LINE);
            }
        }
    }
    if (inheritedTabs && style?.tabStops) {
        // A paragraph adds or replaces stops by position; clearing a stop must
        // also hide the same-position stop inherited from an earlier style.
        const tabs = new Map(inheritedTabs.map((tab) => [tab.offset, tab]));
        for (const tab of style.tabStops) {
            tabs.set(tab.offset, tab);
        }
        result.tabStops = [...tabs.values()].sort((left, right) => left.offset - right.offset);
    }
}

export function resolveDocumentTextStyle(styles: IDocStyles | undefined, styleId: string | undefined): ITextStyle {
    const chain: ITextStyle[] = [];
    const visited = new Set<string>();
    let currentId = styleId;
    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const style = styles?.[currentId];
        if (!style) {
            break;
        }
        chain.unshift(style.textStyle ?? {});
        currentId = style.basedOn ?? (style.type === DocStyleType.character ? style.link : undefined);
    }
    return Object.assign({}, ...chain);
}

function _resolveNamedParagraphStyle(
    styles: IDocStyles | undefined,
    styleId: string | undefined,
    useWordIndents: boolean
): IParagraphStyle {
    if (!styles || !styleId) {
        return {};
    }

    const visiting = new Set<string>();
    const resolve = (currentStyleId: string): IParagraphStyle => {
        if (visiting.has(currentStyleId)) {
            return {};
        }
        const style = styles[currentStyleId];
        if (!style || style.type !== DocStyleType.paragraph) {
            return {};
        }

        visiting.add(currentStyleId);
        const base = style.basedOn ? resolve(style.basedOn) : {};
        visiting.delete(currentStyleId);
        const own = _definedStyle(style.paragraphStyle);
        const result = { ...base };
        _assignParagraphStyle(result, own, useWordIndents);
        const textStyle = { ...base.textStyle, ...style.textStyle, ...own.textStyle };
        if (Object.keys(textStyle).length) {
            result.textStyle = textStyle;
        }
        return result;
    };
    return resolve(styleId);
}

export function resolveDocumentParagraphStyle(
    documentStyle: Nullable<IDocumentStyle>,
    paragraphStyle: Nullable<IParagraphStyle>,
    options: IResolveDocumentParagraphStyleOptions = {}
): IParagraphStyle {
    const useLegacyModernDefaults = options.useLegacyModernDefaults ??
        documentStyle?.documentFlavor === DocumentFlavor.MODERN;
    const legacyStyle: IParagraphStyle = useLegacyModernDefaults
        ? {
            lineSpacing: DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
            spaceAbove: { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE },
            spaceBelow: { v: DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW },
        }
        : {};
    const traditionalStyle: IParagraphStyle =
        documentStyle?.documentFlavor === DocumentFlavor.TRADITIONAL
            ? { widowControl: BooleanNumber.TRUE }
            : {};
    const documentDefaults = {
        ...traditionalStyle,
        ...legacyStyle,
        ..._definedStyle(documentStyle?.defaultParagraphStyle),
    };

    if (options.excludeDocumentOuterSpacing) {
        delete documentDefaults.spaceAbove;
        delete documentDefaults.spaceBelow;
    }

    const definedParagraphStyle = _definedStyle(paragraphStyle);
    const paragraphStyleId = options.paragraphStyleId ??
        (definedParagraphStyle.namedStyleType == null ||
            definedParagraphStyle.namedStyleType === NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED ||
            definedParagraphStyle.namedStyleType === NamedStyleType.NORMAL_TEXT
            ? documentStyle?.defaultParagraphStyleId
            : undefined);
    const referencedParagraphStyle = _resolveNamedParagraphStyle(
        options.styles,
        paragraphStyleId,
        documentStyle?.documentFlavor === DocumentFlavor.TRADITIONAL
    );
    const bullet = resolveDocumentParagraphBullet({ styles: options.styles, lists: options.lists }, {
        styleId: paragraphStyleId,
        bullet: options.bullet,
    });
    const listProperties = bullet && options.lists?.[bullet.listType]?.nestingLevel[bullet.nestingLevel]?.paragraphProperties;
    const useWordNumberingPriority = documentStyle?.documentFlavor === DocumentFlavor.TRADITIONAL;
    const listIndents: IParagraphStyle = {};
    for (const key of ['indentStart', 'indentEnd', 'indentFirstLine', 'hanging'] as const) {
        const value = listProperties?.[key];
        if (useWordNumberingPriority && value != null) {
            listIndents[key] = value;
        }
    }
    const directNumberingIndents: IParagraphStyle = useWordNumberingPriority && options.bullet != null ? listIndents : {};
    if (useWordNumberingPriority && options.bullet === null) {
        // Word clears inherited list positioning when a paragraph disables numbering.
        Object.assign(directNumberingIndents, { indentStart: { v: 0 }, indentFirstLine: { v: 0 }, hanging: { v: 0 } });
    }
    const namedStyleType = definedParagraphStyle.namedStyleType ?? referencedParagraphStyle.namedStyleType;
    // A referenced definition owns formatting; a semantic heading role adds no preset.
    const hasReferencedDefinition = paragraphStyleId != null &&
        options.styles?.[paragraphStyleId]?.type === DocStyleType.paragraph;
    const namedStyle = namedStyleType == null || (hasReferencedDefinition && referencedParagraphStyle.namedStyleType == null)
        ? null
        : NAMED_STYLE_SPACE_MAP[namedStyleType];

    const result: IParagraphStyle = {};
    for (const style of [documentDefaults, namedStyle, listIndents, referencedParagraphStyle, directNumberingIndents, definedParagraphStyle]) {
        _assignParagraphStyle(result, style, useWordNumberingPriority);
    }
    if (useWordNumberingPriority) {
        // Character first-line indents override physical indents across the style chain.
        if (result.indentFirstLine?.u === NumberUnitType.CHARACTER && result.indentFirstLine.v !== 0) {
            delete result.hanging;
        } else if (result.hanging?.u === NumberUnitType.CHARACTER && result.hanging.v !== 0) {
            delete result.indentFirstLine;
        }
    }
    const textStyle = {
        ...documentStyle?.textStyle,
        ...documentDefaults.textStyle,
        ..._definedStyle(namedStyle).textStyle,
        ...referencedParagraphStyle.textStyle,
        ...definedParagraphStyle.textStyle,
    };
    if (Object.keys(textStyle).length) {
        result.textStyle = textStyle;
    }
    if (result.paragraphMarkStyleId != null) {
        const markTextStyle = resolveDocumentTextStyle(options.styles, result.paragraphMarkStyleId);
        if (Object.keys(markTextStyle).length) {
            result.paragraphMarkTextStyle = { ...markTextStyle, ...result.paragraphMarkTextStyle };
        }
    }
    return Tools.deepClone(result);
}

/** Applies absolute edits while clearing Word's inherited relative components. */
export function getDocumentParagraphStyleForUpdate(
    document: Partial<Pick<IDocumentData, 'styles' | 'lists' | 'documentStyle'>>,
    paragraph: Pick<IParagraph, 'styleId' | 'bullet' | 'paragraphStyle'>,
    update: IParagraphStyle
): IParagraphStyle {
    const result = Tools.deepClone({ ...paragraph.paragraphStyle, ...update });
    if (document.documentStyle?.documentFlavor !== DocumentFlavor.TRADITIONAL) {
        return result;
    }
    const resolved = resolveDocumentParagraphStyle(document.documentStyle, paragraph.paragraphStyle, {
        styles: document.styles,
        lists: document.lists,
        paragraphStyleId: paragraph.styleId,
        bullet: paragraph.bullet,
    });
    for (const key of ['indentStart', 'indentEnd', 'indentFirstLine', 'hanging'] as const) {
        const value = update[key];
        const related = key === 'hanging' ? resolved.indentFirstLine : resolved.hanging;
        const hasCharacterIndent = resolved[key]?.u === NumberUnitType.CHARACTER ||
            ((key === 'indentFirstLine' || key === 'hanging') && related?.u === NumberUnitType.CHARACTER);
        if (value != null && value.u !== NumberUnitType.CHARACTER && hasCharacterIndent) {
            result[key] = { v: 0, u: NumberUnitType.CHARACTER, fallback: value.v };
            if (key === 'indentFirstLine' && update.hanging == null) {
                delete result.hanging;
            } else if (key === 'hanging' && update.indentFirstLine == null) {
                delete result.indentFirstLine;
            }
        }
    }
    for (const key of ['spaceAbove', 'spaceBelow'] as const) {
        const value = update[key];
        if (value != null && value.u !== NumberUnitType.LINE && resolved[key]?.u === NumberUnitType.LINE) {
            result[key] = { v: 0, u: NumberUnitType.LINE, fallback: value.v };
        }
    }
    return result;
}

/** Resolves word splitting without materializing inherited defaults in the snapshot. */
export function resolveDocumentParagraphWordWrap(document: IDocumentData, paragraph?: IParagraph): BooleanNumber {
    const { documentStyle } = document;
    const { wordWrap } = resolveDocumentParagraphStyle(documentStyle, paragraph?.paragraphStyle, {
        styles: document.styles,
        paragraphStyleId: paragraph?.styleId,
    });
    return wordWrap ?? BooleanNumber.FALSE;
}
