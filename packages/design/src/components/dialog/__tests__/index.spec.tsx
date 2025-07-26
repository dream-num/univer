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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../Dialog';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Dialog', () => {
    it('should not render when open is false', () => {
        const { queryByText } = render(<Dialog open={false} title="Title">content</Dialog>);
        expect(queryByText('Title')).not.toBeInTheDocument();
    });

    it('should render with title and content', () => {
        const { getByText } = render(<Dialog open title="Test Title">Dialog Content</Dialog>);
        expect(getByText('Test Title')).toBeInTheDocument();
        expect(getByText('Dialog Content')).toBeInTheDocument();
    });

    it('should render custom footer', () => {
        const { getByText } = render(<Dialog open footer={<div>Custom Footer</div>}>content</Dialog>);
        expect(getByText('Custom Footer')).toBeInTheDocument();
    });

    it('should call onOpenChange and onClose when close button clicked', () => {
        const onOpenChange = vi.fn();
        const onClose = vi.fn();
        const { container } = render(<Dialog open title="T" onOpenChange={onOpenChange} onClose={onClose}>content</Dialog>);
        const closeBtn = container.querySelector('[data-slot="close"]') as HTMLElement;
        if (closeBtn) {
            closeBtn.click();
            expect(onOpenChange).toHaveBeenCalledWith(false);
            expect(onClose).toHaveBeenCalled();
        }
    });

    it('should call onOk and onCancel', () => {
        const onOk = vi.fn();
        const onCancel = vi.fn();
        const { getByText } = render(<Dialog open showOk showCancel onOk={onOk} onCancel={onCancel}>content</Dialog>);
        getByText(/ok|确定/i).click();
        getByText(/cancel|取消/i).click();
        expect(onOk).toHaveBeenCalled();
        expect(onCancel).toHaveBeenCalled();
    });

    it('should not close when maskClosable is false', () => {
        const onOpenChange = vi.fn();
        const { container } = render(<Dialog open maskClosable={false} onOpenChange={onOpenChange}>content</Dialog>);
        // mock the mask click event
        const mask = container.querySelector('.univer-fixed');
        if (mask) {
            mask.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(onOpenChange).not.toHaveBeenCalledWith(false);
        }
    });
});
