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

import { useEffect, useRef } from 'react';
import { IContextMenuHostService } from '../services/contextmenu/contextmenu-host.service';
import { useDependency } from './di';

export function useMenuHost(onClose: () => void): IContextMenuHostService {
    const service = useDependency(IContextMenuHostService);
    const callbackRef = useRef(onClose);
    callbackRef.current = onClose;

    useEffect(() => {
        const registration = service.registerMenu(Symbol('menu'), () => callbackRef.current());
        if (service.suspended) {
            callbackRef.current();
        }
        return () => registration.dispose();
    }, [service]);

    return service;
}
