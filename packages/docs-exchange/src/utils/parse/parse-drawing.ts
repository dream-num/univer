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

import type { ISimpleDrawing } from '../types';
import type { ParsedRelationship } from './types';
import type { XmlNode } from './xml';
import { nodeAttrs, nodeChildren, nodeName, xmlParser } from './xml';

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as unknown as number[]);
    }
    return btoa(binary);
}

// TODO(unsupported): wp:anchor positioned drawings (only wp:inline is handled), wrap modes
//   (wp:wrapSquare/Tight/Through), a:xfrm rot (rotation), image cropping (a:srcRect)

export interface DrawingInfo {
    rId: string;
    widthPx?: number;
    heightPx?: number;
}

const EMU_PER_PX = 9525;

function findFirstByName(node: XmlNode | undefined, target: string): XmlNode | undefined {
    if (!node || typeof node !== 'object') return undefined;
    const name = nodeName(node);
    if (name === target) return node;
    for (const child of nodeChildren(node)) {
        const found = findFirstByName(child, target);
        if (found) return found;
    }
    return undefined;
}

export function parseDrawingFromRunXml(drawingXml: string): DrawingInfo | undefined {
    let parsed: XmlNode[];
    try {
        parsed = xmlParser.parse(drawingXml) as XmlNode[];
    } catch {
        return undefined;
    }
    const root = parsed[0];
    return parseDrawingFromXmlNode(root);
}

/**
 * Parse a DrawingInfo directly from an already-parsed XmlNode (avoids re-serializing).
 * The node should be the <w:drawing> element or any ancestor containing <a:blip>.
 */
export function parseDrawingFromXmlNode(node: XmlNode | undefined): DrawingInfo | undefined {
    if (!node) return undefined;
    const blip = findFirstByName(node, 'a:blip');
    if (!blip) return undefined;
    const rId = nodeAttrs(blip)['@_r:embed'];
    if (!rId) return undefined;

    const extent = findFirstByName(node, 'wp:extent');
    const out: DrawingInfo = { rId };
    if (extent) {
        const a = nodeAttrs(extent);
        const cx = Number(a['@_cx']);
        const cy = Number(a['@_cy']);
        if (!Number.isNaN(cx)) out.widthPx = Math.round(cx / EMU_PER_PX);
        if (!Number.isNaN(cy)) out.heightPx = Math.round(cy / EMU_PER_PX);
    }
    return out;
}

/**
 * Resolve a rels Target (relative to word/_rels/document.xml.rels)
 * into a media-map key like "word/media/image1.png".
 */
function resolveMediaPath(target: string): string {
    let t = target.replace(/^\/+/, '');
    while (t.startsWith('../')) t = t.slice(3);
    if (t.startsWith('word/')) return t;
    return `word/${t}`;
}

export function buildDrawing(
    drawingId: string,
    info: DrawingInfo,
    rels: Map<string, ParsedRelationship>,
    media: Map<string, Uint8Array>
): ISimpleDrawing | undefined {
    const rel = rels.get(info.rId);
    if (!rel || rel.type !== 'image') return undefined;
    const path = resolveMediaPath(rel.target);
    const bytes = media.get(path);
    if (!bytes) return undefined;
    const ext = path.split('.').pop()?.toLowerCase() ?? 'png';
    const mime =
        ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'gif'
                ? 'image/gif'
                : ext === 'bmp'
                    ? 'image/bmp'
                    : 'image/png';
    const base64 = bytesToBase64(bytes);
    const width = info.widthPx ?? 100;
    const height = info.heightPx ?? 100;
    return {
        drawingId,
        drawingType: 0,
        imageSourceType: 'BASE64',
        source: `data:${mime};base64,${base64}`,
        transform: { left: 0, top: 0, width, height },
        docTransform: {
            size: { width, height },
            positionH: { relativeFrom: 2, posOffset: 0 },
            positionV: { relativeFrom: 1, posOffset: 0 },
            angle: 0,
        },
    };
}
