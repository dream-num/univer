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

import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react';
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@wendellhu/redi/react-bindings';
import { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import enUS from '../../../../../locale/en-US';
import { RibbonPosition } from '../../../../../services/menu/types';
import { DefaultMenu } from '../DefaultMenu';

const groups = [
    { key: RibbonPosition.START, title: 'ui.ribbon.start', order: 0 },
    { key: RibbonPosition.INSERT, title: 'ui.ribbon.insert', order: 1 },
];

function RibbonGroupChooser() {
    const [current, setCurrent] = useState<string>(groups[1].key);
    return <DefaultMenu ribbon={groups} activatedTab={current} onSelectTab={(group) => setCurrent(group.key)} />;
}

afterEach(cleanup);

it('focuses the current group and returns to the trigger after selection or Escape', async () => {
    const injector = new Injector([[LocaleService]]);
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: enUS });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    const { getByRole } = render(
        <RediContext.Provider value={{ injector }}>
            <RibbonGroupChooser />
        </RediContext.Provider>
    );

    const trigger = getByRole('button', { name: 'Insert' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = getByRole('dialog', { name: 'Insert' });
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: /^Insert/ })));
    fireEvent.click(within(dialog).getByRole('button', { name: /^Start/ }));
    await waitFor(() => expect(document.activeElement).toBe(getByRole('button', { name: 'Start' })));

    fireEvent.click(trigger);
    const selected = within(getByRole('dialog', { name: 'Start' })).getByRole('button', { name: /^Start/ });
    await waitFor(() => expect(document.activeElement).toBe(selected));
    fireEvent.keyDown(selected, { key: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
});
