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

import { XMLParser } from 'fast-xml-parser';

export const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: false,
    preserveOrder: true,
    trimValues: false,
    parseTagValue: false,
});

/**
 * In preserveOrder mode, fast-xml-parser returns arrays of single-key objects.
 * Each node looks like: { 'w:r': [...children], ':@': { '@_w:val': '...' } }
 */
export type XmlNode = Record<string, any>;

export function nodeName(node: XmlNode): string {
    for (const k of Object.keys(node)) {
        if (k !== ':@') return k;
    }
    return '';
}

export function nodeChildren(node: XmlNode): XmlNode[] {
    const name = nodeName(node);
    const value = node[name];
    return Array.isArray(value) ? value : [];
}

export function nodeAttrs(node: XmlNode): Record<string, string> {
    return (node[':@'] as Record<string, string> | undefined) ?? {};
}

export function findChild(node: XmlNode, tagName: string): XmlNode | undefined {
    return nodeChildren(node).find((c) => nodeName(c) === tagName);
}

export function findChildren(node: XmlNode, tagName: string): XmlNode[] {
    return nodeChildren(node).filter((c) => nodeName(c) === tagName);
}

export function textOf(node: XmlNode): string {
    const children = nodeChildren(node);
    let out = '';
    for (const c of children) {
        if ('#text' in c) out += String(c['#text']);
    }
    return out;
}

/**
 * Unwrap <w:sdt><w:sdtContent>...</w:sdtContent></w:sdt> containers so callers
 * iterating over body/header/footer children see the wrapped <w:p>/<w:tbl> directly.
 * SDTs can nest; non-sdt nodes pass through unchanged. Order is preserved.
 */
export function flattenSdt(nodes: XmlNode[]): XmlNode[] {
    const out: XmlNode[] = [];
    for (const node of nodes) {
        if (nodeName(node) === 'w:sdt') {
            const content = findChild(node, 'w:sdtContent');
            if (content) {
                for (const inner of flattenSdt(nodeChildren(content))) out.push(inner);
            }
        } else {
            out.push(node);
        }
    }
    return out;
}
