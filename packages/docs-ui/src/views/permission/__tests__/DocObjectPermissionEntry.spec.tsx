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

import type { IDialogPartMethodOptions, IObjectPermissionButtonProps } from '@univerjs/ui';
import type { ReactNode } from 'react';
import { IAuthzIoService, IUniverInstanceService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { SetDocumentPermissionCommand } from '@univerjs/docs';
import { UnitObject } from '@univerjs/protocol';
import { DesktopDialogService, IDialogService, IUIPartsService, RediProvider, UIPartsService } from '@univerjs/ui';
import uiEnUS from '@univerjs/ui/locale/en-US';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import enUS from '../../../locale/en-US';
import { DocObjectPermissionEntry } from '../DocObjectPermissionEntry';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });

const univers: Univer[] = [];
const views: Array<{ unmount: () => void }> = [];
function render(node: ReactNode) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(node));
    const view = { container, unmount: () => {
        act(() => root.unmount());
        container.remove();
    } };
    views.push(view);
    return view;
}
afterEach(() => {
    views.splice(0).forEach((view) => view.unmount());
    univers.splice(0).forEach((univer) => univer.dispose());
});

function setup(supportedTypes: UnitObject[] = []) {
    const univer = new Univer({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: { ...uiEnUS, ...enUS } },
        override: [[IAuthzIoService, { useValue: {
            supportsObjectPermissionManagement: (type: UnitObject) => supportedTypes.includes(type),
            listUnitPermissions: async () => [],
        } }]],
    });
    univers.push(univer);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, {
        id: 'doc',
        body: {
            dataStream: 'One\rTwo\r\n',
            paragraphs: [{ startIndex: 3, paragraphId: 'shared/id' }, { startIndex: 7, paragraphId: 'second' }],
            sectionBreaks: [{ startIndex: 8, sectionId: 'section/one' }],
        },
        headers: {
            'header/one': {
                headerId: 'header/one',
                body: { dataStream: 'Header\r\n', paragraphs: [{ startIndex: 6, paragraphId: 'shared/id' }] },
            },
        },
    });
    const injector = univer.__getInjector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    return { injector, dialogs: injector.get(IDialogService) };
}

function getDialogProps(dialog: IDialogPartMethodOptions): IObjectPermissionButtonProps {
    const label = dialog.children?.label;
    if (!label || typeof label !== 'object' || !('props' in label)) {
        throw new Error('Expected a hosted object permission dialog.');
    }
    return label.props as IObjectPermissionButtonProps;
}

describe('DocObjectPermissionEntry', () => {
    it.each([UnitObject.DocumentParagraph, UnitObject.DocumentSection] as const)('hides the entry and separator without support for object type %s', (objectType) => {
        const { injector } = setup([UnitObject.Document]);
        const { container } = render(
            <RediProvider value={{ injector }}>
                <DocObjectPermissionEntry unitId="doc" id={objectType === UnitObject.DocumentParagraph ? 'shared/id' : 'section/one'} objectType={objectType} />
            </RediProvider>
        );
        expect(container.innerHTML).toBe('');
    });

    it.each([
        { objectType: UnitObject.DocumentParagraph, id: 'shared/id', segmentId: '', objectId: 'paragraph//shared%2Fid' },
        { objectType: UnitObject.DocumentParagraph, id: 'shared/id', segmentId: 'header/one', objectId: 'paragraph/header%2Fone/shared%2Fid' },
        { objectType: UnitObject.DocumentSection, id: 'section/one', segmentId: '', objectId: 'section//section%2Fone' },
    ] as const)('opens a stable $objectId target and retains it after the panel unmounts', async ({ objectType, id, segmentId, objectId }) => {
        const { injector, dialogs } = setup([objectType]);
        const view = render(
            <RediProvider value={{ injector }}>
                <DocObjectPermissionEntry unitId="doc" id={id} objectType={objectType} segmentId={segmentId} />
            </RediProvider>
        );
        expect(view.container.querySelector('[data-u-comp="separator"]')).not.toBeNull();
        const opened = firstValueFrom(dialogs.getDialogs$());
        const button = view.container.querySelector('button')!;
        expect(button.textContent).toBe('Permission settings');
        act(() => button.click());
        const [dialog] = await opened;
        view.unmount();
        expect(dialog.open).toBe(true);
        const props = getDialogProps(dialog);
        expect(props.target).toEqual({ unitId: 'doc', objectId, objectType });
        expect(props.commandId).toBe(SetDocumentPermissionCommand.id);
        expect(props.exists?.()).toBe(true);
        injector.get(IUniverInstanceService).disposeUnit('doc');
        expect(props.exists?.()).toBe(false);
    });

    it.each([undefined, 'deleted-id'])('hides the entry without a single existing target (%s)', (id) => {
        const { injector } = setup([UnitObject.DocumentParagraph]);
        const { container } = render(
            <RediProvider value={{ injector }}>
                <DocObjectPermissionEntry unitId="doc" id={id} objectType={UnitObject.DocumentParagraph} />
            </RediProvider>
        );
        expect(container.innerHTML).toBe('');
    });
});
