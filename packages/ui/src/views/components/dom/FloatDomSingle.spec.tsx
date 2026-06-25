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

/**
 * @vitest-environment jsdom
 */

import type { ReactElement } from 'react';
import type { IFloatDom, IFloatDomLayout } from '../../../services/dom/canvas-dom-layer.service';
import { render, screen, waitFor } from '@testing-library/react';
import { Injector, IUniverInstanceService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { CanvasFloatDomService } from '../../../services/dom/canvas-dom-layer.service';
import { RediProvider } from '../../../utils/di';
import { FloatDom, FloatDomSingle } from './FloatDom';

function TestFloatDomContent(_props: { hostFloatDomLayout$?: IFloatDom['position$'] }) {
    return <div>float content</div>;
}

function renderWithDependencies(element: ReactElement, focusedUnit: unknown = null) {
    const injector = new Injector();
    injector.add([CanvasFloatDomService]);
    injector.add([IUniverInstanceService, {
        useValue: {
            focused$: new BehaviorSubject(focusedUnit) as never,
            getUnit: () => undefined,
        } as never,
    }]);

    const result = render(
        <RediProvider value={{ injector }}>
            {element}
        </RediProvider>
    );

    return {
        ...result,
        injector,
    };
}

function createFloatDom(): IFloatDom {
    return {
        id: 'float-1',
        componentKey: TestFloatDomContent,
        onPointerDown: () => {},
        onPointerMove: () => {},
        onPointerUp: () => {},
        onWheel: () => {},
        position$: new BehaviorSubject<IFloatDomLayout>({
            startX: 10,
            startY: 20,
            endX: 110,
            endY: 120,
            rotate: 0,
            width: 100,
            height: 100,
            absolute: { left: true, top: true },
        }),
        unitId: 'doc-1',
    };
}

describe('FloatDomSingle', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders an existing BehaviorSubject position without waiting for a later movement event', async () => {
        renderWithDependencies(<FloatDomSingle id="dom-1" layer={createFloatDom()} />);

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(document.getElementById('dom-1')).not.toBeNull();
    });

    it('passes the host layout observable to float dom components', async () => {
        let receivedLayout$: IFloatDom['position$'] | undefined;
        function InspectFloatDomContent(props: { hostFloatDomLayout$?: IFloatDom['position$'] }) {
            receivedLayout$ = props.hostFloatDomLayout$;
            return <div>float content</div>;
        }
        const layer = {
            ...createFloatDom(),
            componentKey: InspectFloatDomContent,
        };

        renderWithDependencies(<FloatDomSingle id="dom-1" layer={layer} />);

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(receivedLayout$).toBe(layer.position$);
    });
});

describe('FloatDom', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders layers for the focused unit when focused$ emits a unit object', async () => {
        const rendered = renderWithDependencies(<FloatDom />, {
            getUnitId: () => 'doc-1',
        });
        rendered.injector.get(CanvasFloatDomService).addFloatDom(createFloatDom());

        await waitFor(() => expect(screen.getByText('float content')).not.toBeNull());
        expect(document.getElementById('float-1')).not.toBeNull();
    });
});
