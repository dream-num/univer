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

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPrimitive,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../DropdownMenuPrimitive';
import '@testing-library/jest-dom/vitest';

describe('DropdownMenuPrimitive', () => {
    it('should render primitive wrappers and variants', () => {
        const { container } = render(
            <DropdownMenuPrimitive open>
                <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel inset>Label</DropdownMenuLabel>
                        <DropdownMenuItem inset variant="destructive">Item</DropdownMenuItem>
                        <DropdownMenuCheckboxItem checked hideIndicator>
                            Check
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuRadioGroup value="a">
                            <DropdownMenuRadioItem value="a" hideIndicator>
                                Radio A
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuShortcut>Cmd+K</DropdownMenuShortcut>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Sub Item</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenuPrimitive>
        );

        expect(container).toBeInTheDocument();
    });
});
