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

export interface IDocsCustomBlockRenderViewportInput {
    blockLeft?: number;
    fallbackHeight: number;
    fallbackWidth: number;
    pageMarginLeft?: number;
    pageMarginRight?: number;
    pageWidth?: number;
}

export interface IDocsCustomBlockRenderViewport {
    bleedLeft?: number;
    bleedWidth?: number;
    contentHeight?: number;
    contentWidth?: number;
    height: number;
    layoutWidth?: number;
    offsetLeft?: number;
    viewportHeight?: number;
    width: number;
}

export type DocsCustomBlockRenderViewportProvider = (
    unitId: string,
    blockId: string,
    input: IDocsCustomBlockRenderViewportInput
) => IDocsCustomBlockRenderViewport | null | undefined;

let docsCustomBlockRenderViewportProvider: DocsCustomBlockRenderViewportProvider | null = null;
const docsCustomBlockRenderViewportProviders = new Set<DocsCustomBlockRenderViewportProvider>();

export function setDocsCustomBlockRenderViewportProvider(provider: DocsCustomBlockRenderViewportProvider | null): () => void {
    if (provider == null) {
        docsCustomBlockRenderViewportProvider = null;
        docsCustomBlockRenderViewportProviders.clear();
        return () => {};
    }

    docsCustomBlockRenderViewportProvider = provider;
    docsCustomBlockRenderViewportProviders.add(provider);
    return () => {
        docsCustomBlockRenderViewportProviders.delete(provider);
        const providers = Array.from(docsCustomBlockRenderViewportProviders);
        docsCustomBlockRenderViewportProvider = providers[providers.length - 1] ?? null;
    };
}

export function getDocsCustomBlockRenderViewport(
    unitId: string,
    blockId: string,
    input: IDocsCustomBlockRenderViewportInput
): IDocsCustomBlockRenderViewport | null {
    const providers = docsCustomBlockRenderViewportProviders.size
        ? Array.from(docsCustomBlockRenderViewportProviders).reverse()
        : docsCustomBlockRenderViewportProvider
            ? [docsCustomBlockRenderViewportProvider]
            : [];

    for (const provider of providers) {
        const viewport = provider(unitId, blockId, input);
        if (viewport != null) {
            return viewport;
        }
    }

    return null;
}
