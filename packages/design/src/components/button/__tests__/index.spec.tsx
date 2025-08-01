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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Button', () => {
    it('renders correctly', () => {
        const { container } = render(<Button variant="primary">btn1</Button>);
        expect(container);
    });

    it('click onClick function', () => {
        let a = 1;

        const { container } = render(
            <Button
                onClick={() => {
                    a++;
                }}
            >
                btn2
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(a).toEqual(2);
    });

    it('should prevent event when button is disabled', () => {
        let a = 1;

        const { container } = render(
            <Button
                disabled
                onClick={() => {
                    a++;
                }}
            >
                btn3
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(a).toEqual(1);
    });
});

describe('ButtonGroup', () => {
    it('renders correctly', () => {
        const { container } = render(
            <ButtonGroup>
                <Button variant="primary">btn1</Button>
                <Button variant="link">btn2</Button>
            </ButtonGroup>
        );
        expect(container);
    });

    it('renders horizontal button group', () => {
        const { container } = render(
            <ButtonGroup orientation="horizontal">
                <Button variant="primary">btn1</Button>
                <Button variant="link">btn2</Button>
            </ButtonGroup>
        );
        expect(container.querySelector('.univer-grid-flow-row')).toBeNull();
    });
});
