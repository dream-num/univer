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

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { HoverCard } from '../HoverCard';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
    vi.useRealTimers();
    cleanup();
});

describe('HoverCard', () => {
    it('should render trigger and not show overlay by default', () => {
        const { getByText, queryByText } = render(
            <HoverCard overlay={<div>Overlay Content</div>}>
                <button type="button">Trigger</button>
            </HoverCard>
        );
        expect(getByText('Trigger')).toBeInTheDocument();
        expect(queryByText('Overlay Content')).not.toBeInTheDocument();
    });

    it('should show overlay when open is true', () => {
        const mountContainer = document.createElement('div');
        render(
            <ConfigProvider mountContainer={mountContainer}>
                <HoverCard overlay={<div>Overlay Content</div>} open>
                    <button type="button">Trigger</button>
                </HoverCard>
            </ConfigProvider>
        );

        expect(mountContainer).toHaveTextContent('Overlay Content');
    });

    it('should open after the configured delay', () => {
        vi.useFakeTimers();
        const onOpenChange = vi.fn();
        const { getByRole, queryByText } = render(
            <HoverCard overlay={<div>Overlay Content</div>} openDelay={500} onOpenChange={onOpenChange}>
                <button type="button">Trigger</button>
            </HoverCard>
        );

        fireEvent.pointerEnter(getByRole('button'), { pointerType: 'mouse' });
        act(() => vi.advanceTimersByTime(499));
        expect(queryByText('Overlay Content')).not.toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();

        act(() => vi.advanceTimersByTime(1));
        expect(queryByText('Overlay Content')).toBeInTheDocument();
        expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('should not open when disabled', () => {
        vi.useFakeTimers();
        const onOpenChange = vi.fn();
        const { getByRole, queryByText } = render(
            <HoverCard overlay={<div>Overlay Content</div>} disabled onOpenChange={onOpenChange}>
                <button type="button">Trigger</button>
            </HoverCard>
        );

        fireEvent.pointerEnter(getByRole('button'), { pointerType: 'mouse' });
        act(() => vi.runAllTimers());

        expect(queryByText('Overlay Content')).not.toBeInTheDocument();
        expect(onOpenChange).not.toHaveBeenCalled();
    });
});
