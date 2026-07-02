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

const PENDING_REFERENCED_UNIT_API_RESOLVERS = new WeakMap<object, IReferencedUnitApiResolverRegistration[]>();

export interface IReferencedUnitApiResolveContext {
    unitId: string;
    unitType: UniverInstanceType;
    injector: Injector;
    api: unknown;
}

export interface IReferencedUnitApiResolverRegistration<TApi = unknown> {
    registrationId: string;
    unitType: UniverInstanceType;
    resolve: (context: IReferencedUnitApiResolveContext) => TApi | null | undefined;
}

export class EmbedReferencedUnitApiResolverRegistryService {
    private readonly _registrations: IReferencedUnitApiResolverRegistration[] = [];

    register(registration: IReferencedUnitApiResolverRegistration): IDisposable {
        if (this._registrations.some((item) => item.registrationId === registration.registrationId)) {
            throw new Error(`Referenced unit API resolver already registered: ${registration.registrationId}`);
        }

        this._registrations.push(registration);
        return toDisposable(() => {
            const index = this._registrations.indexOf(registration);
            if (index >= 0) {
                this._registrations.splice(index, 1);
            }
        });
    }

    registerMany(registrations: readonly IReferencedUnitApiResolverRegistration[]): IDisposable[] {
        return registrations.map((registration) => this.register(registration));
    }

    resolve<TApi = unknown>(context: IReferencedUnitApiResolveContext): TApi {
        const registrations = this._registrations.filter((registration) => registration.unitType === context.unitType);
        if (registrations.length > 1) {
            throw new Error('REFERENCED_UNIT_API_RESOLVER_CONFLICT');
        }

        const registration = registrations[0];
        if (!registration) {
            throw new Error('REFERENCED_UNIT_API_UNAVAILABLE');
        }

        const api = registration.resolve(context);
        if (!api) {
            throw new Error('REFERENCED_UNIT_API_UNAVAILABLE');
        }

        return api as TApi;
    }

    list(): IReferencedUnitApiResolverRegistration[] {
        return [...this._registrations];
    }
}

export function createDefaultReferencedUnitApiResolvers(): IReferencedUnitApiResolverRegistration[] {
    return [{
        registrationId: 'univer.sheet.workbook.api',
        unitType: UniverInstanceType.UNIVER_SHEET,
        resolve: ({ api, unitId }) => getApiMethod(api, 'getWorkbook')?.(unitId),
    }, {
        registrationId: 'univer.doc.document.api',
        unitType: UniverInstanceType.UNIVER_DOC,
        resolve: ({ api, unitId }) => getApiMethod(api, 'getDocument')?.(unitId),
    }];
}

export function registerReferencedUnitApiResolvers(
    injector: Pick<Injector, 'get' | 'has'>,
    registrations: readonly IReferencedUnitApiResolverRegistration[]
): void {
    const uniqueRegistrations = uniqueByRegistrationId(registrations);
    if (injector.has(EmbedReferencedUnitApiResolverRegistryService)) {
        const registry = injector.get(EmbedReferencedUnitApiResolverRegistryService);
        uniqueRegistrations.forEach((registration) => {
            if (!registry.list().some((item) => item.registrationId === registration.registrationId)) {
                registry.register(registration);
            }
        });
        return;
    }

    const key = injector as object;
    const pending = PENDING_REFERENCED_UNIT_API_RESOLVERS.get(key) ?? [];
    uniqueRegistrations.forEach((registration) => {
        if (!pending.some((item) => item.registrationId === registration.registrationId)) {
            pending.push(registration);
        }
    });
    PENDING_REFERENCED_UNIT_API_RESOLVERS.set(key, pending);
}

export function flushPendingReferencedUnitApiResolvers(injector: Pick<Injector, 'get' | 'has'>): void {
    if (!injector.has(EmbedReferencedUnitApiResolverRegistryService)) {
        return;
    }

    const pending = PENDING_REFERENCED_UNIT_API_RESOLVERS.get(injector as object);
    if (!pending?.length) {
        return;
    }

    const registry = injector.get(EmbedReferencedUnitApiResolverRegistryService);
    pending.forEach((registration) => {
        if (!registry.list().some((item) => item.registrationId === registration.registrationId)) {
            registry.register(registration);
        }
    });
    PENDING_REFERENCED_UNIT_API_RESOLVERS.delete(injector as object);
}

function uniqueByRegistrationId(registrations: readonly IReferencedUnitApiResolverRegistration[]): IReferencedUnitApiResolverRegistration[] {
    const result: IReferencedUnitApiResolverRegistration[] = [];
    registrations.forEach((registration) => {
        if (!result.some((item) => item.registrationId === registration.registrationId)) {
            result.push(registration);
        }
    });
    return result;
}

function getApiMethod(api: unknown, methodName: string): ((unitId: string) => unknown | null | undefined) | undefined {
    const method = (api as Record<string, unknown>)[methodName];
    return typeof method === 'function' ? method.bind(api) as (unitId: string) => unknown | null | undefined : undefined;
}
