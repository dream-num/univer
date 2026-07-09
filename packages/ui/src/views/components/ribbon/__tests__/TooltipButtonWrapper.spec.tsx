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

/**
 * @vitest-environment jsdom
 */

import type { ComponentType, ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ILogService, Injector, LocaleService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { connectInjector } from '../../../../utils/di';
import { DropdownMenuLabel } from '../TooltipButtonWrapper';

class TestLocaleService {
    t(key: string) {
        return key;
    }
}

class TestLogService {
    warn(): void {}
}

function renderWithDependencies(element: ReactElement) {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ILogService, { useClass: TestLogService as never }]);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return render(<ConnectedTestRoot />);
}

describe('DropdownMenuLabel', () => {
    it('keeps menu content left-aligned and renders the selected checkmark on the right', () => {
        const { container, getByText } = renderWithDependencies(
            <DropdownMenuLabel
                value="normal"
                option={{
                    value: 'normal',
                    label: 'Normal',
                }}
            />
        );

        const root = container.firstElementChild as HTMLElement;
        const children = Array.from(root.children) as HTMLElement[];

        expect(root.className).toContain('univer-justify-between');
        expect(children[0].className).toContain('univer-min-w-0');
        expect(children[0].className).toContain('univer-gap-2');
        expect(children[1].className).toContain('univer-ml-auto');
        expect(children[1].querySelector('svg')).toBeTruthy();
        expect(getByText('Normal')).toBeTruthy();
    });

    it('reserves the right-side checkmark slot for selectable items even when not selected', () => {
        const { container } = renderWithDependencies(
            <DropdownMenuLabel
                value="normal"
                option={{
                    value: 'heading-1',
                    label: 'Heading 1',
                }}
            />
        );

        const root = container.firstElementChild as HTMLElement;
        const children = Array.from(root.children) as HTMLElement[];

        expect(root.className).toContain('univer-justify-between');
        expect(children[1].className).toContain('univer-w-4');
        expect(children[1].querySelector('svg')).toBeNull();
    });
});
