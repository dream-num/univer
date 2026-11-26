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
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';
import '@testing-library/jest-dom/vitest';

afterEach(cleanup);

describe('Button', () => {
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
    it('lays out horizontal groups in columns and joins adjacent button edges with focus elevation', () => {
        const { getByRole, getAllByRole } = render(
            <ButtonGroup>
                <Button>First</Button>
                {false && <Button>Hidden</Button>}
                <Button>Last</Button>
            </ButtonGroup>
        );

        const group = getByRole('group');
        expect(group).toHaveClass('univer-grid-flow-col');

        const buttons = getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(buttons[0]).toHaveClass('!univer-rounded-r-none', 'focus-visible:univer-z-10');
        expect(buttons[1]).toHaveClass('!univer-rounded-l-none', '!univer-border-l-0', 'focus-visible:univer-z-10');
    });

    it('supports vertical orientation and RTL horizontal border joining', () => {
        const { getByRole, getAllByRole, rerender } = render(
            <ButtonGroup orientation="vertical">
                <Button>Top</Button>
                <Button>Bottom</Button>
            </ButtonGroup>
        );

        expect(getByRole('group')).toHaveClass('univer-grid-flow-row');
        const verticalButtons = getAllByRole('button');
        expect(verticalButtons[0]).toHaveClass('!univer-rounded-b-none');
        expect(verticalButtons[1]).toHaveClass('!univer-rounded-t-none', '!univer-border-t-0');

        rerender(
            <ConfigProvider mountContainer={document.body} direction="rtl">
                <ButtonGroup>
                    <Button>Start</Button>
                    <Button>End</Button>
                </ButtonGroup>
            </ConfigProvider>
        );

        const rtlButtons = getAllByRole('button');
        expect(rtlButtons[0]).toHaveClass('!univer-rounded-l-none');
        expect(rtlButtons[1]).toHaveClass('!univer-rounded-r-none', '!univer-border-r-0');
    });
});
