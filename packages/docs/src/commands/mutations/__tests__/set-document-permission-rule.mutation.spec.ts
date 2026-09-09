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
import { afterEach, expect, it } from 'vitest';
import { DocumentPermissionRuleModel } from '../../../services/permission/document-permission-rule.model';
import { SetDocumentPermissionRuleMutation } from '../set-document-permission-rule.mutation';

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
    commands.registerCommand(SetDocumentPermissionRuleMutation);
    return { univer, model, commands, resources: injector.get(IResourceManagerService) };
}
it('round trips bindings through the business resource and deterministically replays removal and restoration', () => {
    const first = setup();
    const params = { unitId: 'unit', objectId: 'stable/object', objectType: UnitObject.DocumentParagraph, rule: { objectId: 'stable/object', objectType: UnitObject.DocumentParagraph, permissionId: 'authz-rule-1' } };
    expect(first.commands.syncExecuteCommand(SetDocumentPermissionRuleMutation.id, params)).toBe(true);
    const second = setup();
    second.resources.loadResources('unit', first.resources.getResources('unit', UniverInstanceType.UNIVER_DOC));
    expect(second.model.getRules('unit')).toEqual([params.rule]);
    expect(second.commands.syncExecuteCommand(SetDocumentPermissionRuleMutation.id, { ...params, rule: null })).toBe(true);
    expect(second.model.getRules('unit')).toEqual([]);
    expect(second.commands.syncExecuteCommand(SetDocumentPermissionRuleMutation.id, params)).toBe(true);
    const copy = second.model.getRules('unit');
    copy[0].permissionId = 'changed';
    expect(second.model.getRules('unit')).toEqual([params.rule]);
    expect(second.commands.syncExecuteCommand(SetDocumentPermissionRuleMutation.id, { ...params, unitId: 'missing' })).toBe(false);
    expect(second.commands.syncExecuteCommand(SetDocumentPermissionRuleMutation.id, { ...params, objectType: UnitObject.Worksheet })).toBe(false);
    second.resources.unloadResources('unit', UniverInstanceType.UNIVER_DOC);
    expect(second.model.getRules('unit')).toEqual([]);
});
