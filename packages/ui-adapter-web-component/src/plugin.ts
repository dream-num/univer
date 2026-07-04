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
import type { IUniverWebComponentAdapterConfig } from './config/config';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import { ComponentManager, UniverUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import { defaultPluginConfig, UI_ADAPTER_WEB_COMPONENT_PLUGIN_CONFIG_KEY } from './config/config';

/**
 * The plugin that allows Univer to use web components as UI components.
 */
@DependentOn(UniverUIPlugin)
export class UniverWebComponentAdapterPlugin extends Plugin {
    static override pluginName = 'UNIVER_UI_ADAPTER_WEB_COMPONENT_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: Partial<IUniverWebComponentAdapterConfig> = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager
    ) {
        super();

        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(UI_ADAPTER_WEB_COMPONENT_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const { createElement, useEffect, useRef } = this._componentManager.reactUtils;

        this._componentManager.setHandler('web-component', (component: IComponent['component'], name?: string) => {
            return (props: Record<string, unknown>) => createElement(WebComponentComponentWrapper, {
                component,
                props: {
                    name,
                    componentProps: props,
                },
                reactUtils: { createElement, useEffect, useRef },
            });
        });
    }
}

export function WebComponentComponentWrapper(options: {
    component: CustomElementConstructor;
    props?: {
        name?: string;
        componentProps?: Record<string, unknown>;
    };
    reactUtils: typeof ComponentManager.prototype.reactUtils;
}) {
    const { component, props, reactUtils } = options;
    const { name, componentProps = {} } = props ?? {};
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
        const webComponentWithProps = webComponent as HTMLElement & Record<string, unknown>;
        Object.entries(componentProps).forEach(([key, value]) => {
            if (key !== 'key') {
                webComponentWithProps[key] = value;
            }
        });
        domRef.current.appendChild(webComponent);

        return () => {
            domRef.current?.removeChild(webComponent);
        };
    }, [componentProps]);

    return createElement('div', { ref: domRef });
}
