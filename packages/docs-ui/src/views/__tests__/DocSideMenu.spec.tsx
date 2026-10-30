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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import type { Root } from 'react-dom/client';
import {
    DocumentFlavor,
    IConfigService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    NamedStyleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocLayoutExecutorService, DocSkeletonManagerService } from '@univerjs/docs';
import {
    CanvasColorService,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    ScrollBar,
    setDocsTableRenderViewportProvider,
    Viewport,
} from '@univerjs/engine-render';
import { IWorkbenchService, RediContext, WorkbenchService } from '@univerjs/ui';
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { genEmptyTable, genTableSource } from '../../commands/commands/table/table';
import { defaultPluginConfig, DOCS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import enUS from '../../locale/en-US';
import { DocEventManagerService } from '../../services/doc-event-manager.service';
import { DocSideMenu } from '../DocSideMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createDocument(id: string, title: string): IDocumentData {
    const table = genEmptyTable(1, 1);
    const dataStream = `${table.dataStream}\r\n`;
    return {
        id,
        title,
        body: {
            ...table,
            dataStream,
            paragraphs: [...table.paragraphs, { startIndex: dataStream.length - 2, paragraphId: `${id}-tail` }],
            sectionBreaks: [...table.sectionBreaks, { startIndex: dataStream.length - 1, sectionId: `${id}-section` }],
            tables: [{ startIndex: 0, endIndex: table.dataStream.length, tableId: `${id}-table` }],
        },
        tableSource: { [`${id}-table`]: { ...genTableSource(1, 1, 1200), tableId: `${id}-table` } },
        documentStyle: {
            pageSize: { width: 1400, height: 1600 },
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
        },
    };
}

// DOM measurement and notifications are supplied by the browser in production.
class TestResizeObserver {
    private _timer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly _callback: () => void) {}

    observe() {
        this._timer = setTimeout(this._callback, 0);
    }

    disconnect() {
        clearTimeout(this._timer);
    }
}

describe('DocSideMenu', () => {
    let univer: Univer;
    let root: Root;
    let container: HTMLDivElement;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('ResizeObserver', TestResizeObserver);
        const context = new Proxy({
            font: '',
            webkitBackingStorePixelRatio: 1,
            measureText: (text: string) => ({
                width: text.length * 8,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
            }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
        const getBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            if (this.tagName === 'NAV') {
                return { ...getBoundingClientRect.call(this), height: this.textContent?.includes('Tall outline') ? 300 : 80 };
            }
            return getBoundingClientRect.call(this);
        });
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([DocLayoutExecutorService]);
        injector.add([IWorkbenchService, { useClass: WorkbenchService }]);
        injector.get(IWorkbenchService);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        univer.dispose();
        container.remove();
        setDocsTableRenderViewportProvider(null);
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it.each([
        [DocumentFlavor.MODERN, undefined, true],
        [DocumentFlavor.TRADITIONAL, undefined, false],
        [DocumentFlavor.MODERN, false, false],
        [DocumentFlavor.TRADITIONAL, true, true],
        [DocumentFlavor.MODERN, true, true],
        [DocumentFlavor.TRADITIONAL, false, false],
    ])('applies outline visibility for flavor %s and toc %s', (documentFlavor, toc, visible) => {
        const injector = univer.__getInjector();
        injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { ...defaultPluginConfig, toc });
        const data = createDocument('doc', 'Document title');
        data.documentStyle.documentFlavor = documentFlavor;
        univer.createUnit(UniverInstanceType.UNIVER_DOC, data);

        act(() => root.render(<RediContext.Provider value={{ injector }}><DocSideMenu /></RediContext.Provider>));

        expect(container.querySelector('button[aria-expanded]') !== null).toBe(visible);
    });

    it('updates the default outline visibility when switching between document modes', () => {
        const injector = univer.__getInjector();
        injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, defaultPluginConfig);
        for (const documentFlavor of [DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL]) {
            const data = createDocument(String(documentFlavor), 'Document title');
            data.documentStyle.documentFlavor = documentFlavor;
            univer.createUnit(UniverInstanceType.UNIVER_DOC, data);
        }
        act(() => root.render(<RediContext.Provider value={{ injector }}><DocSideMenu /></RediContext.Provider>));
        const instanceService = injector.get(IUniverInstanceService);
        for (const [documentFlavor, visible] of [[DocumentFlavor.MODERN, true], [DocumentFlavor.TRADITIONAL, false], [DocumentFlavor.MODERN, true]] as const) {
            act(() => instanceService.focusUnit(String(documentFlavor)));
            expect(container.querySelector('button[aria-expanded]') !== null).toBe(visible);
        }
    });

    it('updates outline visibility when the configuration changes', () => {
        const injector = univer.__getInjector();
        const configService = injector.get(IConfigService);
        configService.setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { toc: true });
        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocument('doc', 'Document title'));
        act(() => root.render(<RediContext.Provider value={{ injector }}><DocSideMenu /></RediContext.Provider>));

        for (const toc of [false, true]) {
            act(() => configService.setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { toc }, { merge: true }));
            expect(container.querySelector('button[aria-expanded]') !== null).toBe(toc);
        }
    });

    it('cancels document and layout updates when the outline unmounts', () => {
        const injector = univer.__getInjector();
        injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { toc: true });
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocument('outline-lifecycle', 'Document title')
        );
        const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
        render.deactivate();
        render.engine.resizeBySize(1400, 800);
        render.addRenderDependencies([[DocSkeletonManagerService]]);
        render.mainComponent = new Documents(model.getUnitId(), render.with(DocSkeletonManagerService).getSkeleton());
        render.mainComponent.translate(400, 0);
        render.scene.addObject(render.mainComponent);
        render.disposeWithMe(new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene));
        render.addRenderDependencies([[DocEventManagerService]]);

        for (let cycle = 0; cycle < 3; cycle++) {
            act(() => root.render(<StrictMode><RediContext.Provider value={{ injector }}><DocSideMenu /></RediContext.Provider></StrictMode>));
            act(() => vi.advanceTimersByTime(150));
            act(() => model.reset({ ...model.getSnapshot(), title: `Updated title ${cycle}` }));
            act(() => vi.advanceTimersByTime(150));
            expect(container.querySelector('nav')?.textContent).toContain(`Updated title ${cycle}`);

            act(() => {
                model.reset({ ...model.getSnapshot(), title: `Pending title ${cycle}` });
                render.engine.resizeBySize(1400 + cycle, 900 + cycle);
            });
            expect(vi.getTimerCount()).toBeGreaterThan(0);

            act(() => root.render(null));

            expect(vi.getTimerCount()).toBe(0);
            expect(model.change$.observed).toBe(false);
        }
    });

    it('remeasures a shorter document instead of retaining the previous collapsed outline height', () => {
        const injector = univer.__getInjector();
        injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { toc: true });
        setDocsTableRenderViewportProvider(() => ({
            contentWidth: 1200,
            leadingInsetLeft: 384,
            viewportLeft: 16,
            viewportWidth: 1400,
            scrollLeft: 300,
        }));
        for (const [id, title] of [['tall', 'Tall outline'], ['short', 'Short outline']]) {
            univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, createDocument(id, title));
            const render = injector.get(IRenderManagerService).createRender(id) as RenderUnit;
            render.deactivate();
            render.engine.resizeBySize(1400, 800);
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            const documents = new Documents(id, render.with(DocSkeletonManagerService).getSkeleton());
            documents.translate(400, 200);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            render.components.set(id, documents);
            render.disposeWithMe(new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene));
            render.addRenderDependencies([[DocEventManagerService]]);
            expect(render.with(DocEventManagerService).tableBounds.size).toBe(1);
        }
        const instanceService = injector.get(IUniverInstanceService);
        act(() => {
            instanceService.focusUnit('tall');
            root.render(<RediContext.Provider value={{ injector }}><DocSideMenu /></RediContext.Provider>);
        });
        act(() => vi.advanceTimersByTime(150));
        expect(container.querySelector('button[aria-expanded="false"]')).not.toBeNull();
        expect(container.querySelector('nav')).toBeNull();

        act(() => instanceService.focusUnit('short'));
        act(() => vi.advanceTimersByTime(150));
        expect(container.querySelector('button[aria-expanded="true"]')).not.toBeNull();
        expect(container.querySelector('nav')?.textContent).toContain('Short outline');
    });

    it.each([
        [undefined, true],
        ['shared-heading-id', true],
        ['legacy-heading-id', false],
    ] as const)('navigates and highlights headings with headingId %s and paragraph IDs %s', (headingId, hasParagraphIds) => {
        const injector = univer.__getInjector();
        injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { toc: true });
        const lines = ['First heading', ...Array.from({ length: 60 }, () => 'Body text'), 'Second heading', 'Final body'];
        let offset = 0;
        const data: IDocumentData = {
            id: 'headings',
            title: 'Document title',
            body: {
                dataStream: `${lines.join('\r')}\r\n`,
                paragraphs: lines.map((text, index) => {
                    offset += text.length + 1;
                    return {
                        startIndex: offset - 1,
                        paragraphId: `paragraph-${index}`,
                        paragraphStyle: {
                            namedStyleType: index === 0 || index === 61 ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
                            headingId: hasParagraphIds ? headingId : `${headingId}-${index}`,
                        },
                    };
                }),
                sectionBreaks: [{ startIndex: lines.join('\r').length + 1, sectionId: 'section' }],
            },
            documentStyle: { pageSize: { width: 1400, height: 2400 } },
        };
        if (!hasParagraphIds) {
            data.body!.paragraphs!.forEach((paragraph) => Reflect.deleteProperty(paragraph, 'paragraphId'));
        }
        const originalHeadingIds = data.body!.paragraphs!.map((paragraph) => paragraph.paragraphStyle?.headingId);
        const originalParagraphIds = data.body!.paragraphs!.map((paragraph) => paragraph.paragraphId);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        const render = injector.get(IRenderManagerService).createRender(data.id) as RenderUnit;
        render.deactivate();
        render.engine.resizeBySize(1400, 400);
        render.addRenderDependencies([[DocSkeletonManagerService]]);
        const documents = new Documents(data.id, render.with(DocSkeletonManagerService).getSkeleton());
        documents.translate(400, 0);
        render.mainComponent = documents;
        render.scene.addObject(documents);
        render.components.set(data.id, documents);
        const viewport = new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene);
        render.disposeWithMe(viewport);
        render.disposeWithMe(new ScrollBar(viewport, { mainScene: render.scene }));
        render.scene.transformByState({ width: 1400, height: 3000 });
        render.addRenderDependencies([[DocEventManagerService]]);
        const bounds = render.with(DocEventManagerService).paragraphBounds;
        const secondHeadingTop = bounds.get(data.body!.paragraphs![61].startIndex)!.rect.top;
        expect(secondHeadingTop).toBeGreaterThan(400);

        act(() => root.render(<RediContext.Provider value={{ injector }}><DocSideMenu /></RediContext.Provider>));
        act(() => vi.advanceTimersByTime(150));
        const headingButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('nav button'));
        expect(headingButtons.map((button) => button.textContent)).toEqual(['Document title', 'First heading', 'Second heading']);
        expect(container.querySelectorAll('[aria-current="location"]')).toHaveLength(0);

        act(() => headingButtons[2].click());
        expect(viewport.viewportScrollY).toBeCloseTo(secondHeadingTop);
        expect(container.querySelectorAll('[aria-current="location"]')).toHaveLength(1);
        expect(headingButtons[2].getAttribute('aria-current')).toBe('location');

        act(() => vi.advanceTimersByTime(100));
        act(() => viewport.scrollToViewportPos({ viewportScrollY: bounds.get(data.body!.paragraphs![10].startIndex)!.rect.top }));
        expect(container.querySelectorAll('[aria-current="location"]')).toHaveLength(1);
        expect(headingButtons[1].getAttribute('aria-current')).toBe('location');
        expect(model.getBody()?.paragraphs?.map((paragraph) => paragraph.paragraphStyle?.headingId)).toEqual(originalHeadingIds);
        expect(model.getBody()?.paragraphs?.map((paragraph) => paragraph.paragraphId)).toEqual(originalParagraphIds);
    });
});
