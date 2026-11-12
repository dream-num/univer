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
import { ITransientUIService } from '../services/transient-ui/transient-ui.service';
import { useDependency } from './di';

export function useTransientUI(onDismiss: () => void): ITransientUIService {
    const service = useDependency(ITransientUIService);
    const callbackRef = useRef(onDismiss);
    callbackRef.current = onDismiss;

    useEffect(() => {
        const subscription = service.dismissed$.subscribe(() => callbackRef.current());
        if (service.suspended) {
            callbackRef.current();
        }
        return () => subscription.unsubscribe();
    }, [service]);

    return service;
}
