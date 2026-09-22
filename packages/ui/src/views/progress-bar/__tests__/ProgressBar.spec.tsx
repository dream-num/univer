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

// @vitest-environment happy-dom

import { cleanup, fireEvent, render } from '@testing-library/react';
import { Profiler } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ProgressBar } from '../ProgressBar';

afterEach(cleanup);

describe('ProgressBar', () => {
    it('does not schedule a nested React update when calculation progress arrives', () => {
        const phases: string[] = [];
        const view = (done: number, count: number) => (
            <Profiler id="progress" onRender={(_id, phase) => phases.push(phase)}>
                <ProgressBar progress={{ done, count }} />
            </Profiler>
        );
        const result = render(view(0, 0));
        phases.length = 0;
        for (let done = 0; done < 100; done++) {
            result.rerender(view(done, 100));
        }
        expect(phases).toHaveLength(100);
        expect(phases).not.toContain('nested-update');
        expect(result.container.firstElementChild?.classList.contains('univer-hidden')).toBe(false);
        result.rerender(view(0, 0));
        expect(result.container.firstElementChild?.classList.contains('univer-hidden')).toBe(true);
    });

    it('hides completed progress and shows a subsequent calculation', () => {
        let cleared = 0;
        const result = render(<ProgressBar progress={{ done: 1, count: 1 }} onClearProgress={() => cleared++} />);
        fireEvent.transitionEnd(result.container.querySelector('.univer-transition-\\[width\\]')!);
        expect(cleared).toBe(1);
        expect(result.container.firstElementChild?.classList.contains('univer-hidden')).toBe(true);
        result.rerender(<ProgressBar progress={{ done: 0, count: 3 }} />);
        expect(result.container.firstElementChild?.classList.contains('univer-hidden')).toBe(false);
    });
});
