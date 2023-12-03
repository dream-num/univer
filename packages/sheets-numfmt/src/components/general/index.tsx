import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { FC } from 'react';
import React from 'react';

import type { IBusinessComponentProps } from '../../base/types';

export const isGeneralPanel = (pattern: string) => !pattern;

export const GeneralPanel: FC<IBusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);
    const t = localeService.t;

    props.action.current = () => '';

    return (
        <div>
            <div className="describe m-t-14">{t('sheet.numfmt.generalDes')}</div>
        </div>
    );
};
