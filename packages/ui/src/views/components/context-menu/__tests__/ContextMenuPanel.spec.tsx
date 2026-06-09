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

import { render, screen } from '@testing-library/react';
import { LocaleService } from '@univerjs/core';
import React from 'react';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { ContextMenuPanel, getContextMenuQuickGroupColumns, shouldShowContextMenuGroupSeparator } from '../ContextMenuPanel';

const dependencyMap = new Map();
const tinyMenuGroupSpy = vi.fn();

vi.mock('../../../../utils/di', async () => {
    const ReactModule = await import('react');

    return {
        useDependency(token: unknown) {
            return dependencyMap.get(token);
        },
        useObservable<T>(observable: any, defaultValue?: T) {
            const [value, setValue] = ReactModule.useState(defaultValue);

            ReactModule.useEffect(() => {
                if (!observable) {
                    return;
                }

                const source = typeof observable === 'function' ? observable() : observable;
                const sub = source.subscribe?.((nextValue: T) => setValue(nextValue));

                return () => sub?.unsubscribe?.();
            }, [observable]);

            return value;
        },
    };
});

vi.mock('../../../../components/menu/desktop/TinyMenuGroup', () => ({
    resolveMenuItemActiveState: () => false,
    UITinyMenuGroup: (props: unknown) => {
        tinyMenuGroupSpy(props);
        return <div data-testid="tiny-menu-group" />;
    },
    UIQuickTileMenuGroup: () => <div data-testid="quick-tile-menu-group" />,
}));

vi.mock('../../../../components/custom-label/CustomLabel', () => ({
    CustomLabel: () => <span data-testid="custom-label" />,
}));

describe('ContextMenuPanel', () => {
    it('applies the enlarged paragraph T size variant without affecting the shared defaults', () => {
        dependencyMap.clear();
        tinyMenuGroupSpy.mockClear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [{
                key: 'quickTop',
                order: 0,
                title: 'docs-ui.paragraphMenu.align',
                quickLayout: 'icon',
                children: [{
                    key: 'quickItem',
                    order: 0,
                    item: {
                        id: 'quick-item',
                        type: MenuItemType.BUTTON,
                    },
                }],
            }]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        const { container } = render(React.createElement(ContextMenuPanel as never, {
            menuType: 'quick-layout-menu',
            sizeVariant: 'paragraph-t',
        }));

        const className = (container.firstChild as HTMLDivElement | null)?.className ?? '';
        expect(className).toContain('univer-min-w-64');
        expect(className).toContain('univer-text-base');
        expect(className).toContain('univer-px-3');
        expect(className).toContain('univer-py-2');
        expect(tinyMenuGroupSpy.mock.calls[0][0]).toEqual(expect.objectContaining({
            columns: 6,
            sizeVariant: 'paragraph-t',
        }));
    });

    it('does not render a separator between consecutive header quick rows', () => {
        expect(shouldShowContextMenuGroupSeparator([
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'layout', order: 2 },
        ] as never, 0)).toBe(false);

        expect(shouldShowContextMenuGroupSeparator([
            { key: 'quickTop', order: 0, quickLayout: 'icon' },
            { key: 'quickBottom', order: 1, quickLayout: 'icon' },
            { key: 'layout', order: 2 },
        ] as never, 1)).toBe(true);
    });

    it('uses a fixed six-column layout for header quick icon groups only', () => {
        expect(getContextMenuQuickGroupColumns({
            key: 'quickTop',
            order: 0,
            quickLayout: 'icon',
        } as never)).toBe(6);

        expect(getContextMenuQuickGroupColumns({
            key: 'quickBottom',
            order: 1,
            quickLayout: 'icon',
        } as never)).toBe(6);

        expect(getContextMenuQuickGroupColumns({
            key: 'align',
            order: 0,
            quickLayout: 'icon',
        } as never)).toBeUndefined();
    });

    it('renders quick layout group titles before icon rows', () => {
        dependencyMap.clear();

        dependencyMap.set(IMenuManagerService, {
            menuChanged$: new BehaviorSubject<void>(undefined),
            getMenuByPositionKey: vi.fn(() => [{
                key: 'quickGroup',
                order: 0,
                title: 'docs-ui.paragraphMenu.align',
                quickLayout: 'icon',
                children: [{
                    key: 'quickItem',
                    order: 0,
                    item: {
                        id: 'quick-item',
                        type: MenuItemType.BUTTON,
                    },
                }],
            }]),
        });
        dependencyMap.set(ILayoutService, {
            rootContainerElement: document.body,
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => key,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });

        render(<ContextMenuPanel menuType="quick-layout-menu" />);

        expect(screen.getAllByText('docs-ui.paragraphMenu.align').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('tiny-menu-group').length).toBeGreaterThan(0);
    });
});
