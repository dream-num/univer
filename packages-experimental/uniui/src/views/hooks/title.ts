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

import type { Nullable } from '@univerjs/core';
import { IUniverInstanceService } from '@univerjs/core';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';

export function useUnitTitle(unitId: string): string | undefined {
    const instanceService = useDependency(IUniverInstanceService);
    const unit = useMemo(() => instanceService.getUnit(unitId), [unitId, instanceService]);
    const title = useObservable<string>(unit?.name$, '', false, [unit]);
    return title;
}

export function useUnitFocused(unitId: string): boolean {
    const instanceService = useDependency(IUniverInstanceService);
    const focusedUnitId = useObservable<Nullable<string>>(instanceService.focused$);
    return unitId === focusedUnitId;
}
