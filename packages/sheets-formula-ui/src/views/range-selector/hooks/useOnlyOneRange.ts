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

import { useDependency } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';

export const useOnlyOneRange = (unitId: string, isOnlyOneRange: boolean) => {
    const renderManagerService = useDependency(IRenderManagerService);

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    useEffect(() => {
        if (!refSelectionsRenderService) {
            return;
        }
        if (isOnlyOneRange) {
            refSelectionsRenderService?.setRemainLastEnabled(false);
        } else {
            refSelectionsRenderService?.setRemainLastEnabled(true);
        }
    }, [isOnlyOneRange, refSelectionsRenderService]);
};
