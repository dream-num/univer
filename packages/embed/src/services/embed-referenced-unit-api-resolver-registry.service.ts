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

import type { IDisposable, Injector } from '@univerjs/core';
import { toDisposable, UniverInstanceType } from '@univerjs/core';

const PENDING_REFERENCED_UNIT_FACADE_RESOLVERS = new WeakMap<object, IReferencedUnitFacadeResolverRegistration[]>();

export interface IReferencedUnitFacadeResolveContext {
    unitId: string;
    unitType: UniverInstanceType;
    injector: Injector;
    univerAPI: unknown;
}

export interface IReferencedUnitFacadeResolverRegistration<TFacade = unknown> {
    registrationId: string;
    unitType: UniverInstanceType;
    resolve: (context: IReferencedUnitFacadeResolveContext) => TFacade | null | undefined;
}

export class EmbedReferencedUnitFacadeResolverRegistryService {
    private readonly _registrations: IReferencedUnitFacadeResolverRegistration[] = [];

    register(registration: IReferencedUnitFacadeResolverRegistration): IDisposable {
        if (this._registrations.some((item) => item.registrationId === registration.registrationId)) {
            throw new Error(`Referenced unit facade resolver already registered: ${registration.registrationId}`);
        }

        this._registrations.push(registration);
        return toDisposable(() => {
            const index = this._registrations.indexOf(registration);
            if (index >= 0) {
                this._registrations.splice(index, 1);
            }
        });
    }

    registerMany(registrations: readonly IReferencedUnitFacadeResolverRegistration[]): IDisposable[] {
        return registrations.map((registration) => this.register(registration));
    }

    resolve<TFacade = unknown>(context: IReferencedUnitFacadeResolveContext): TFacade {
        const registrations = this._registrations.filter((registration) => registration.unitType === context.unitType);
        if (registrations.length > 1) {
            throw new Error('REFERENCED_UNIT_FACADE_RESOLVER_CONFLICT');
        }

        const registration = registrations[0];
        if (!registration) {
            throw new Error('REFERENCED_UNIT_FACADE_UNAVAILABLE');
        }

        const facade = registration.resolve(context);
        if (!facade) {
            throw new Error('REFERENCED_UNIT_FACADE_UNAVAILABLE');
        }

        return facade as TFacade;
    }

    list(): IReferencedUnitFacadeResolverRegistration[] {
        return [...this._registrations];
    }
}

export function createDefaultReferencedUnitFacadeResolvers(): IReferencedUnitFacadeResolverRegistration[] {
    return [{
        registrationId: 'univer.sheet.workbook.facade',
        unitType: UniverInstanceType.UNIVER_SHEET,
        resolve: ({ univerAPI, unitId }) => getFacadeMethod(univerAPI, 'getWorkbook')?.(unitId),
    }, {
        registrationId: 'univer.doc.document.facade',
        unitType: UniverInstanceType.UNIVER_DOC,
        resolve: ({ univerAPI, unitId }) => getFacadeMethod(univerAPI, 'getDocument')?.(unitId),
    }];
}

export function registerReferencedUnitFacadeResolvers(
    injector: Pick<Injector, 'get' | 'has'>,
    registrations: readonly IReferencedUnitFacadeResolverRegistration[]
): void {
    const uniqueRegistrations = uniqueByRegistrationId(registrations);
    if (injector.has(EmbedReferencedUnitFacadeResolverRegistryService)) {
        const registry = injector.get(EmbedReferencedUnitFacadeResolverRegistryService);
        uniqueRegistrations.forEach((registration) => {
            if (!registry.list().some((item) => item.registrationId === registration.registrationId)) {
                registry.register(registration);
            }
        });
        return;
    }

    const key = injector as object;
    const pending = PENDING_REFERENCED_UNIT_FACADE_RESOLVERS.get(key) ?? [];
    uniqueRegistrations.forEach((registration) => {
        if (!pending.some((item) => item.registrationId === registration.registrationId)) {
            pending.push(registration);
        }
    });
    PENDING_REFERENCED_UNIT_FACADE_RESOLVERS.set(key, pending);
}

export function flushPendingReferencedUnitFacadeResolvers(injector: Pick<Injector, 'get' | 'has'>): void {
    if (!injector.has(EmbedReferencedUnitFacadeResolverRegistryService)) {
        return;
    }

    const pending = PENDING_REFERENCED_UNIT_FACADE_RESOLVERS.get(injector as object);
    if (!pending?.length) {
        return;
    }

    const registry = injector.get(EmbedReferencedUnitFacadeResolverRegistryService);
    pending.forEach((registration) => {
        if (!registry.list().some((item) => item.registrationId === registration.registrationId)) {
            registry.register(registration);
        }
    });
    PENDING_REFERENCED_UNIT_FACADE_RESOLVERS.delete(injector as object);
}

function uniqueByRegistrationId(registrations: readonly IReferencedUnitFacadeResolverRegistration[]): IReferencedUnitFacadeResolverRegistration[] {
    const result: IReferencedUnitFacadeResolverRegistration[] = [];
    registrations.forEach((registration) => {
        if (!result.some((item) => item.registrationId === registration.registrationId)) {
            result.push(registration);
        }
    });
    return result;
}

function getFacadeMethod(api: unknown, methodName: string): ((unitId: string) => unknown | null | undefined) | undefined {
    const method = (api as Record<string, unknown>)[methodName];
    return typeof method === 'function' ? method.bind(api) as (unitId: string) => unknown | null | undefined : undefined;
}
