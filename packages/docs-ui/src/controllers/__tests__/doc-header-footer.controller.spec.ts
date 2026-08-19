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

import {
    DocumentFlavor,
    ICommandService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService, Path, Rect } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloseHeaderFooterCommand } from '../../commands/commands/doc-header-footer.command';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';
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
    };
}

function createController(options: {
    editArea?: DocumentEditArea;
    documentFlavor?: DocumentFlavor;
    editor?: boolean;
} = {}) {
    const pageRender$ = new Subject<{
        ctx: ReturnType<typeof createCtx>;
        pageLeft: number;
        pageTop: number;
        page: {
            pageWidth: number;
            pageHeight: number;
            marginTop: number;
            marginBottom: number;
        };
    }>();
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
    const commandService = {
        onCommandExecuted: vi.fn((handler) => {
            commandHandlers.push(handler);
            return { dispose: vi.fn() };
        }),
        executeCommand: vi.fn(),
    };
    const context = {
        unitId: 'doc-1',
        unit,
        mainComponent: document,
    } as never;
    const injector = new Injector([
        [ICommandService, { useValue: commandService }],
        [IEditorService, { useValue: {
            isEditor: vi.fn(() => options.editor ?? false),
            getEditor: vi.fn(() => null),
        } }],
        [IUniverInstanceService, { useValue: {
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject({ getUnitId: () => 'doc-1' })),
            getUnit: vi.fn(() => unit),
        } }],
        [IRenderManagerService, { useValue: {
            getRenderUnitById: vi.fn(() => ({ mainComponent: document })),
        } }],
        [DocSkeletonManagerService, { useValue: {
            getViewModel: vi.fn(() => viewModel),
        } }],
        [DocSelectionRenderService, { useValue: {
            setSegment: vi.fn(),
            setSegmentPage: vi.fn(),
            setCursorManually: vi.fn(),
        } }],
        [LocaleService, { useValue: {
            t: vi.fn((key: string) => key),
        } }],
        [ThemeService],
    ]);
    const controller = injector.createInstance(DocHeaderFooterController, context);

    return { controller, pageRender$, commandHandlers, commandService, document, themeService: injector.get(ThemeService) };
}

describe('DocHeaderFooterController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        neoGetDocObjectMock.mockReset();
    });

    it('closes header/footer editing after rich text changes in modern document mode', () => {
        const { controller, commandHandlers, commandService } = createController({
            editArea: DocumentEditArea.HEADER,
            documentFlavor: DocumentFlavor.MODERN,
        });

        commandHandlers[0]({ id: RichTextEditingMutation.id });

        expect(commandService.executeCommand).toHaveBeenCalledWith(CloseHeaderFooterCommand.id, {
            unitId: 'doc-1',
        });

        controller.dispose();
    });

    it('covers header and footer areas while editing the document body', () => {
        const { controller, pageRender$, themeService } = createController({ editArea: DocumentEditArea.BODY });
        const rectSpy = vi.spyOn(Rect, 'drawWith').mockImplementation(() => undefined);
        const pathSpy = vi.spyOn(Path, 'drawWith').mockImplementation(() => undefined);
        const textSpy = vi.spyOn(TextBubbleShape, 'drawWith').mockImplementation(() => undefined);
        const ctx = createCtx();
        const theme = themeService.getCurrentTheme();

        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                0: '#123456',
            },
        });

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
        expect(rectSpy.mock.calls[0][1]).toMatchObject({
            width: 200,
            height: 30,
            fill: 'rgba(18,52,86,0.5)',
        });
        expect(rectSpy.mock.calls[1][1]).toMatchObject({
            width: 200,
            height: 40,
            fill: 'rgba(18,52,86,0.5)',
        });
        expect(pathSpy).not.toHaveBeenCalled();
        expect(textSpy).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('covers the body and draws header/footer guides while editing header or footer', () => {
        const { controller, pageRender$, themeService } = createController({ editArea: DocumentEditArea.HEADER });
        const rectSpy = vi.spyOn(Rect, 'drawWith').mockImplementation(() => undefined);
        const pathSpy = vi.spyOn(Path, 'drawWith').mockImplementation(() => undefined);
        const textSpy = vi.spyOn(TextBubbleShape, 'drawWith').mockImplementation(() => undefined);
        const ctx = createCtx();
        const theme = themeService.getCurrentTheme();

        themeService.setTheme({
            ...theme,
            primary: {
                ...theme.primary,
                600: '#123456',
            },
        });

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
        expect(pathSpy).toHaveBeenCalledWith(ctx, expect.objectContaining({ stroke: '#123456' }));
        expect(textSpy).toHaveBeenCalledWith(ctx, expect.objectContaining({
            text: 'docs-ui.headerFooter.header',
            color: 'rgba(18,52,86,0.08)',
        }));
        expect(textSpy).toHaveBeenCalledWith(ctx, expect.objectContaining({
            text: 'docs-ui.headerFooter.footer',
            color: 'rgba(18,52,86,0.08)',
        }));

        controller.dispose();
    });

    it('keeps theme color lookups out of the page render hot path', () => {
        const { controller, pageRender$, themeService } = createController({ editArea: DocumentEditArea.BODY });
        const getColorFromTheme = vi.spyOn(themeService, 'getColorFromTheme');
        vi.spyOn(Rect, 'drawWith').mockImplementation(() => undefined);
        const theme = themeService.getCurrentTheme();
        const config = {
            ctx: createCtx(),
            pageLeft: 0,
            pageTop: 0,
            page: {
                pageWidth: 200,
                pageHeight: 300,
                marginTop: 30,
                marginBottom: 40,
            },
        };

        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                0: '#123456',
            },
        });
        getColorFromTheme.mockClear();

        pageRender$.next(config);
        pageRender$.next(config);

        expect(getColorFromTheme).not.toHaveBeenCalled();

        controller.dispose();
    });
});
