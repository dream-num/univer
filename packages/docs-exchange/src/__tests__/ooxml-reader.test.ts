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

import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { readOoxmlBundle } from '../utils/parse/ooxml-reader';

async function makeMinimalDocx(): Promise<Uint8Array> {
    const zip = new JSZip();
    zip.file('word/document.xml', '<w:document xmlns:w="x"><w:body/></w:document>');
    zip.file('word/numbering.xml', '<w:numbering xmlns:w="x"/>');
    zip.file('word/_rels/document.xml.rels', '<Relationships/>');
    zip.file('word/media/image1.png', new Uint8Array([0x89, 0x50, 0x4E, 0x47]));
    return zip.generateAsync({ type: 'uint8array' });
}

describe('readOoxmlBundle', () => {
    it('extracts document.xml, numbering.xml, rels and media', async () => {
        const buf = await makeMinimalDocx();
        const bundle = await readOoxmlBundle(buf);
        expect(bundle.documentXml).toContain('<w:body/>');
        expect(bundle.numberingXml).toContain('w:numbering');
        expect(bundle.relsXml).toContain('Relationships');
        expect(bundle.media?.get('word/media/image1.png')?.length).toBe(4);
    });

    it('accepts ArrayBuffer input', async () => {
        const buf = await makeMinimalDocx();
        const bundle = await readOoxmlBundle(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
        expect(bundle.documentXml).toBeTruthy();
    });

    it('throws when document.xml is missing', async () => {
        const zip = new JSZip();
        zip.file('foo.txt', 'bar');
        const buf = await zip.generateAsync({ type: 'uint8array' });
        await expect(readOoxmlBundle(buf)).rejects.toThrow(/Missing word\/document\.xml/);
    });

    it('throws on non-zip input', async () => {
        await expect(readOoxmlBundle(new Uint8Array([1, 2, 3]))).rejects.toThrow(/Invalid DOCX/);
    });
});
