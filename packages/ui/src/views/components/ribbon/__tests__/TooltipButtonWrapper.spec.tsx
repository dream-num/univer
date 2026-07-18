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
import { fireEvent, render } from '@testing-library/react';
import { ILogService, Injector, LocaleService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
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
    injector.get(ComponentManager).register('TestDynamicOption', ({ onChange }: { onChange: (value: string) => void }) => (
        <button type="button" onClick={() => onChange('dynamic-value')}>Choose dynamic value</button>
    ));

    const ConnectedTestRoot = connectInjector(() => element, injector) as ComponentType;
    return render(<ConnectedTestRoot />);
}

describe('DropdownMenuLabel', () => {
    it('preserves option metadata when a custom label emits a dynamic value', () => {
        const onOptionSelect = vi.fn();
        const params = (value?: string | number) => ({ value });
        const option = {
            id: 'dynamic-option',
            commandId: 'dynamic-command',
            label: {
                name: 'TestDynamicOption',
                selectable: false,
            },
            params,
        };
        const { getByRole } = renderWithDependencies(
            <DropdownMenuLabel
                option={option}
                onOptionSelect={onOptionSelect}
            />
        );

        fireEvent.click(getByRole('button', { name: 'Choose dynamic value' }));

        expect(onOptionSelect).toHaveBeenCalledWith({
            ...option,
            value: 'dynamic-value',
        });
    });
});
