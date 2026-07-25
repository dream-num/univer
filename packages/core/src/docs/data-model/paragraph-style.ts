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

import type { Nullable } from '../../shared';
import type { IDocStyles, IDocumentStyle, IParagraphStyle } from '../../types/interfaces';
import { Tools } from '../../shared';
import {
    DEFAULT_DOCUMENT_PARAGRAPH_LINE_SPACING,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_ABOVE,
    DEFAULT_DOCUMENT_PARAGRAPH_SPACE_BELOW,
    NAMED_STYLE_SPACE_MAP,
} from '../../types/const';
import { BooleanNumber } from '../../types/enum';
import { DocStyleType, DocumentFlavor } from '../../types/interfaces';

export interface IResolveDocumentParagraphStyleOptions {
    /** Exclude document-level outer spacing while retaining all other defaults. */
    excludeDocumentOuterSpacing?: boolean;
    /** Preserve the legacy Modern Doc spacing defaults when no explicit flavor is available. */
    useLegacyModernDefaults?: boolean;
    /** Named document styles keyed by stable style id. */
    styles?: IDocStyles;
    /** Named paragraph style referenced by the paragraph. */
    paragraphStyleId?: string;
}

function _definedStyle(style: Nullable<IParagraphStyle>): IParagraphStyle {
    if (style == null) {
        return {};
    }

    const definedStyle = Tools.deepClone(style);
    Tools.removeNull(definedStyle);
    return definedStyle;
}

function _resolveNamedParagraphStyle(
    styles: IDocStyles | undefined,
    styleId: string | undefined
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
        return {
            ...base,
            ..._definedStyle(style.paragraphStyle),
        };
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
    const referencedParagraphStyle = _resolveNamedParagraphStyle(
        options.styles,
        options.paragraphStyleId
    );
    const namedStyleType = definedParagraphStyle.namedStyleType ?? referencedParagraphStyle.namedStyleType;
    const namedStyle = namedStyleType == null
        ? null
        : NAMED_STYLE_SPACE_MAP[namedStyleType];

    return Tools.deepClone({
        ...documentDefaults,
        ...namedStyle,
        ...referencedParagraphStyle,
        ...definedParagraphStyle,
    });
}
