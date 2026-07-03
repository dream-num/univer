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
import { BreakLineCommand } from '../../commands/commands/break-line.command';
import { CloseHeaderFooterCommand } from '../../commands/commands/doc-header-footer.command';
import { CloseHeaderFooterShortcut, SoftBreakLineShortcut } from '../core-editing.shortcut';

describe('docs core editing shortcuts', () => {
    it('registers Shift+Enter as a soft line break', () => {
        expect(SoftBreakLineShortcut).toMatchObject({
            id: BreakLineCommand.id,
            binding: KeyCode.ENTER | MetaKeys.SHIFT,
        });
    });

    it('registers Escape to close header footer editing', () => {
        expect(CloseHeaderFooterShortcut).toMatchObject({
            id: CloseHeaderFooterCommand.id,
            binding: KeyCode.ESC,
        });
    });
});
