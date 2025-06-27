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
import type { defineComponent } from 'vue';
import { DependentOn, Inject, Injector, Plugin } from '@univerjs/core';
import { ComponentManager, UniverUIPlugin } from '@univerjs/ui';
import { cloneElement, createElement, useEffect, useRef } from 'react';
import { h, render } from 'vue';

/**
 * The plugin that allows Univer to use web components as UI components.
 */
@DependentOn(UniverUIPlugin)
export class UniverVue3AdapterPlugin extends Plugin {
    static override pluginName = 'UNIVER_UI_ADAPTER_VUE3_PLUGIN';

    constructor(
        private readonly _config = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager
    ) {
        super();
    }

    override onStarting(): void {
        this._componentManager.setHandler('vue3', (component: IComponent['component']) => {
            // eslint-disable-next-line react/no-clone-element
            return (props: Record<string, any>) => cloneElement(
                createElement(VueComponentWrapper, {
                    component,
                    props,
                })
            );
        });
    }
}

export function VueComponentWrapper(options: { component: ReturnType<typeof defineComponent>; props: Record<string, any> }) {
    const { component, props } = options;

    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!domRef.current) return;

        const vnode = h(component, props);

        const container = document.createElement('div');
        document.body.appendChild(container);

        render(vnode, domRef.current);

        return () => {
            document.body.removeChild(container);
        };
    }, [props]);

    return createElement('div', { ref: domRef });
}
