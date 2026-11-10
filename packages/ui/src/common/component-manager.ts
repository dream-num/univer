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

import type { IDisposable } from '@univerjs/core';
import { Disposable, ILogService, Optional, toDisposable } from '@univerjs/core';
import { createElement, useEffect, useRef } from 'react';

type ComponentFramework = string;

export interface IComponentOptions {
    framework?: ComponentFramework;
    /**
     * Whether this registration takes precedence over the built-in default, regardless of registration order.
     * Defaults to false in ComponentManager and true in FUniver.registerComponent.
     * Only one override may be active for each name.
     */
    override?: boolean;
}

export interface IComponent<T = any> {
    framework: string;
    component: any;
};

export type ComponentType<T = any> = any;

export type ComponentList = Map<string, IComponent>;

export class ComponentManager extends Disposable {
    private readonly _components: ComponentList = new Map();
    private readonly _overrides: ComponentList = new Map();

    constructor(@Optional(ILogService) private readonly _logService?: ILogService) {
        super();
    }

    /**
     * Register before the component is first rendered; mounted views do not subscribe to registry changes.
     * Disposing an override reveals the current default, if it is still registered.
     * @throws When another override is already registered for this name.
     */
    register(name: string, component: ComponentType, options?: IComponentOptions): IDisposable {
        const { framework = 'react', override = false } = options ?? {};
        const components = override ? this._overrides : this._components;

        if (framework === 'vue3' && !this._handler.vue3) {
            throw new Error('[ComponentManager] Vue3 support is no longer built-in since v0.9.0, please install @univerjs/ui-adapter-vue3 plugin.');
        }

        if (components.has(name)) {
            if (override) {
                throw new Error(`[ComponentManager] Component ${name} already has an override.`);
            }
            this._logService?.warn('[ComponentManager]', `Component ${name} already exists.`);
        }

        const registration = {
            framework,
            component,
        };
        components.set(name, registration);

        return toDisposable(() => {
            if (components.get(name) === registration) {
                components.delete(name);
            }
        });
    }

    reactUtils: {
        createElement: typeof createElement;
        useEffect: typeof useEffect;
        useRef: typeof useRef;
    } = {
        createElement,
        useEffect,
        useRef,
    };

    private _handler: Record<string, (component: IComponent['component'], name?: string) => any> = {
        react: (component: IComponent['component']) => {
            return component;
        },
    };

    setHandler(framework: string, handler: (component: IComponent['component'], name?: string) => any) {
        this._handler[framework] = handler;
    }

    get(name: string) {
        if (!name) {
            return;
        }

        const value = this._overrides.get(name) ?? this._components.get(name);

        if (!value) {
            return;
        }

        const frameworkHandler = this._handler[value.framework];

        if (!frameworkHandler) {
            throw new Error(`[ComponentManager] No handler found for framework: ${value.framework}`);
        }

        return frameworkHandler(value.component, name);
    }

    /** Check for a built-in default independently of any active host override. */
    hasDefault(name: string): boolean {
        return this._components.has(name);
    }

    /** Remove the default registration. Overrides can only be removed through their registration disposable. */
    delete(name: string) {
        this._components.delete(name);
    }

    override dispose(): void {
        super.dispose();
        this._components.clear();
        this._overrides.clear();
    }
}
