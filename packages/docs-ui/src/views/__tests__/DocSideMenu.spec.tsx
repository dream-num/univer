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
    IConfigService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
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
    setDocsTableRenderViewportProvider,
    Viewport,
} from '@univerjs/engine-render';
import { IWorkbenchService, RediContext, WorkbenchService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { genEmptyTable, genTableSource } from '../../commands/commands/table/table';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
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

describe('DocSideMenu height invalidation', () => {
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

    it('remeasures a shorter document instead of retaining the previous collapsed outline height', () => {
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([DocLayoutExecutorService]);
        injector.add([IWorkbenchService, { useClass: WorkbenchService }]);
        injector.get(IWorkbenchService);
        injector.get(IConfigService).setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, { toc: true });
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
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
});
