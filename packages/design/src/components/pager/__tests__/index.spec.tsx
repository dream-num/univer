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

import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Pager } from '../Pager';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Pager', () => {
    let defaultProps: ComponentProps<typeof Pager>;

    beforeEach(() => {
        defaultProps = {
            value: 1,
            total: 5,
            onChange: vi.fn(),
        };
    });

    it('renders correctly with default props', () => {
        const { getByText } = render(<Pager {...defaultProps} />);
        expect(getByText('1/5')).toBeTruthy();
    });

    it('renders correctly with custom text', () => {
        const props: ComponentProps<typeof Pager> = { ...defaultProps, text: 'Custom Text' };
        const { getByText } = render(<Pager {...props} />);
        expect(getByText('Custom Text')).toBeTruthy();
    });

    it('renders only text when total is 0', () => {
        const props: ComponentProps<typeof Pager> = { ...defaultProps, total: 0 };
        const { getByText, queryByRole } = render(<Pager {...props} />);
        expect(getByText('1/0')).toBeTruthy();
        expect(queryByRole('button')).not.toBeTruthy();
    });

    it('calls onChange with correct value when arrow is clicked', () => {
        const { rerender } = render(<Pager {...defaultProps} />);
        const rightArrow = screen.getByRole('button', { name: 'Next' });

        fireEvent.click(rightArrow);
        expect(defaultProps.onChange).toHaveBeenLastCalledWith(2);

        rerender(<Pager {...defaultProps} value={2} />);
        const leftArrow = screen.getByRole('button', { name: 'Previous' });
        fireEvent.click(leftArrow);
        expect(defaultProps.onChange).toHaveBeenLastCalledWith(1);
    });

    it('loops to last page when clicking left arrow on first page', () => {
        const props: ComponentProps<typeof Pager> = { ...defaultProps, loop: true };
        const { container } = render(<Pager {...props} />);
        const leftArrow = container.querySelector('[data-u-comp="pager-left-arrow"]') as HTMLButtonElement;

        fireEvent.click(leftArrow);
        expect(props.onChange).toBeCalledWith(5);
    });

    it('loops to first page when clicking right arrow on last page', () => {
        const props: ComponentProps<typeof Pager> = { ...defaultProps, value: 5, loop: true };
        const { container } = render(<Pager {...props} />);
        const rightArrow = container.querySelector('[data-u-comp="pager-right-arrow"]') as HTMLButtonElement;

        fireEvent.click(rightArrow);
        expect(props.onChange).toBeCalledWith(1);
    });

    it('does not loop when loop prop is false', () => {
        const props: ComponentProps<typeof Pager> = { ...defaultProps, value: 5, loop: false };
        render(<Pager {...props} />);
        const rightArrow = screen.getByRole('button', { name: 'Next' });

        expect(rightArrow).toBeDisabled();
        fireEvent.click(rightArrow);
        expect(props.onChange).not.toHaveBeenCalled();
    });
});
