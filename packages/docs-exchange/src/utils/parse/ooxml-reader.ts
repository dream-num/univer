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

import type { Buffer } from 'node:buffer';
import type { OoxmlBundle } from './types';
import JSZip from 'jszip';

export type DocxInput = Blob | ArrayBuffer | Uint8Array | Buffer | SharedArrayBuffer;

async function toUint8Array(input: DocxInput): Promise<Uint8Array> {
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer || input instanceof SharedArrayBuffer) return new Uint8Array(input);
    if (typeof Blob !== 'undefined' && input instanceof Blob) {
        return new Uint8Array(await input.arrayBuffer());
    }
    throw new Error('Invalid DOCX: unsupported input type');
}

async function readOptionalText(zip: JSZip, path: string): Promise<string | undefined> {
    const file = zip.file(path);
    return file ? file.async('string') : undefined;
}

export async function readOoxmlBundle(input: DocxInput): Promise<OoxmlBundle> {
    const data = await toUint8Array(input);

    let zip: JSZip;
    try {
        zip = await JSZip.loadAsync(data);
    } catch (err) {
        throw new Error(`Invalid DOCX: not a zip archive (${(err as Error).message})`);
    }

    const documentXml = await readOptionalText(zip, 'word/document.xml');
    if (!documentXml) {
        throw new Error('Missing word/document.xml');
    }

    const numberingXml = await readOptionalText(zip, 'word/numbering.xml');
    const stylesXml = await readOptionalText(zip, 'word/styles.xml');
    const themeXml = await readOptionalText(zip, 'word/theme/theme1.xml');
    const relsXml = await readOptionalText(zip, 'word/_rels/document.xml.rels');
    const settingsXml = await readOptionalText(zip, 'word/settings.xml');

    const headers = new Map<string, string>();
    const footers = new Map<string, string>();
    const headerRels = new Map<string, string>();
    const footerRels = new Map<string, string>();
    const headerFooterRe = /^word\/(header|footer)(\d+)\.xml$/;
    const headerFooterRelsRe = /^word\/_rels\/(header|footer)(\d+)\.xml\.rels$/;
    const hfPromises: Promise<void>[] = [];
    zip.forEach((path, file) => {
        if (file.dir) return;
        const m = headerFooterRe.exec(path);
        if (m) {
            const stem = `${m[1]}${m[2]}`;
            hfPromises.push(file.async('string').then((s) => void (m[1] === 'header' ? headers : footers).set(stem, s)));
            return;
        }
        const r = headerFooterRelsRe.exec(path);
        if (r) {
            const stem = `${r[1]}${r[2]}`;
            hfPromises.push(file.async('string').then((s) => void (r[1] === 'header' ? headerRels : footerRels).set(stem, s)));
        }
    });
    await Promise.all(hfPromises);

    const media = new Map<string, Uint8Array>();
    const mediaFolder = zip.folder('word/media');
    if (mediaFolder) {
        const promises: Promise<void>[] = [];
        mediaFolder.forEach((relative, file) => {
            if (file.dir) return;
            const fullPath = `word/media/${relative}`;
            promises.push(file.async('uint8array').then((bytes) => void media.set(fullPath, bytes)));
        });
        await Promise.all(promises);
    }

    return {
        documentXml,
        numberingXml,
        stylesXml,
        themeXml,
        relsXml,
        settingsXml,
        media,
        headers: headers.size > 0 ? headers : undefined,
        footers: footers.size > 0 ? footers : undefined,
        headerRels: headerRels.size > 0 ? headerRels : undefined,
        footerRels: footerRels.size > 0 ? footerRels : undefined,
    };
}
