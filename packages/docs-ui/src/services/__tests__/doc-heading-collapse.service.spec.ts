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
import {
    DocumentFlavor,
    ICommandService,
    LocaleService,
    LocaleType,
    NamedStyleType,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    SetHeadingCollapsedCommand,
    UniverDocsPlugin,
} from '@univerjs/docs';
import {
    CanvasColorService,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    ScrollBar,
    UniverRenderingContext,
    Vector2,
    Viewport,
} from '@univerjs/engine-render';
import {
    DesktopLayoutService,
    ILayoutService,
} from '@univerjs/ui';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import enUS from '../../locale/en-US';
import { HeadingCollapseShape } from '../../views/heading-collapse-shape';
import { DocEventManagerService } from '../doc-event-manager.service';
import { DocHeadingCollapseService } from '../doc-heading-collapse.service';

function createTestBed(documentFlavor = DocumentFlavor.MODERN, nested = false) {
    const context = new Proxy({ font: '', measureText: (text: string) => ({ width: text.length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }) }, {
        get: (target, key) => key in target ? Reflect.get(target, key) : () => {},
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    onTestFinished(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });
    univer.registerPlugin(UniverDocsPlugin);
    const injector = univer.__getInjector();
    injector.get(LocaleService).setDirection('ltr');
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'heading-controls',
        documentStyle: { documentFlavor, pageSize: { width: 400, height: 600 }, marginLeft: 40, marginTop: 20 },
        body: { dataStream: 'One\rText\rTwo\rTail\r\n', paragraphs: [
            { paragraphId: 'one', startIndex: 3, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { paragraphId: 'text', startIndex: 8 },
            { paragraphId: 'two', startIndex: 12, paragraphStyle: { namedStyleType: nested ? NamedStyleType.HEADING_2 : NamedStyleType.HEADING_1 } },
            { paragraphId: 'tail', startIndex: 17 },
        ] },
    });
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.engine.resizeBySize(400, 600);
    const canvas = render.engine.getCanvasElement();
    canvas.style.width = '400px';
    Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 600 });
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 400, 600));
    const viewport = new Viewport('viewMain', render.scene, { left: 0, top: 0, width: 400, height: 600 });
    onTestFinished(() => viewport.dispose());
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    const manager = render.with(DocSkeletonManagerService);
    const documents = new Documents('heading-controls-documents', manager.getSkeleton());
    render.mainComponent = documents;
    render.scene.addObject(documents);
    render.addRenderDependencies([[DocEventManagerService], [DocHeadingCollapseService]]);
    const service = render.with(DocHeadingCollapseService);
    const buttons = () => render.scene.getAllObjects().filter((object): object is HeadingCollapseShape => object instanceof HeadingCollapseShape);
    return { injector, manager, model, service, render, viewport, buttons, context };
}

describe('DocHeadingCollapseService', () => {
    it('updates Canvas geometry after folding and disposes every button', () => {
        const { injector, manager, service, buttons } = createTestBed();
        expect(buttons()).toHaveLength(2);
        const second = buttons().find((button) => button.oKey.endsWith('two'))!;
        const initialTop = second.top;
        expect(injector.get(ICommandService).syncExecuteCommand(SetHeadingCollapsedCommand.id, { unitId: 'heading-controls', paragraphId: 'one', collapsed: true })).toBe(true);
        manager.recalculate();
        expect(buttons()).toHaveLength(2);
        expect(second.top).toBeLessThan(initialTop);
        service.dispose();
        service.dispose();
        expect(buttons()).toHaveLength(0);
    });

    it('activates through the Canvas hit target without starting document selection', () => {
        const { model, buttons } = createTestBed();
        const first = buttons()[0];
        const preventDefault = vi.fn();
        expect(first.onPointerDown$.emitEvent({ button: 0, preventDefault } as never).stopPropagation).toBe(true);
        expect(first.onPointerUp$.emitEvent({ button: 0, preventDefault } as never).stopPropagation).toBe(true);
        expect(model.getBody()!.paragraphs![0].headingCollapsed).toBe(true);
        expect(preventDefault).toHaveBeenCalledTimes(2);
    });

    it('keeps world coordinates and Canvas hit targets aligned after scrolling and zooming', () => {
        const { render, viewport, buttons } = createTestBed();
        render.scene.width = 1600;
        render.scene.height = 1600;
        const scrollBar = new ScrollBar(viewport, { enableHorizontal: true });
        onTestFinished(() => scrollBar.dispose());
        const button = buttons()[1];
        const left = button.left;
        const top = button.top;
        render.scene.scale(1.75, 1.75);
        viewport.scrollToViewportPos({ viewportScrollY: 20, viewportScrollX: 5 });
        const point = new Vector2(
            (left + button.width / 2 - viewport.viewportScrollX) * 1.75,
            (top + button.height / 2 - viewport.viewportScrollY) * 1.75
        );
        expect(render.scene.pick(point)).toBe(button);
        expect(button.left).toBe(left);
        expect(button.top).toBe(top);
    });

    it('keeps a hovered arrow blue during background resizing and unchanged scroll notifications', () => {
        const { injector, render, viewport, buttons, context } = createTestBed();
        const button = buttons()[0];
        const ctx = new UniverRenderingContext(context as never);
        const theme = injector.get(ThemeService);
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        render.scene.transformByState({ height: 1600 });
        render.scene.scale(1, 1);
        viewport.onScrollAfter$.emitEvent({ scrollX: 0, scrollY: 0, viewportScrollX: 0, viewportScrollY: 0 });
        button.render(ctx);
        expect(Reflect.get(context, 'fillStyle')).toBe(theme.getColorFromTheme('primary.600'));
        render.scene.scale(1.75, 1.75);
        button.render(ctx);
        expect(Reflect.get(context, 'fillStyle')).toBe(theme.getColorFromTheme('gray.900'));
        button.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        viewport.onScrollAfter$.emitEvent({ scrollX: 0, scrollY: 5, viewportScrollX: 0, viewportScrollY: 5 });
        button.render(ctx);
        expect(Reflect.get(context, 'fillStyle')).toBe(theme.getColorFromTheme('gray.900'));
    });

    it('removes hidden child controls and cancels their pending tooltips', () => {
        const { injector, manager, buttons } = createTestBed(DocumentFlavor.MODERN, true);
        vi.useFakeTimers();
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const parent = buttons()[0];
        const child = buttons()[1];
        child.onPointerEnter$.emitEvent({ buttons: 0 } as never);
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        injector.get(ICommandService).syncExecuteCommand(SetHeadingCollapsedCommand.id, {
            unitId: 'heading-controls',
            paragraphId: 'one',
            collapsed: true,
        });
        manager.recalculate();
        expect(buttons()).toEqual([parent]);
        expect(clearTimeoutSpy).toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        injector.get(ICommandService).syncExecuteCommand(SetHeadingCollapsedCommand.id, {
            unitId: 'heading-controls',
            paragraphId: 'one',
            collapsed: false,
        });
        manager.recalculate();
        expect(buttons()).toHaveLength(2);
        expect(buttons().find((button) => button.oKey.endsWith('two'))).not.toBe(child);
    });

    it('moves a programmatic selection out of hidden content', () => {
        const { injector, manager, render } = createTestBed();
        const selections = injector.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: 'heading-controls', subUnitId: 'heading-controls' });
        injector.get(ICommandService).syncExecuteCommand(SetHeadingCollapsedCommand.id, { unitId: 'heading-controls', paragraphId: 'one', collapsed: true });
        manager.recalculate();
        selections.__TEST_ONLY_add([{ startOffset: 6, endOffset: 6, collapsed: true, isActive: true }]);
        render.scene.render();
        expect(selections.getActiveTextRange()).toMatchObject({ startOffset: 3, endOffset: 3, collapsed: true });
    });

    it('creates no controls in traditional mode', () => {
        const { buttons } = createTestBed(DocumentFlavor.TRADITIONAL);
        expect(buttons()).toHaveLength(0);
    });
});
