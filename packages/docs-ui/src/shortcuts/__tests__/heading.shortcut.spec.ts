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

import { KeyCode, MetaKeys } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand } from '../../commands/commands/set-heading.command';
import { H1HeadingShortcut, H2HeadingShortcut, H3HeadingShortcut, H4HeadingShortcut, H5HeadingShortcut, NormalTextHeadingShortcut } from '../heading.shortcut';

describe('docs heading shortcuts', () => {
    it('registers normal text and heading shortcuts with Ctrl/Cmd+Alt/Option', () => {
        const modifier = MetaKeys.CTRL_COMMAND | MetaKeys.ALT;

        expect(NormalTextHeadingShortcut).toMatchObject({
            id: NormalTextHeadingCommand.id,
            binding: KeyCode.Digit0 | modifier,
            mac: KeyCode.Digit0 | modifier,
        });
        expect(H1HeadingShortcut).toMatchObject({
            id: H1HeadingCommand.id,
            binding: KeyCode.Digit1 | modifier,
            mac: KeyCode.Digit1 | modifier,
        });
        expect(H2HeadingShortcut).toMatchObject({
            id: H2HeadingCommand.id,
            binding: KeyCode.Digit2 | modifier,
        });
        expect(H3HeadingShortcut).toMatchObject({
            id: H3HeadingCommand.id,
            binding: KeyCode.Digit3 | modifier,
        });
        expect(H4HeadingShortcut).toMatchObject({
            id: H4HeadingCommand.id,
            binding: KeyCode.Digit4 | modifier,
        });
        expect(H5HeadingShortcut).toMatchObject({
            id: H5HeadingCommand.id,
            binding: KeyCode.Digit5 | modifier,
        });
    });
});
