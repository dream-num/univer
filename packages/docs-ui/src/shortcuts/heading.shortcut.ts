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

import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand } from '../commands/commands/set-heading.command';
import { whenDocAndEditorFocused } from './utils';

function headingShortcut(id: string, key: KeyCode): IShortcutItem {
    const binding = key | MetaKeys.CTRL_COMMAND | MetaKeys.ALT;

    return {
        id,
        binding,
        mac: binding,
        win: binding,
        linux: binding,
        preconditions: whenDocAndEditorFocused,
    };
}

export const NormalTextHeadingShortcut = headingShortcut(NormalTextHeadingCommand.id, KeyCode.Digit0);
export const H1HeadingShortcut = headingShortcut(H1HeadingCommand.id, KeyCode.Digit1);
export const H2HeadingShortcut = headingShortcut(H2HeadingCommand.id, KeyCode.Digit2);
export const H3HeadingShortcut = headingShortcut(H3HeadingCommand.id, KeyCode.Digit3);
export const H4HeadingShortcut = headingShortcut(H4HeadingCommand.id, KeyCode.Digit4);
export const H5HeadingShortcut = headingShortcut(H5HeadingCommand.id, KeyCode.Digit5);
