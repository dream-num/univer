/**
 * Copyright 2023-present DreamNum Inc.
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

import type {
    Dependency,
    Injector,
} from '@univerjs/core';
import type { ISocket } from '@univerjs/network';
import {
    FUniver,
    Quantity,
    Univer,
} from '@univerjs/core';
import { ISocketService, WebSocketService } from '@univerjs/network';

interface IFUniverLegacy {
    /**
     * Set WebSocket URL for WebSocketService
     *
     * @param {string} url WebSocket URL
     * @returns {ISocket} WebSocket instance
     */
    createSocket(url: string): ISocket;
}

class FUniverLegacy extends FUniver implements IFUniverLegacy {
    /**
     * Get dependencies for FUniver, you can override newAPI to add more dependencies.
     *
     * @static
     * @protected
     *
     * @param {Injector} injector - The injector instance used to retrieve dependencies.
     * @param {Dependency[]} [derivedDependencies] - Optional array of pre-derived dependencies.
     * @returns {Dependency[]} - An array of dependencies required by the service.
     */
    protected static getDependencies(injector: Injector, derivedDependencies?: []): Dependency[] {
        const dependencies: Dependency[] = derivedDependencies || [];
        // Is unified registration required?
        const socketService = injector.get(ISocketService, Quantity.OPTIONAL);
        if (!socketService) {
            dependencies.push([ISocketService, { useClass: WebSocketService }]);
        }
        return dependencies;
    }

    /**
     * Create an FUniver instance, if the injector is not provided, it will create a new Univer instance.
     *
     * @static
     *
     * @param {Univer | Injector} wrapped - The Univer instance or injector instance.
     * @returns {FUniver} - The FUniver instance.
     */
    static override newAPI(wrapped: Univer | Injector): FUniver {
        const injector = wrapped instanceof Univer ? wrapped.__getInjector() : wrapped;
        const dependencies = FUniverLegacy.getDependencies(injector);
        dependencies.forEach((dependency) => injector.add(dependency));
        return injector.createInstance(FUniver);
    }

    override createSocket(url: string): ISocket {
        const wsService = this._injector.get(ISocketService);
        const ws = wsService.createSocket(url);

        if (!ws) {
            throw new Error('[WebSocketService]: failed to create socket!');
        }

        return ws;
    }
}

FUniver.extend(FUniverLegacy);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverLegacy {}
}
