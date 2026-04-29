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

import { describe, expect, it } from 'vitest';
import { buildDrawing, parseDrawingFromRunXml } from '../utils/parse/parse-drawing';

describe('parseDrawingFromRunXml', () => {
    it('extracts blip rId and EMU size', () => {
        const xml = `<w:drawing xmlns:w="x" xmlns:wp="y" xmlns:a="z" xmlns:r="r">
      <wp:inline>
        <wp:extent cx="952500" cy="952500"/>
        <a:graphic><a:graphicData><pic:pic xmlns:pic="p"><pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill></pic:pic></a:graphicData></a:graphic>
      </wp:inline>
    </w:drawing>`;
        const info = parseDrawingFromRunXml(xml);
        expect(info?.rId).toBe('rId5');
        expect(info?.widthPx).toBe(100);
        expect(info?.heightPx).toBe(100);
    });

    it('returns undefined when no blip', () => {
        expect(parseDrawingFromRunXml('<w:drawing xmlns:w="x"/>')).toBeUndefined();
    });
});

describe('buildDrawing', () => {
    it('returns ISimpleDrawing with all required fields', () => {
        const rels = new Map([['rId1', { type: 'image' as const, target: 'media/image1.png' }]]);
        const media = new Map([['word/media/image1.png', new Uint8Array([0x89, 0x50])]]);
        const d = buildDrawing('d1', { rId: 'rId1', widthPx: 50, heightPx: 60 }, rels, media);
        expect(d).toBeDefined();
        expect(d!.drawingId).toBe('d1');
        expect(d!.drawingType).toBe(0);
        expect(d!.imageSourceType).toBe('BASE64');
        expect(d!.source).toMatch(/^data:image\/png;base64,/);
        expect(d!.transform?.width).toBe(50);
        expect(d!.docTransform?.size.height).toBe(60);
    });

    it('resolves "../media/X" target relative to document.xml.rels', () => {
        const rels = new Map([['rId2', { type: 'image' as const, target: '../media/image2.jpg' }]]);
        const media = new Map([['word/media/image2.jpg', new Uint8Array([0xFF, 0xD8])]]);
        const d = buildDrawing('d2', { rId: 'rId2' }, rels, media);
        expect(d?.source).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('returns undefined when media bytes missing', () => {
        const rels = new Map([['rId3', { type: 'image' as const, target: 'media/missing.png' }]]);
        expect(buildDrawing('d3', { rId: 'rId3' }, rels, new Map())).toBeUndefined();
    });

    it('returns undefined when rId resolves to non-image', () => {
        const rels = new Map([['rId4', { type: 'hyperlink' as const, target: 'https://x.com' }]]);
        expect(buildDrawing('d4', { rId: 'rId4' }, rels, new Map())).toBeUndefined();
    });
});
