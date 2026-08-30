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

import type { IImageIoService } from '@univerjs/core';
import { ImageSourceType } from '@univerjs/core';

const IMAGE_PNG_MIME_TYPE = 'image/png';
const IMAGE_SVG_MIME_TYPE = 'image/svg+xml';
const CLIPBOARD_HTML_IMAGE_FETCH_TIMEOUT = 5_000;
const MAX_CLIPBOARD_HTML_IMAGE_COUNT = 32;
const MAX_CLIPBOARD_SVG_SOURCE_LENGTH = 5_000_000;
const MAX_CLIPBOARD_SVG_ELEMENT_COUNT = 50_000;
const PASSTHROUGH_IMAGE_MIME_TYPES = [
    IMAGE_PNG_MIME_TYPE,
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/bmp',
];
const IMAGE_MIME_TYPES_BY_EXTENSION: Record<string, string> = {
    avif: 'image/avif',
    bmp: 'image/bmp',
    gif: 'image/gif',
    heic: 'image/heic',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: IMAGE_PNG_MIME_TYPE,
    svg: 'image/svg+xml',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    webp: 'image/webp',
};

export function extractClipboardImageFiles(clipboardData: DataTransfer): File[] {
    const itemFiles = Array.from(clipboardData.items ?? [])
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null && isClipboardImageFile(file));

    return itemFiles.length > 0
        ? itemFiles
        : Array.from(clipboardData.files ?? []).filter(isClipboardImageFile);
}

export function isClipboardTextImage(text: string): boolean {
    const source = text.trim();
    return /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(source) ||
        (/^<svg(?:\s|>)/i.test(source) && /<\/svg>$/i.test(source));
}

export async function extractClipboardTextImageFile(text: string): Promise<File | null> {
    const source = text.trim();
    if (/^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(source)) {
        try {
            const response = await fetch(source);
            const blob = await response.blob();
            const type = blob.type.split(';')[0].toLowerCase();
            if (type === IMAGE_SVG_MIME_TYPE) {
                const svg = parseSvg(await blob.text());
                return svg ? new File([svg], 'pasted-image.svg', { type }) : null;
            }
            return type.startsWith('image/')
                ? new File([blob], `pasted-image.${imageExtension(type)}`, { type })
                : null;
        } catch {
            return null;
        }
    }

    const svg = parseSvg(source);
    return svg ? new File([svg], 'pasted-image.svg', { type: IMAGE_SVG_MIME_TYPE }) : null;
}

export function isImageOnlyClipboardHtml(html: string): boolean {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const body = doc.body.cloneNode(true) as HTMLElement;
    const hasImage = body.querySelector('img, svg') !== null;
    body.querySelectorAll('img, svg').forEach((element) => element.remove());
    return hasImage && !(body.textContent ?? '').trim() && !body.querySelector('table');
}

export async function extractClipboardHtmlImageFiles(html: string): Promise<File[]> {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sources = Array.from(new Set(Array.from(doc.body.querySelectorAll('img'))
        .filter((image) => !hasHiddenClipboardAncestor(image))
        .map(resolveClipboardHtmlImageSource)
        .filter((source) => /^(?:data|blob|https?):/i.test(source))))
        .slice(0, MAX_CLIPBOARD_HTML_IMAGE_COUNT);
    const fetchedFiles = await Promise.all(sources.map(fetchClipboardImageFile));
    const svgFiles = Array.from(doc.body.querySelectorAll('svg'))
        .filter((svg) => !hasHiddenClipboardAncestor(svg))
        .map((svg, index) => {
            const source = parseSvg(new XMLSerializer().serializeToString(svg));
            return source ? new File([source], `pasted-image-${index + 1}.svg`, { type: IMAGE_SVG_MIME_TYPE }) : null;
        });

    return [...fetchedFiles, ...svgFiles]
        .filter((file): file is File => file !== null)
        .slice(0, MAX_CLIPBOARD_HTML_IMAGE_COUNT);
}

function resolveClipboardHtmlImageSource(image: HTMLImageElement): string {
    const source = image.getAttribute('src') ||
        image.getAttribute('data-src') ||
        image.getAttribute('data-lazy-src') ||
        image.getAttribute('data-original');
    if (source) {
        return source.trim();
    }

    const srcset = image.getAttribute('srcset') ||
        image.closest('picture')?.querySelector('source[srcset]')?.getAttribute('srcset') ||
        '';
    return (srcset.trim().split(/\s+/)[0] ?? '').replace(/,$/, '');
}

async function fetchClipboardImageFile(source: string): Promise<File | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CLIPBOARD_HTML_IMAGE_FETCH_TIMEOUT);
    try {
        const response = await fetch(source, { signal: controller.signal });
        if (!response.ok) {
            return null;
        }
        const blob = await response.blob();
        return blob.type.startsWith('image/')
            ? new File([blob], `pasted-image.${imageExtension(blob.type)}`, { type: blob.type })
            : null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

function hasHiddenClipboardAncestor(element: Element): boolean {
    let current: Element | null = element;
    while (current) {
        if (current.hasAttribute('hidden') || current.getAttribute('aria-hidden')?.toLowerCase() === 'true') {
            return true;
        }
        const classes = current.classList;
        if (classes.contains('sr-only') || classes.contains('visually-hidden') || classes.contains('screen-reader-only')) {
            return true;
        }
        const style = current.getAttribute('style') ?? '';
        if (/(?:^|;)\s*display\s*:\s*none(?:\s*!important)?\s*(?:;|$)/i.test(style) ||
            /(?:^|;)\s*visibility\s*:\s*(?:hidden|collapse)(?:\s*!important)?\s*(?:;|$)/i.test(style)) {
            return true;
        }
        current = current.parentElement;
    }

    return false;
}

export async function normalizeClipboardImageFile(file: File): Promise<File | null> {
    const type = resolveClipboardImageMimeType(file);
    if (!type) {
        return null;
    }
    const typedFile = file.type.toLowerCase() === type ? file : new File([file], file.name, { type });
    if (type === IMAGE_SVG_MIME_TYPE) {
        const svg = parseSvg(await typedFile.text());
        return svg ? new File([svg], typedFile.name || 'pasted-image.svg', { type }) : null;
    }
    if (PASSTHROUGH_IMAGE_MIME_TYPES.includes(type)) {
        return typedFile;
    }

    try {
        const blob = await rasterizeImageBlob(typedFile);
        return blob ? new File([blob], 'pasted-image.png', { type: IMAGE_PNG_MIME_TYPE }) : null;
    } catch {
        return null;
    }
}

export async function svgImageFileToDataUrl(file: File): Promise<string | null> {
    if (resolveClipboardImageMimeType(file) !== IMAGE_SVG_MIME_TYPE) {
        return null;
    }

    const svg = parseSvg(await file.text());
    return svg ? `data:${IMAGE_SVG_MIME_TYPE};charset=utf-8,${encodeURIComponent(svg)}` : null;
}

export async function writeImageSourceToClipboard(
    source: string,
    imageSourceType?: ImageSourceType,
    imageIoService?: IImageIoService
): Promise<boolean> {
    const clipboard = globalThis.navigator?.clipboard;
    const ClipboardItemCtor = globalThis.ClipboardItem;
    if (!source || !clipboard?.write || typeof ClipboardItemCtor === 'undefined') {
        return false;
    }

    try {
        const pngBlob = resolveImageClipboardPng(source, imageSourceType, imageIoService);
        await clipboard.write([new ClipboardItemCtor({ [IMAGE_PNG_MIME_TYPE]: pngBlob })]);
        return true;
    } catch {
        return false;
    }
}

async function resolveImageClipboardPng(
    source: string,
    imageSourceType: ImageSourceType | undefined,
    imageIoService: IImageIoService | undefined
): Promise<Blob> {
    const resolvedSource = await resolveImageSource(source, imageSourceType, imageIoService);
    if (!resolvedSource) {
        throw new Error('Clipboard image source could not be resolved.');
    }
    const response = await fetch(resolvedSource);
    if (!response.ok) {
        throw new Error('Clipboard image source could not be loaded.');
    }
    const imageBlob = await response.blob();
    const pngBlob = imageBlob.type === IMAGE_PNG_MIME_TYPE
        ? imageBlob
        : await rasterizeImageBlob(imageBlob);
    if (!pngBlob) {
        throw new Error('Clipboard image could not be converted to PNG.');
    }

    return pngBlob;
}

async function resolveImageSource(
    source: string,
    imageSourceType: ImageSourceType | undefined,
    imageIoService: IImageIoService | undefined
): Promise<string | null> {
    if (/^(?:data|blob|https?):/i.test(source) && imageSourceType !== ImageSourceType.UUID) {
        return source;
    }

    return imageIoService ? imageIoService.getImage(source) : null;
}

async function rasterizeImageBlob(blob: Blob): Promise<Blob | null> {
    if (!blob.type.startsWith('image/')) {
        return null;
    }

    const objectUrl = URL.createObjectURL(blob);
    try {
        const image = await loadImage(objectUrl);
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
            return null;
        }
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            return null;
        }
        context.drawImage(image, 0, 0);
        return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, IMAGE_PNG_MIME_TYPE));
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

function loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Clipboard image could not be decoded.'));
        image.src = source;
    });
}

function parseSvg(source: string): string | null {
    if (source.length > MAX_CLIPBOARD_SVG_SOURCE_LENGTH ||
        !isClipboardTextImage(source) ||
        !/^<svg(?:\s|>)/i.test(source)) {
        return null;
    }

    const doc = new DOMParser().parseFromString(source, IMAGE_SVG_MIME_TYPE);
    const root = doc.documentElement;
    if (root.localName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
        return null;
    }

    const descendants = root.querySelectorAll('*');
    if (descendants.length > MAX_CLIPBOARD_SVG_ELEMENT_COUNT) {
        return null;
    }
    root.querySelectorAll('script, foreignObject, iframe, object, embed, link').forEach((element) => element.remove());
    root.querySelectorAll('style').forEach((element) => {
        if (hasUnsafeSvgCssReference(element.textContent ?? '')) {
            element.remove();
        }
    });
    [root, ...Array.from(root.querySelectorAll('*'))].forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
            if (/^on/i.test(attribute.name)) {
                element.removeAttribute(attribute.name);
                return;
            }
            if (/^(?:href|xlink:href)$/i.test(attribute.name) && !isSafeSvgReference(attribute.value)) {
                element.removeAttribute(attribute.name);
                return;
            }
            if (hasUnsafeSvgCssReference(attribute.value)) {
                element.removeAttribute(attribute.name);
            }
        });
    });
    if (!root.hasAttribute('xmlns')) {
        root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    return new XMLSerializer().serializeToString(root);
}

function isSafeSvgReference(value: string): boolean {
    const reference = value.trim();
    return reference.startsWith('#') || /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(reference);
}

function hasUnsafeSvgCssReference(value: string): boolean {
    if (/@import/i.test(value)) {
        return true;
    }

    const references = value.match(/url\([^)]*\)/gi) ?? [];
    return references.some((reference) => !/^url\(\s*['"]?#/i.test(reference));
}

function imageExtension(type: string): string {
    const extension = type.split('/')[1] ?? 'png';
    return extension === 'svg+xml' ? 'svg' : extension;
}

function isClipboardImageFile(file: File): boolean {
    return resolveClipboardImageMimeType(file) !== null;
}

function resolveClipboardImageMimeType(file: File): string | null {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) {
        return type;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? IMAGE_MIME_TYPES_BY_EXTENSION[extension] ?? null : null;
}
