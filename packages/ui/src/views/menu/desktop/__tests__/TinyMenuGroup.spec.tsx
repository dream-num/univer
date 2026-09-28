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
import type { IValueOption } from '../../../../services/menu/menu';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { fireEvent, render, screen } from '@testing-library/react';
import { ILogService, Injector, LocaleService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { IconManager } from '../../../../common/icon-manager';
import { MenuItemType } from '../../../../services/menu/menu';
import { connectInjector } from '../../../../utils/di';
import { getVisibleTinyMenuChildren, resolveMenuItemActiveState, UITinyMenuGroup } from '../TinyMenuGroup';

class TestLocaleService {
    readonly direction$ = new BehaviorSubject<'ltr'>('ltr');

    t(key: string): string {
        return `translated:${key}`;
    }
}

class TestLogService {
    warn(): void {}
}

class TestState {
    static selectedOptions: IValueOption[] = [];

    static reset(): void {
        this.selectedOptions = [];
    }
}

function createTinyMenuTestInjector() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([IconManager]);

    const iconManager = injector.get(IconManager);
    iconManager.register({
        TextTypeIcon: ({ className }: { className?: string }) => <span className={className} data-icon="text-type" />,
        H1Icon: ({ className }: { className?: string }) => <span className={className} data-icon="h1" />,
        ResetIcon: ({ className }: { className?: string }) => <span className={className} data-icon="reset" />,
    });

    return injector;
}

function renderWithDependencies(element: ReactElement) {
    const ConnectedTestRoot = connectInjector(() => element, createTinyMenuTestInjector()) as ComponentType;
    return render(<ConnectedTestRoot />);
}

function createChild(
    key: string,
    options: {
        icon?: string;
        tooltip?: string;
        params?: Record<string, unknown>;
        hidden$?: BehaviorSubject<boolean>;
        activated$?: BehaviorSubject<boolean>;
    } = {}
): IMenuSchema {
    return {
        key,
        order: 0,
        item: {
            id: key,
            type: MenuItemType.BUTTON,
            icon: options.icon ?? 'H1Icon',
            tooltip: options.tooltip,
            params: options.params,
            hidden$: options.hidden$,
            activated$: options.activated$,
        },
    };
}

function createGroup(children: IMenuSchema[]): IMenuSchema {
    return {
        key: 'quick',
        order: 0,
        children,
    };
}

function hasClassToken(element: HTMLElement, token: string): boolean {
    return element.className.split(/\s+/).includes(token);
}

describe('TinyMenuGroup', () => {
    it('uses explicit active items as an override instead of merging with observable active state', () => {
        expect(resolveMenuItemActiveState('h1', true, ['normal-text'])).toBe(false);
        expect(resolveMenuItemActiveState('normal-text', false, ['normal-text'])).toBe(true);
        expect(resolveMenuItemActiveState('h1', true)).toBe(true);
    });

    it('filters hidden tiny menu children by item id before rendering', () => {
        const children = [
            createChild('h1'),
            createChild('title'),
            createChild('subtitle'),
        ];

        expect(getVisibleTinyMenuChildren(children, ['title', 'subtitle']).map((item) => item.key)).toEqual(['h1']);
    });

    it('renders visible tiny menu children and submits translated option payloads from clicks', () => {
        TestState.reset();
        const item = createGroup([
            createChild('doc.command.set-inline-format-text-color', {
                icon: 'TextTypeIcon',
                tooltip: 'docs-ui.toolbar.textColor.main',
                params: { value: '#FE4B4B' },
            }),
            createChild('doc.command.hidden-heading', {
                icon: 'H1Icon',
                tooltip: 'docs-ui.toolbar.hidden',
            }),
        ]);

        renderWithDependencies(
            <UITinyMenuGroup
                item={item}
                columns={6}
                hiddenItemIds={['doc.command.hidden-heading']}
                onOptionSelect={(option) => TestState.selectedOptions.push(option)}
            />
        );

        const textColorButton = screen.getByRole('button', { name: 'translated:docs-ui.toolbar.textColor.main' });
        expect(screen.queryByRole('button', { name: 'translated:docs-ui.toolbar.hidden' })).toBeNull();
        expect((textColorButton.parentElement as HTMLElement).style.gridTemplateColumns).toBe('');

        fireEvent.click(textColorButton);

        expect(TestState.selectedOptions).toEqual([{
            id: 'doc.command.set-inline-format-text-color',
            label: 'doc.command.set-inline-format-text-color',
            commandId: undefined,
            params: { value: '#FE4B4B' },
            value: undefined,
            tooltip: 'translated:docs-ui.toolbar.textColor.main',
        }]);
    });

    it('reflects explicit active item overrides in the rendered tiny menu', () => {
        const item = createGroup([
            createChild('doc.command.h1-heading', {
                icon: 'H1Icon',
                tooltip: 'docs-ui.toolbar.heading.h1',
            }),
            createChild('doc.command.reset-heading', {
                icon: 'ResetIcon',
                tooltip: 'docs-ui.toolbar.heading.reset',
            }),
        ]);

        renderWithDependencies(
            <UITinyMenuGroup item={item} activeItemIds={['doc.command.reset-heading']} />
        );

        const h1Button = screen.getByRole('button', { name: 'translated:docs-ui.toolbar.heading.h1' });
        const resetButton = screen.getByRole('button', { name: 'translated:docs-ui.toolbar.heading.reset' });
        expect(hasClassToken(h1Button, 'univer-bg-gray-50')).toBe(false);
        expect(hasClassToken(resetButton, 'univer-bg-gray-50')).toBe(true);
    });

    it('uses compact paragraph layout dimensions for dense paragraph menus', () => {
        const item = createGroup([
            createChild('black', { icon: 'H1Icon' }),
            createChild('red', { icon: 'ResetIcon' }),
        ]);

        const { container } = renderWithDependencies(
            <UITinyMenuGroup item={item} columns={8} sizeVariant="paragraph-t" layoutVariant="compact" />
        );

        const group = container.querySelector('.univer-menu-item-group') as HTMLElement;
        expect(group.style.gridTemplateColumns).toBe('repeat(8, max-content)');
        expect(hasClassToken(screen.getByRole('button', { name: 'black' }), 'univer-rounded-sm')).toBe(true);
    });
});
