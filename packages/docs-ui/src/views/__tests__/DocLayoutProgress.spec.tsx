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

import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocLayoutProgress } from '../DocLayoutProgress';

const mocks = vi.hoisted(() => ({
    progress: null as { progress: number; unitId: string } | null,
}));

vi.mock('@univerjs/ui', () => ({
    useDependency: (token: { name?: string }) => token.name === 'LocaleService'
        ? { t: () => 'Laying out document…' }
        : { currentProgress$: {} },
    useObservable: () => mocks.progress,
}));

describe('DocLayoutProgress', () => {
    beforeEach(() => {
        mocks.progress = null;
    });

    it('stays hidden without active layout progress', () => {
        expect(renderToStaticMarkup(<DocLayoutProgress />)).toBe('');
    });

    it('renders localized, centered footer progress with accessible values', () => {
        mocks.progress = { progress: 19, unitId: 'doc-1' };

        const markup = renderToStaticMarkup(<DocLayoutProgress />);

        expect(markup).toContain('Laying out document…');
        expect(markup).not.toContain('aria-live');
        expect(markup).toContain('role="progressbar"');
        expect(markup).toContain('aria-valuenow="19"');
        expect(markup).toContain('width:19%');
        expect(markup).toContain('univer-absolute univer-left-1/2 univer-top-1/2');
        expect(markup).toContain('>19%</span>');
    });
});
