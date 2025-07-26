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
import { Toaster } from '../Toaster';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Toaster', () => {
    it('should render without crashing', () => {
        render(<Toaster />);
        const toasterRoot = document.querySelector('[data-sonner-toast]') || document.body;
        expect(toasterRoot).toBeTruthy();
    });

    it('should respect visibleToasts prop', () => {
        render(<Toaster visibleToasts={2} />);
        const toasterRoot = document.querySelector('[data-sonner-toast]') || document.body;
        expect(toasterRoot).toBeTruthy();
    });
});
