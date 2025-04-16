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

import { DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { DocumentDataModel, IAccessor } from '@univerjs/core';

/**
 * Get the skeleton of the command's target.
 * @param accessor The injection accessor.
 * @param unitId Unit ID.
 */
export function getCommandSkeleton(accessor: IAccessor, unitId: string) {
    const renderManagerService = accessor.get(IRenderManagerService);
    return renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
}

export function getRichTextEditPath(docDataModel: DocumentDataModel, segmentId = '') {
    if (!segmentId) {
        return ['body'];
    }

    const { headers, footers } = docDataModel.getSnapshot();

    if (headers == null && footers == null) {
        throw new Error('Document data model must have headers or footers when update by segment id');
    }

    if (headers?.[segmentId] != null) {
        return ['headers', segmentId, 'body'];
    } else if (footers?.[segmentId] != null) {
        return ['footers', segmentId, 'body'];
    } else {
        throw new Error('Segment id not found in headers or footers');
    }
}
