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

import { render } from '@testing-library/react';
import { LocaleService } from '@univerjs/core';
import React from 'react';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager } from '../../../../common';
import { MenuItemType } from '../../../../services/menu/menu';
import { getVisibleTinyMenuChildren, resolveMenuItemActiveState, UITinyMenuGroup } from '../TinyMenuGroup';

const dependencyMap = new Map();
const designTinyMenuGroupSpy = vi.fn();

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

vi.mock('../DesignTinyMenuGroup', () => ({
    DesignTinyMenuGroup: (props: unknown) => {
        designTinyMenuGroupSpy(props);
        return React.createElement('div', { 'data-testid': 'design-tiny-menu-group' });
    },
}));

describe('TinyMenuGroup', () => {
    beforeEach(() => {
        dependencyMap.clear();
        designTinyMenuGroupSpy.mockClear();
        dependencyMap.set(ComponentManager, {
            get: () => () => React.createElement('span'),
        });
        dependencyMap.set(LocaleService, {
            t: (key: string) => `translated:${key}`,
            direction$: new BehaviorSubject<'ltr'>('ltr'),
        });
    });

    it('uses explicit active items as an override instead of merging with observable active state', () => {
        expect(resolveMenuItemActiveState('h1', true, ['normal-text'])).toBe(false);
        expect(resolveMenuItemActiveState('normal-text', false, ['normal-text'])).toBe(true);
        expect(resolveMenuItemActiveState('h1', true)).toBe(true);
    });

    it('filters hidden tiny menu children before rendering', () => {
        const children = [
            { key: 'h1', order: 0, item: { id: 'h1' } },
            { key: 'title', order: 1, item: { id: 'title' } },
            { key: 'subtitle', order: 2, item: { id: 'subtitle' } },
        ] as never;

        expect(getVisibleTinyMenuChildren(children, ['title', 'subtitle']).map((item) => item.key)).toEqual(['h1']);
    });

    it('passes translated tooltips and command params through tiny icon menu items', () => {
        const onOptionSelect = vi.fn();
        const item = {
            key: 'quick',
            order: 0,
            children: [{
                key: 'text-color',
                order: 0,
                item: {
                    id: 'doc.command.set-inline-format-text-color',
                    type: MenuItemType.BUTTON,
                    icon: 'TextTypeIcon',
                    tooltip: 'docs-ui.toolbar.textColor.main',
                    params: { value: '#FE4B4B' },
                    hidden$: of(false),
                    activated$: of(false),
                },
            }],
        } as never;

        render(React.createElement(UITinyMenuGroup, { item, onOptionSelect }));

        const props = designTinyMenuGroupSpy.mock.calls[0][0] as {
            items: Array<{ onClick: () => void; tooltip?: string }>;
        };

        expect(props.items[0].tooltip).toBe('translated:docs-ui.toolbar.textColor.main');

        props.items[0].onClick();

        expect(onOptionSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'doc.command.set-inline-format-text-color',
            label: 'doc.command.set-inline-format-text-color',
            params: { value: '#FE4B4B' },
            tooltip: 'translated:docs-ui.toolbar.textColor.main',
        }));
    });

    it('passes fixed column layout through to the tiny menu renderer', () => {
        const item = {
            key: 'quick',
            order: 0,
            children: [{
                key: 'h1',
                order: 0,
                item: {
                    id: 'doc.command.h1-heading',
                    type: MenuItemType.BUTTON,
                    icon: 'H1Icon',
                    hidden$: of(false),
                    activated$: of(false),
                },
            }],
        } as never;

        render(React.createElement(UITinyMenuGroup, { item, columns: 6 }));

        const props = designTinyMenuGroupSpy.mock.calls[0][0] as {
            columns?: number;
        };

        expect(props.columns).toBe(6);
    });
});
