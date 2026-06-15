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
}

export interface IComponent<T = any> {
    framework: string;
    component: any;
};

export type ComponentType<T = any> = any;

export type ComponentList = Map<string, IComponent>;

export class ComponentManager extends Disposable {
    private _components: ComponentList = new Map();

    constructor(@Optional(ILogService) private readonly _logService?: ILogService) {
        super();
    }

    register(name: string, component: ComponentType, options?: IComponentOptions): IDisposable {
        const { framework = 'react' } = options || {};

        if (framework === 'vue3' && !this._handler.vue3) {
            throw new Error('[ComponentManager] Vue3 support is no longer built-in since v0.9.0, please install @univerjs/ui-adapter-vue3 plugin.');
        }

        if (this._components.has(name)) {
            this._logService?.warn('[ComponentManager]', `Component ${name} already exists.`);
        }

        this._components.set(name, {
            framework,
            component,
        });

        return toDisposable(() => {
            this._components.delete(name);
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
        if (!name) return;

        const value = this._components.get(name);

        if (!value) return;

        const frameworkHandler = this._handler[value.framework];

        if (!frameworkHandler) {
            throw new Error(`[ComponentManager] No handler found for framework: ${value.framework}`);
        }

        return frameworkHandler(value.component, name);
    }

    delete(name: string) {
        this._components.delete(name);
    }
}
