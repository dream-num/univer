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

import { BuiltInUIPart } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { AppUIController } from '../app-ui-controller';
import { DocContainerUIController } from '../doc-container-ui-controller';
import { DocParagraphSettingController } from '../doc-paragraph-setting.controller';
import { DocUIController } from '../doc-ui.controller';

function createDisposable() {
    return {
        dispose: vi.fn(),
    };
}

describe('docs ui controllers', () => {
    it('creates the doc container controller through the injector in app ui controller', () => {
        const docContainerController = {};
        const injector = {
            createInstance: vi.fn(() => docContainerController),
        };

        const controller = new AppUIController(injector as never);

        expect(controller).toBeInstanceOf(AppUIController);
        expect(injector.createInstance).toHaveBeenCalledWith(DocContainerUIController);
    });

    it('stores the mounted doc container and exposes locale/config helpers', () => {
        const contentRef = { current: { id: 'content' } };
        const docContainer = {
            getContentRef: vi.fn(() => contentRef),
        };
        const localeService = {
            setLocale: vi.fn(),
        };
        const injector = { id: 'injector' };
        const configService = {
            getConfig: vi.fn(() => ({ toolbar: true })),
        };

        const controller = new DocContainerUIController(
            localeService as never,
            injector as never,
            configService as never
        );
        const uiConfig = controller.getUIConfig();

        expect(uiConfig.injector).toBe(injector);
        expect(uiConfig.config).toEqual({ toolbar: true });

        uiConfig.changeLocale('zhCN');
        uiConfig.getComponent(docContainer as never);

        expect(localeService.setLocale).toHaveBeenCalledWith('zhCN');
        expect(controller.getDocContainer()).toBe(docContainer);
        expect(controller.getContentRef()).toBe(contentRef);
        expect(controller.UIDidMount((mounted: unknown) => mounted)).toBe(docContainer);
    });

    it('throws when the doc container content ref is not ready', () => {
        const controller = new DocContainerUIController(
            { setLocale: vi.fn() } as never,
            {} as never,
            { getConfig: vi.fn() } as never
        );

        expect(() => controller.getComponent({
            getContentRef: () => ({ current: null }),
        } as never)).toThrowError('container is not ready');
    });

    it('registers the paragraph setting view and controls the sidebar panel', () => {
        const componentManager = {
            register: vi.fn(() => createDisposable()),
        };
        const sidebarService = {
            open: vi.fn(),
            close: vi.fn(),
        };

        const controller = new DocParagraphSettingController(
            {} as never,
            componentManager as never,
            sidebarService as never
        );

        controller.openPanel();
        controller.closePanel();

        expect(componentManager.register).toHaveBeenCalledTimes(1);
        expect(componentManager.register).toHaveBeenCalledWith('doc_ui_paragraph-setting-panel', expect.anything());
        expect(sidebarService.open).toHaveBeenCalledWith(expect.objectContaining({
            header: { title: 'doc.slider.paragraphSetting' },
            children: { label: 'doc_ui_paragraph-setting-panel' },
            width: 300,
        }));
        expect(sidebarService.close).toHaveBeenCalledWith(undefined);
    });

    it('registers doc ui components, commands, shortcuts, ui parts, and focus handlers', () => {
        const componentManager = {
            register: vi.fn(() => createDisposable()),
        };
        const registeredFocusHandlers: Array<(unitId: string) => void> = [];
        const commandService = {
            registerCommand: vi.fn(() => createDisposable()),
        };
        const layoutService = {
            registerFocusHandler: vi.fn((_type, handler) => {
                registeredFocusHandlers.push(handler);
                return createDisposable();
            }),
        };
        const menuManagerService = {
            mergeMenu: vi.fn(),
        };
        const uiPartsService = {
            registerComponent: vi.fn(() => createDisposable()),
        };
        const shortcutService = {
            registerShortcut: vi.fn(() => createDisposable()),
        };
        const selectionRenderService = {
            focus: vi.fn(),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => selectionRenderService),
            })),
        };
        const injector = {
            get: vi.fn(() => renderManagerService),
        };

        const controller = new DocUIController(
            injector as never,
            componentManager as never,
            commandService as never,
            layoutService as never,
            menuManagerService as never,
            uiPartsService as never,
            {} as never,
            shortcutService as never,
            {} as never
        );

        expect(controller).toBeInstanceOf(DocUIController);
        expect(componentManager.register).toHaveBeenCalledTimes(7);
        expect(commandService.registerCommand).toHaveBeenCalledTimes(3);
        expect(menuManagerService.mergeMenu).toHaveBeenCalledTimes(1);
        expect(uiPartsService.registerComponent).toHaveBeenCalledTimes(2);
        expect(uiPartsService.registerComponent).toHaveBeenNthCalledWith(1, BuiltInUIPart.FOOTER, expect.any(Function));
        expect(uiPartsService.registerComponent).toHaveBeenNthCalledWith(2, BuiltInUIPart.CONTENT, expect.any(Function));
        expect(shortcutService.registerShortcut).toHaveBeenCalledTimes(13);
        expect(layoutService.registerFocusHandler).toHaveBeenCalledTimes(1);

        expect(registeredFocusHandlers).toHaveLength(1);
        registeredFocusHandlers.at(0)?.('doc-1');

        expect(renderManagerService.getRenderById).toHaveBeenCalledWith('doc-1');
        expect(selectionRenderService.focus).toHaveBeenCalledTimes(1);
    });
});
