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

import { QuickListTypeMap } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { AfterSpaceCommand, EnterCommand, TabCommand } from '../../commands/commands/auto-format.command';
import { BreakLineCommand } from '../../commands/commands/break-line.command';
import { ChangeListNestingLevelCommand, ChangeListNestingLevelType, ListOperationCommand, QuickListCommand } from '../../commands/commands/list.command';
import { QUICK_HEADING_MAP, QuickHeadingCommand } from '../../commands/commands/set-heading.command';
import { DocTableTabCommand } from '../../commands/commands/table/doc-table-tab.command';
import { DocAutoFormatController } from '../doc-auto-format.controller';

interface IAutoFormatRule {
    id: string;
    priority?: number;
    match: (context: unknown) => boolean;
    getMutations: (context: unknown) => Array<Record<string, unknown>>;
}

describe('doc auto format controller', () => {
    it('registers five auto-format rules and maps list, table, heading, and enter behaviors', () => {
        const rules: IAutoFormatRule[] = [];
        const service = {
            registerAutoFormat: vi.fn((rule) => {
                rules.push(rule);
                return { dispose: vi.fn() };
            }),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({
                    getSkeleton: () => ({ id: 'skeleton' }),
                })),
            })),
        };

        const controller = new DocAutoFormatController(service as never, renderManagerService as never);

        expect(controller).toBeInstanceOf(DocAutoFormatController);
        expect(service.registerAutoFormat).toHaveBeenCalledTimes(5);

        const listTabRule = rules.find((rule) => rule.id === TabCommand.id && rule.priority === 100)!;
        const tableTabRule = rules.find((rule) => rule.id === TabCommand.id && rule.priority === 99)!;
        const spaceRule = rules.find((rule) => rule.id === AfterSpaceCommand.id)!;
        const exitListRule = rules.find((rule) => rule.id === EnterCommand.id && rule.priority == null)!;
        const defaultEnterRule = rules.find((rule) => rule.id === EnterCommand.id && rule.priority === -9999)!;

        expect(listTabRule.match({
            selection: { startOffset: 4 },
            paragraphs: [{
                paragraphStart: 4,
                startIndex: 4,
                bullet: { listId: 'list-1' },
            }],
            unit: {
                getBody: () => ({
                    paragraphs: [
                        { startIndex: 1, bullet: { listId: 'list-1' } },
                        { startIndex: 4, bullet: { listId: 'list-1' } },
                    ],
                }),
            },
        })).toBe(true);
        expect(listTabRule.getMutations({ commandParams: { shift: true } })).toEqual([{
            id: ChangeListNestingLevelCommand.id,
            params: {
                type: ChangeListNestingLevelType.decrease,
            },
        }]);

        expect(tableTabRule.match({
            selection: {
                startNodePosition: { path: ['pages', 0, 'cells', 0] },
            },
            unit: {
                getUnitId: () => 'test-doc',
            },
        })).toBe(true);
        expect(tableTabRule.getMutations({ commandParams: { shift: true } })).toEqual([{
            id: DocTableTabCommand.id,
            params: { shift: true },
        }]);

        const quickListText = Object.keys(QuickListTypeMap)[0];
        expect(spaceRule.match({
            selection: { collapsed: true, startOffset: quickListText.length + 1 },
            paragraphs: [{ paragraphStart: 0 }],
            unit: {
                getBody: () => ({ dataStream: `${quickListText} \r\n` }),
            },
        })).toBe(true);
        expect(spaceRule.getMutations({
            selection: { startOffset: quickListText.length + 1 },
            paragraphs: [{ paragraphStart: 0, startIndex: 0 }],
            unit: {
                getBody: () => ({ dataStream: `${quickListText} \r\n` }),
            },
        })).toEqual([{
            id: QuickListCommand.id,
            params: {
                listType: QuickListTypeMap[quickListText as keyof typeof QuickListTypeMap],
                paragraph: { paragraphStart: 0, startIndex: 0 },
            },
        }]);

        const quickHeadingText = Object.keys(QUICK_HEADING_MAP)[0];
        expect(spaceRule.getMutations({
            selection: { startOffset: quickHeadingText.length + 1 },
            paragraphs: [{ paragraphStart: 0 }],
            unit: {
                getBody: () => ({ dataStream: `${quickHeadingText} \r\n` }),
            },
        })).toEqual([{
            id: QuickHeadingCommand.id,
            params: {
                value: QUICK_HEADING_MAP[quickHeadingText as keyof typeof QUICK_HEADING_MAP],
            },
        }]);

        expect(exitListRule.match({
            paragraphs: [{
                bullet: { listType: 'bullet', nestingLevel: 0 },
                paragraphStart: 0,
                paragraphEnd: 0,
            }],
        })).toBe(true);
        expect(exitListRule.getMutations({
            paragraphs: [{
                bullet: { listType: 'bullet', nestingLevel: 1 },
            }],
        })).toEqual([{
            id: ChangeListNestingLevelCommand.id,
            params: {
                type: ChangeListNestingLevelType.decrease,
            },
        }]);
        expect(exitListRule.getMutations({
            paragraphs: [{
                bullet: { listType: 'bullet', nestingLevel: 0 },
            }],
        })).toEqual([{
            id: ListOperationCommand.id,
            params: {
                listType: 'bullet',
            },
        }]);

        expect(defaultEnterRule.match({})).toBe(true);
        expect(defaultEnterRule.getMutations({})).toEqual([{
            id: BreakLineCommand.id,
        }]);
    });
});
