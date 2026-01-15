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

import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';

export function useIsFocusing(editorId: string) {
    const renderManagerService = useDependency(IRenderManagerService);
    const renderer = renderManagerService.getRenderById(editorId);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const selections = useObservable(docSelectionRenderService?.textSelectionInner$);
    return Boolean((docSelectionRenderService?.isFocusing ?? false) && selections?.textRanges.some((r) => r.collapsed));
}
