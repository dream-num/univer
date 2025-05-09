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
import type { IDocPopup } from '../../services/doc-quick-insert-popup.service';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { PlusSingle } from '@univerjs/icons';
import { ILayoutService, useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useMemo } from 'react';
import { combineLatest, map } from 'rxjs';
import { DocQuickInsertMenuController } from '../../controllers/doc-quick-insert-menu.controller';
import { DocQuickInsertPopupService } from '../../services/doc-quick-insert-popup.service';
import { QuickInsertButtonComponentKey } from './const';

interface IQuickInsertButtonProps {
    className?: string;
}

export const QuickInsertButton = ({ className = '' }: IQuickInsertButtonProps) => {
    const docQuickInsertPopupService = useDependency(DocQuickInsertPopupService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const currentDoc = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC), [univerInstanceService]));
    const currentUnit = currentDoc && renderManagerService.getRenderById(currentDoc.getUnitId());
    const docQuickInsertMenuController = currentUnit?.with(DocQuickInsertMenuController);
    const layoutService = useDependency(ILayoutService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const editPopup = useObservable(docQuickInsertPopupService.editPopup$);

    const onClick: React.MouseEventHandler<HTMLDivElement> = useEvent((event) => {
        const p = docQuickInsertMenuController?.popup;
        if (!p) {
            return;
        }

        const allPopups = docQuickInsertPopupService.popups;
        // combine all popups into one
        const popup: IDocPopup = {
            keyword: '',
            menus$: combineLatest(allPopups.map((p) => p.menus$))
                .pipe(
                    map((menusCollection) => menusCollection.flat())
                ),
        };

        docSelectionManagerService.replaceDocRanges([{
            startOffset: p.startIndex,
            endOffset: p.startIndex,
        }]);
        docQuickInsertPopupService.setInputOffset({ start: p.startIndex - 1, end: p.startIndex - 1 });
        docQuickInsertPopupService.showPopup({
            popup,
            index: p.startIndex - 1,
            unitId: currentDoc?.getUnitId() ?? '',
        });
        setTimeout(() => {
            // keep the cursor in doc
            layoutService.focus();
        });
    });
    return (
        <div
            className={clsx(`
              univer-mr-1 univer-flex univer-cursor-pointer univer-items-center univer-gap-2.5 univer-rounded-full
              univer-p-1.5 univer-shadow-sm
              hover:univer-bg-gray-100
            `, borderClassName, {
                'univer-bg-gray-100': editPopup,
                'univer-bg-white': !editPopup,
            }, className)}
            role="button"
            tabIndex={0}
            onClick={onClick}
        >
            <PlusSingle className="univer-text-gray-800" />
        </div>
    );
};

QuickInsertButton.componentKey = QuickInsertButtonComponentKey;
