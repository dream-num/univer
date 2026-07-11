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

import type { ComponentType, ReactElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { ICommandService, ILogService, Injector, LocaleService } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { IShortcutService } from '../../../../services/shortcut/shortcut.service';
import { connectInjector } from '../../../../utils/di';
import { ToolbarItem } from '../ToolbarItem';

class TestLocaleService {
    t(key: string) {
        return key;
    }
}

class TestCommandService {
    executeCommand(): void {}
}

class TestLayoutService {
    focus(): void {}
}

class TestShortcutService {
    readonly shortcutChanged$ = new Subject<void>();

    getShortcutDisplayOfCommand(): null {
        return null;
    }
}

class TestMenuManagerService {
    readonly menuChanged$ = new Subject<void>();

    getMenuByPositionKey() {
        return [];
    }
}

class TestLogService {
    warn(): void {}
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    injector.add([IMenuManagerService, { useClass: TestMenuManagerService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    injector.get(IconManager).register({
        TestIcon: ({ className }: { className?: string }) => <span className={className} data-icon="test" />,
    });

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return render(<ConnectedTestRoot />);
}

afterEach(cleanup);

describe('ToolbarItem', () => {
    it('mirrors button selector dropdown trigger placement in rtl', () => {
        const { container } = renderWithDependencies(
            <div dir="rtl">
                <ToolbarItem
                    id="test-button-selector"
                    type={MenuItemType.BUTTON_SELECTOR}
                    icon="TestIcon"
                    title="Filter"
                    selections={[{ label: 'Clear', value: 'clear' }]}
                />
            </div>
        );

        const root = container.querySelector('.univer-toolbar-button-selector-root') as HTMLElement;
        const main = container.querySelector('.univer-toolbar-button-selector-main') as HTMLElement;
        const trigger = container.querySelector('.univer-toolbar-button-selector-trigger') as HTMLElement;

        expect(root.className).toContain('rtl:univer-pl-5');
        expect(root.className).toContain('rtl:univer-pr-0');
        expect(main.className).toContain('rtl:univer-rounded-l-none');
        expect(main.className).toContain('rtl:univer-rounded-r');
        expect(trigger.className).toContain('rtl:univer-left-0');
        expect(trigger.className).toContain('rtl:univer-right-auto');
        expect(trigger.className).toContain('rtl:univer-rounded-l');
        expect(trigger.className).toContain('rtl:univer-rounded-r-none');
    });
});
