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

import type { XmlNode } from './xml';
import { findChild, findChildren, nodeAttrs, nodeName, xmlParser } from './xml';

/** Resolves OOXML rFonts theme refs (asciiTheme/eastAsiaTheme/hAnsiTheme/cstheme) to actual font names. */
export interface ThemeFonts {
    resolve(themeRef: string | undefined): string | undefined;
}

const EMPTY: ThemeFonts = { resolve: () => undefined };

/**
 * Parse word/theme/theme1.xml into a theme-ref → font-name resolver.
 *
 * OOXML theme refs map to:
 *   minor* (body)  → fontScheme/minorFont
 *   major* (heading) → fontScheme/majorFont
 *   HAnsi / *Ascii / *Bidi → <a:latin> / <a:cs>
 *   EastAsia → <a:ea>; if <a:ea typeface=""/> is empty,
 *               fall back to <a:font script="Hans"> (CJK).
 */
export function parseTheme(themeXml: string | undefined): ThemeFonts {
    if (!themeXml) return EMPTY;

    let parsed: XmlNode[];
    try {
        parsed = xmlParser.parse(themeXml) as XmlNode[];
    } catch {
        return EMPTY;
    }

    const themeRoot = parsed.find((n) => nodeName(n) === 'a:theme');
    if (!themeRoot) return EMPTY;
    const elements = findChild(themeRoot, 'a:themeElements');
    if (!elements) return EMPTY;
    const fontScheme = findChild(elements, 'a:fontScheme');
    if (!fontScheme) return EMPTY;

    const minor = readFontGroup(findChild(fontScheme, 'a:minorFont'));
    const major = readFontGroup(findChild(fontScheme, 'a:majorFont'));

    return {
        resolve(ref) {
            if (!ref) return undefined;
            const isMajor = ref.startsWith('major');
            const group = isMajor ? major : minor;
      // Strip "minor"/"major" prefix → role suffix
            const role = ref.slice(5);
            switch (role) {
                case 'HAnsi':
                case 'Ascii':
                    return group.latin;
                case 'EastAsia':
                    return group.eastAsia;
                case 'Bidi':
                case 'Cs':
                    return group.cs;
                default:
                    return undefined;
            }
        },
    };
}

interface FontGroup {
    latin?: string;
    eastAsia?: string;
    cs?: string;
}

function readFontGroup(group: XmlNode | undefined): FontGroup {
    if (!group) return {};
    const out: FontGroup = {};
    const latin = findChild(group, 'a:latin');
    if (latin) {
        const v = nodeAttrs(latin)['@_typeface'] as string | undefined;
        if (v) out.latin = v;
    }
    const ea = findChild(group, 'a:ea');
    if (ea) {
        const v = nodeAttrs(ea)['@_typeface'] as string | undefined;
        if (v) out.eastAsia = v;
    }
  // ea empty → look up <a:font script="Hans"> (Simplified Chinese fallback for CJK)
    if (!out.eastAsia) {
        for (const f of findChildren(group, 'a:font')) {
            if (nodeAttrs(f)['@_script'] === 'Hans') {
                const v = nodeAttrs(f)['@_typeface'] as string | undefined;
                if (v) {
                    out.eastAsia = v;
                    break;
                }
            }
        }
    }
    const cs = findChild(group, 'a:cs');
    if (cs) {
        const v = nodeAttrs(cs)['@_typeface'] as string | undefined;
        if (v) out.cs = v;
    }
    return out;
}
