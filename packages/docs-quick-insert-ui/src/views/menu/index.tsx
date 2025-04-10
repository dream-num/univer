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

import type { DocumentDataModel } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocEventManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { PlusSingle } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { DocQuickInsertPopupService } from '../../services/doc-quick-insert-popup.service';

interface IQuickInsertButtonProps {
    className?: string;
}

export const QuickInsertButton = ({
    className = '',
}: IQuickInsertButtonProps) => {
    const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const currentDoc = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC), [univerInstanceService]));
    const currentUnit = currentDoc && renderManagerService.getRenderById(currentDoc.getUnitId());
    const docEventManagerService = currentUnit?.with(DocEventManagerService);
    const paragraph = useObservable(docEventManagerService?.hoverParagraph$);
    const paragraphLeft = useObservable(docEventManagerService?.hoverParagraphLeft$);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);

    const onClick = () => {
        const p = paragraph ?? paragraphLeft;
        if (!p) {
            return;
        }
        const popup = docQuickInsertPopupService.resolvePopup('/');
        if (!popup) {
            return;
        }

        docSelectionManagerService.replaceDocRanges([{
            startOffset: p.startIndex,
            endOffset: p.startIndex,
        }]);
        docQuickInsertPopupService.showPopup({
            popup,
            index: p.startIndex - 1,
            unitId: currentDoc?.getUnitId() ?? '',
        });
    };
    return (
        <div
            className={`
              univer-mr-1 univer-flex univer-cursor-pointer univer-items-center univer-gap-2.5 univer-rounded-full
              univer-border univer-border-gray-200 univer-bg-white univer-p-1.5 univer-shadow-sm
              hover:univer-bg-gray-100
              ${className}
            `}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <PlusSingle className="univer-text-gray-800" />
        </div>
    );
};

QuickInsertButton.componentKey = 'doc.quick-insert.button';
