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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../Command';

afterEach(cleanup);

describe('Command', () => {
    it('renders grouped items and selects an enabled result', () => {
        const onSelect = vi.fn();
        render(
            <Command>
                <CommandInput aria-label="Search" />
                <CommandList>
                    <CommandEmpty>None</CommandEmpty>
                    <CommandGroup heading="Actions">
                        <CommandItem value="run" onSelect={onSelect}>Run</CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        );

        fireEvent.click(screen.getByText('Run'));
        expect(onSelect).toHaveBeenCalledWith('run');
    });
});
