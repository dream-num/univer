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

import type { IComponent } from '@univerjs/ui';
import { DependentOn, Inject, Injector, Plugin } from '@univerjs/core';
import { ComponentManager, UniverUIPlugin } from '@univerjs/ui';

/**
 * The plugin that allows Univer to use web components as UI components.
 */
@DependentOn(UniverUIPlugin)
export class UniverWebComponentAdapterPlugin extends Plugin {
    static override pluginName = 'UNIVER_UI_ADAPTER_WEB_COMPONENT_PLUGIN';

    constructor(
        private readonly _config = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager
    ) {
        super();
    }

    override onStarting(): void {
        const { createElement, useEffect, useRef } = this._componentManager.reactUtils;

        this._componentManager.setHandler('web-component', (component: IComponent['component'], name?: string) => {
            return () => createElement(WebComponentComponentWrapper, {
                component,
                props: {
                    name,
                },
                reactUtils: { createElement, useEffect, useRef },
            });
        });
    }
}

export function WebComponentComponentWrapper(options: {
    component: CustomElementConstructor;
    props?: Record<string, any>;
    reactUtils: typeof ComponentManager.prototype.reactUtils;
}) {
    const { component, props, reactUtils } = options;
    const { name } = props ?? {};
    const { createElement, useEffect, useRef } = reactUtils;

    if (!name) {
        throw new Error('WebComponentComponentWrapper requires a name prop to define the custom element.');
    }

    if (!customElements.get(name)) {
        customElements.define(name, component);
    }

    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!domRef.current) return;

        const webComponent = document.createElement(name) as HTMLElement;
        domRef.current.appendChild(webComponent);

        return () => {
            domRef.current?.removeChild(webComponent);
        };
    }, []);

    return createElement('div', { ref: domRef });
}
