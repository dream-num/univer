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

import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { DocHeaderFooterOptions } from './DocHeaderFooterOptions';

export const DocHeaderFooterPanel = () => {
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getCurrentUniverDocInstance()!;
    const unitId = documentDataModel.getUnitId()!;
    const docSkeletonManagerService = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);

    const viewModel = docSkeletonManagerService!.getViewModel();
    const [isEditHeaderFooter, setIsEditHeaderFooter] = useState(true);

    useEffect(() => {
        const editArea = viewModel.getEditArea();
        setIsEditHeaderFooter(editArea !== DocumentEditArea.BODY);

        const subscription = viewModel.editAreaChange$.subscribe((editArea) => {
            if (editArea == null) {
                return;
            }
            setIsEditHeaderFooter(editArea !== DocumentEditArea.BODY);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="univer-text-sm">
            {isEditHeaderFooter
                ? <DocHeaderFooterOptions unitId={unitId} />
                : <div className="univer-text-gray-400">{localeService.t('headerFooter.disableText')}</div>}
        </div>
    );
};
