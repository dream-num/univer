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

import { CommandType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { CopyCommand, CutCommand, PasteCommand, SheetPasteShortKeyCommandName } from '../clipboard.command';

describe('clipboard commands', () => {
    it('should define copy/cut/paste command metadata', () => {
        expect(CopyCommand.id).toBe('univer.command.copy');
        expect(CutCommand.id).toBe('univer.command.cut');
        expect(PasteCommand.id).toBe('univer.command.paste');

        expect(CopyCommand.type).toBe(CommandType.COMMAND);
        expect(CutCommand.type).toBe(CommandType.COMMAND);
        expect(PasteCommand.type).toBe(CommandType.COMMAND);

        expect(CopyCommand.multi).toBe(true);
        expect(CutCommand.multi).toBe(true);
        expect(PasteCommand.multi).toBe(true);
    });

    it('should return fixed command behavior and short key name', async () => {
        expect(CopyCommand.preconditions()).toBe(false);
        expect(CutCommand.preconditions()).toBe(false);
        expect(PasteCommand.preconditions()).toBe(false);

        expect(CopyCommand.handler()).toBe(true);
        await expect(CutCommand.handler()).resolves.toBe(true);
        expect(PasteCommand.handler()).toBe(true);

        expect(SheetPasteShortKeyCommandName).toBe('sheet.command.paste-by-short-key');
    });
});
