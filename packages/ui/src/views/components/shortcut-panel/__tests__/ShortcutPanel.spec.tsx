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

import type { IDisposable } from '@univerjs/core';
import type { ReactElement } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { ICommandService, IContextService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { IPlatformService } from '../../../../services/platform/platform.service';
import { KeyCode, MetaKeys } from '../../../../services/shortcut/keycode';
import { IShortcutService, ShortcutService } from '../../../../services/shortcut/shortcut.service';
import { RediProvider } from '../../../../utils/di';
import { ShortcutPanel } from '../ShortcutPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestCommandService {
    executeCommand(): boolean {
        return true;
    }
}

class TestContextService {}

class TestPlatformService {
    readonly isMac = false;
    readonly isWindows = true;
    readonly isLinux = false;
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IContextService, { useClass: TestContextService as never }]);
    injector.add([IPlatformService, { useClass: TestPlatformService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([LocaleService]);

    injector.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            ui: {
                shortcutGroup: {
                    edit: 'Edit actions',
                    view: 'View actions',
                },
                shortcutItem: {
                    copy: 'Copy cells',
                    paste: 'Paste cells',
                    zoom: 'Zoom panel',
                },
            },
        },
    });

    const result = render(
        <RediProvider value={{ injector }}>
            {element}
        </RediProvider>
    );

    return {
        ...result,
        injector,
        dispose: () => {
            result.unmount();
            (injector.get(IShortcutService) as IShortcutService & { dispose(): void }).dispose();
        },
    };
}

describe('ShortcutPanel', () => {
    afterEach(() => {
        cleanup();
    });

    it('refreshes grouped shortcuts when the shortcut service registers and releases items', () => {
        const rendered = renderWithDependencies(<ShortcutPanel />);
        const shortcutService = rendered.injector.get(IShortcutService);
        const disposables: IDisposable[] = [];

        act(() => {
            disposables.push(shortcutService.registerShortcut({
                id: 'test.command.zoom',
                description: 'ui.shortcutItem.zoom',
                binding: KeyCode.BACK_SLASH | MetaKeys.CTRL_COMMAND,
                group: '20_view',
                groupTitle: 'ui.shortcutGroup.view',
            }));
            disposables.push(shortcutService.registerShortcut({
                id: 'test.command.copy',
                description: 'ui.shortcutItem.copy',
                binding: KeyCode.C | MetaKeys.CTRL_COMMAND,
                group: '10_edit',
                groupTitle: 'ui.shortcutGroup.edit',
            }));
            disposables.push(shortcutService.registerShortcut({
                id: 'test.command.paste',
                description: 'ui.shortcutItem.paste',
                binding: KeyCode.V | MetaKeys.CTRL_COMMAND,
                group: '10_edit',
                groupTitle: 'ui.shortcutGroup.edit',
            }));
        });

        expect(screen.getByText('Edit actions').compareDocumentPosition(screen.getByText('View actions'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(screen.getByText('Copy cells')).not.toBeNull();
        expect(screen.getAllByText('Ctrl')).toHaveLength(3);
        expect(screen.getByText('C')).not.toBeNull();
        expect(screen.getByText('Paste cells')).not.toBeNull();
        expect(screen.getByText('Zoom panel')).not.toBeNull();

        act(() => {
            disposables[1].dispose();
        });

        expect(screen.queryByText('Copy cells')).toBeNull();
        expect(screen.getByText('Paste cells')).not.toBeNull();
        expect(shortcutService.getAllShortcuts().map((item) => item.id)).toEqual([
            'test.command.zoom',
            'test.command.paste',
        ]);

        disposables[0].dispose();
        disposables[2].dispose();
        rendered.dispose();
    });
});
