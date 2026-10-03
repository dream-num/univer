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
import type { LocaleKey } from '../../../locale/types';
import {
    BooleanNumber,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { Button, Checkbox, DropdownMenu, InputNumber } from '@univerjs/design';
import { DocSkeletonManagerService, getDocumentPermissionValue } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { OpenHeaderFooterPanelCommand } from '../../../commands/commands/doc-header-footer.command';
import { DocHeaderFooterFields } from './DocHeaderFooterFields';
import { useHeaderFooterOptions } from './use-header-footer-options';

interface IHeaderFooterRibbonControlProps {
    kind: 'insertion' | 'navigation' | 'options' | 'position';
}

export function DocHeaderFooterRibbonControl(props: IHeaderFooterRibbonControlProps) {
    const instances = useDependency(IUniverInstanceService);
    const localeService = useDependency(LocaleService);
    useObservable(localeService.currentLocale$);
    const document = useObservable(() => instances.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC), undefined, false, [instances]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [compact, setCompact] = useState(false);
    const { kind } = props;
    useEffect(() => {
        const toolbar = containerRef.current?.closest('[role="toolbar"]');
        if (!toolbar || kind === 'insertion') {
            return;
        }
        const thresholds = { position: 1100, options: 900, navigation: 650 };
        const resize = () => setCompact(toolbar.getBoundingClientRect().width < thresholds[kind]);
        const observer = new ResizeObserver(resize);
        observer.observe(toolbar);
        return () => observer.disconnect();
    }, [kind, document]);
    if (!document) {
        return null;
    }
    const content = <HeaderFooterRibbonControl key={document.getUnitId()} {...props} unitId={document.getUnitId()} />;
    return (
        <div
            ref={containerRef}
            data-u-command={OpenHeaderFooterPanelCommand.id}
            className="univer-flex univer-items-center univer-whitespace-nowrap"
        >
            {compact && kind !== 'insertion'
                ? (
                    <DropdownMenu items={[{ type: 'custom', className: 'univer-p-2', children: content }]}>
                        <Button data-u-command={OpenHeaderFooterPanelCommand.id} size="small" variant="text" onMouseDown={(event) => event.preventDefault()}>
                            {localeService.t<LocaleKey>(`docs-ui.headerFooter.${kind}`)}
                        </Button>
                    </DropdownMenu>
                )
                : content}
        </div>
    );
}

function HeaderFooterRibbonControl({ kind, unitId }: IHeaderFooterRibbonControlProps & { unitId: string }) {
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const renders = useDependency(IRenderManagerService);
    const permissionService = useDependency(IPermissionService);
    useObservable(permissionService.permissionPointUpdate$);
    const instances = useDependency(IUniverInstanceService);
    const disabled = Boolean(instances.getUnit<DocumentDataModel>(unitId)?.getSnapshot().disabled) || !getDocumentPermissionValue(permissionService, unitId, unitId, UnitAction.Edit);
    const { canLinkToPrevious, linkedToPrevious, options, handleLinkToPreviousChange, handleCheckboxChange, handleMarginChange } = useHeaderFooterOptions(unitId);
    const area = renders.getRenderUnitById(unitId)?.with(DocSkeletonManagerService).getViewModel().getEditArea();

    if (kind === 'insertion') {
        return <DocHeaderFooterFields unitId={unitId} disabled={disabled} />;
    }
    if (kind === 'navigation') {
        return (
            <div
                className="
                  univer-grid univer-grid-cols-[auto_auto] univer-items-center univer-gap-x-2 univer-gap-y-1
                  univer-text-start univer-text-xs
                "
            >
                <Button data-u-command={OpenHeaderFooterPanelCommand.id} size="small" variant="text" disabled={disabled || area === DocumentEditArea.HEADER} onMouseDown={(event) => event.preventDefault()} onClick={() => commandService.executeCommand(OpenHeaderFooterPanelCommand.id, { editArea: DocumentEditArea.HEADER })}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.goToHeader')}
                </Button>
                <Checkbox disabled={disabled || !canLinkToPrevious} checked={linkedToPrevious} onChange={(value) => handleLinkToPreviousChange(Boolean(value))}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.linkToPrevious')}
                </Checkbox>
                <Button data-u-command={OpenHeaderFooterPanelCommand.id} size="small" variant="text" disabled={disabled || area === DocumentEditArea.FOOTER} onMouseDown={(event) => event.preventDefault()} onClick={() => commandService.executeCommand(OpenHeaderFooterPanelCommand.id, { editArea: DocumentEditArea.FOOTER })}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.goToFooter')}
                </Button>
            </div>
        );
    }
    if (kind === 'options') {
        return (
            <div className="univer-flex univer-flex-col univer-gap-2 univer-text-start univer-text-xs">
                <Checkbox disabled={disabled} checked={options.useFirstPageHeaderFooter === BooleanNumber.TRUE} onChange={(value) => handleCheckboxChange(Boolean(value), 'useFirstPageHeaderFooter')}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.firstPageCheckBox')}
                </Checkbox>
                <Checkbox disabled={disabled} checked={options.evenAndOddHeaders === BooleanNumber.TRUE} onChange={(value) => handleCheckboxChange(Boolean(value), 'evenAndOddHeaders')}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.oddEvenCheckBox')}
                </Checkbox>
            </div>
        );
    }
    return (
        <div
            className="
              univer-grid univer-grid-cols-[auto_5rem] univer-items-center univer-gap-x-2 univer-gap-y-1
              univer-text-start univer-text-xs
            "
        >
            <span>{localeService.t<LocaleKey>('docs-ui.headerFooter.headerTopMargin')}</span>
            <InputNumber aria-label={localeService.t<LocaleKey>('docs-ui.headerFooter.headerTopMargin')} disabled={disabled} min={0} max={200} precision={1} value={options.marginHeader} onChange={(value) => handleMarginChange(value ?? 0, 'marginHeader')} />
            <span>{localeService.t<LocaleKey>('docs-ui.headerFooter.footerBottomMargin')}</span>
            <InputNumber aria-label={localeService.t<LocaleKey>('docs-ui.headerFooter.footerBottomMargin')} disabled={disabled} min={0} max={200} precision={1} value={options.marginFooter} onChange={(value) => handleMarginChange(value ?? 0, 'marginFooter')} />
        </div>
    );
}
