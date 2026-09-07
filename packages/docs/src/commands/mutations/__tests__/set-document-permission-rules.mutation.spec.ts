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

import { ICommandService, IResourceManagerService, Univer, UniverInstanceType } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { afterEach, expect, it, vi } from 'vitest';
import { DocumentPermissionRuleModel } from '../../../services/permission/document-permission-rule.model';
import { SetDocumentPermissionRulesMutation } from '../set-document-permission-rules.mutation';

const univers: Univer[] = [];
afterEach(() => univers.splice(0).forEach((univer) => univer.dispose()));
function setup() {
    const univer = new Univer();
    univers.push(univer);
    const injector = univer.__getInjector();
    injector.add([DocumentPermissionRuleModel]);
    const model = injector.get(DocumentPermissionRuleModel);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'unit', body: { dataStream: '\r\n' } });
    const commands = injector.get(ICommandService);
    commands.registerCommand(SetDocumentPermissionRulesMutation);
    return { univer, model, commands, resources: injector.get(IResourceManagerService) };
}
const objectType = UnitObject.DocumentParagraph;
function binding(objectId: string, permissionId: string) {
    return { objectId, objectType, rule: { objectId, objectType, permissionId } };
}

it('replays a mixed batch through the product resource and publishes one change', () => {
    const first = setup();
    const initial = { unitId: 'unit', rules: [binding('a', 'permission-a'), binding('b', 'permission-b')] };
    first.commands.syncExecuteCommand(SetDocumentPermissionRulesMutation.id, initial);
    const changed = vi.fn();
    const subscription = first.model.changed$.subscribe(changed);
    const batch = { unitId: 'unit', rules: [binding('a', 'replacement'), { objectId: 'b', objectType, rule: null }, binding('c', 'permission-c')] };
    expect(first.commands.syncExecuteCommand(SetDocumentPermissionRulesMutation.id, batch)).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
    subscription.unsubscribe();
    const second = setup();
    second.resources.loadResources('unit', first.resources.getResources('unit', UniverInstanceType.UNIVER_DOC));
    expect(second.model.getRules('unit')).toEqual([binding('a', 'replacement').rule, binding('c', 'permission-c').rule]);
    expect(second.commands.syncExecuteCommand(SetDocumentPermissionRulesMutation.id, batch)).toBe(true);
    expect(second.model.getRules('unit')).toEqual(first.model.getRules('unit'));
});

it('rejects an invalid or duplicate entry without applying the valid prefix', () => {
    const { model, commands } = setup();
    const original = binding('a', 'original');
    commands.syncExecuteCommand(SetDocumentPermissionRulesMutation.id, { unitId: 'unit', rules: [original] });
    const changed = vi.fn();
    const subscription = model.changed$.subscribe(changed);
    for (const rules of [
        [binding('a', 'replacement'), binding('b', '')],
        [binding('a', 'replacement'), binding('a', 'duplicate')],
        [],
    ]) {
        expect(commands.syncExecuteCommand(SetDocumentPermissionRulesMutation.id, { unitId: 'unit', rules })).toBe(false);
        expect(model.getRules('unit')).toEqual([original.rule]);
    }
    expect(changed).not.toHaveBeenCalled();
    subscription.unsubscribe();
});
