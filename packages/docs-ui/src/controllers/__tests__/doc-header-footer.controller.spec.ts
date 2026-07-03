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

import { DocumentFlavor } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { DocumentEditArea, Path, Rect } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloseHeaderFooterCommand } from '../../commands/commands/doc-header-footer.command';
import { TextBubbleShape } from '../../views/header-footer/text-bubble';
import { DocHeaderFooterController } from '../doc-header-footer.controller';

const neoGetDocObjectMock = vi.hoisted(() => vi.fn());

vi.mock('../../basics/component-tools', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../basics/component-tools')>();

    return {
        ...actual,
        neoGetDocObject: neoGetDocObjectMock,
    };
});

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
    } as any;
}

function createController(options: {
    editArea?: DocumentEditArea;
    documentFlavor?: DocumentFlavor;
    editor?: boolean;
} = {}) {
    const pageRender$ = new Subject<any>();
    const commandHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const document = {
        pageRender$,
        onDblclick$: {
            subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })),
        },
        getOffsetConfig: vi.fn(() => ({ documentTransform: { clone: vi.fn() } })),
    };
    const scene = {
        getViewports: vi.fn(() => []),
    };
    neoGetDocObjectMock.mockReturnValue({ document, scene });
    const unit = {
        getSnapshot: vi.fn(() => ({
            documentStyle: {
                documentFlavor: options.documentFlavor ?? DocumentFlavor.TRADITIONAL,
            },
        })),
    };
    const viewModel = {
        getEditArea: vi.fn(() => options.editArea ?? DocumentEditArea.BODY),
    };
    const controller = new DocHeaderFooterController(
        {
            unitId: 'doc-1',
            unit,
            mainComponent: document,
        } as never,
        {
            onCommandExecuted: vi.fn((handler) => {
                commandHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            executeCommand: vi.fn(),
        } as never,
        {
            isEditor: vi.fn(() => options.editor ?? false),
            getEditor: vi.fn(() => null),
        } as never,
        {
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject({ getUnitId: () => 'doc-1' })),
            getUnit: vi.fn(() => unit),
        } as never,
        {
            getRenderById: vi.fn(() => ({ mainComponent: document })),
            getRenderUnitById: vi.fn(() => ({ mainComponent: document })),
        } as never,
        {
            getViewModel: vi.fn(() => viewModel),
        } as never,
        {
            setSegment: vi.fn(),
            setSegmentPage: vi.fn(),
            setCursorManually: vi.fn(),
        } as never,
        {
            t: vi.fn((key: string) => key),
        } as never
    );

    return { controller, pageRender$, commandHandlers, document };
}

describe('DocHeaderFooterController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        neoGetDocObjectMock.mockReset();
    });

    it('closes header/footer editing after rich text changes in modern document mode', () => {
        const { controller, commandHandlers } = createController({
            editArea: DocumentEditArea.HEADER,
            documentFlavor: DocumentFlavor.MODERN,
        });

        commandHandlers[0]({ id: RichTextEditingMutation.id });

        expect((controller as any)._commandService.executeCommand).toHaveBeenCalledWith(CloseHeaderFooterCommand.id, {
            unitId: 'doc-1',
        });

        controller.dispose();
    });

    it('covers header and footer areas while editing the document body', () => {
        const { controller, pageRender$ } = createController({ editArea: DocumentEditArea.BODY });
        const rectSpy = vi.spyOn(Rect, 'drawWith').mockImplementation(() => undefined);
        const pathSpy = vi.spyOn(Path, 'drawWith').mockImplementation(() => undefined);
        const textSpy = vi.spyOn(TextBubbleShape, 'drawWith').mockImplementation(() => undefined);
        const ctx = createCtx();

        pageRender$.next({
            ctx,
            pageLeft: 12,
            pageTop: 24,
            page: {
                pageWidth: 200,
                pageHeight: 300,
                marginTop: 30,
                marginBottom: 40,
            },
        });

        expect(ctx.translate).toHaveBeenCalledWith(11.5, 23.5);
        expect(rectSpy).toHaveBeenCalledTimes(2);
        expect(rectSpy.mock.calls[0][1]).toMatchObject({ width: 200, height: 30, fill: 'rgba(255, 255, 255, 0.5)' });
        expect(rectSpy.mock.calls[1][1]).toMatchObject({ width: 200, height: 40, fill: 'rgba(255, 255, 255, 0.5)' });
        expect(pathSpy).not.toHaveBeenCalled();
        expect(textSpy).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('covers the body and draws header/footer guides while editing header or footer', () => {
        const { controller, pageRender$ } = createController({ editArea: DocumentEditArea.HEADER });
        const rectSpy = vi.spyOn(Rect, 'drawWith').mockImplementation(() => undefined);
        const pathSpy = vi.spyOn(Path, 'drawWith').mockImplementation(() => undefined);
        const textSpy = vi.spyOn(TextBubbleShape, 'drawWith').mockImplementation(() => undefined);
        const ctx = createCtx();

        pageRender$.next({
            ctx,
            pageLeft: 0,
            pageTop: 0,
            page: {
                pageWidth: 200,
                pageHeight: 300,
                marginTop: 30,
                marginBottom: 40,
            },
        });

        expect(rectSpy).toHaveBeenCalledWith(ctx, expect.objectContaining({
            top: 30,
            width: 200,
            height: 230,
        }));
        expect(pathSpy).toHaveBeenCalledTimes(2);
        expect(textSpy).toHaveBeenCalledWith(ctx, expect.objectContaining({ text: 'docs-ui.headerFooter.header' }));
        expect(textSpy).toHaveBeenCalledWith(ctx, expect.objectContaining({ text: 'docs-ui.headerFooter.footer' }));

        controller.dispose();
    });
});
