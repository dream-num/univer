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

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { ActionRow } from '../ActionRow';

afterEach(cleanup);

describe('ActionRow', () => {
    it('applies touch-first button layout only in mobile presentation', () => {
        const desktop = render(<ActionRow><button type="button">Save</button></ActionRow>);
        expect(desktop.container.firstElementChild?.className).not.toContain('[&>button]:!univer-h-12');
        desktop.unmount();

        const mobile = render(
            <ConfigProvider mobile mountContainer={document.body}>
                <ActionRow><button type="button">Save</button></ActionRow>
            </ConfigProvider>
        );
        expect(mobile.container.firstElementChild?.className).toContain('[&>button]:!univer-h-12');
    });
});
