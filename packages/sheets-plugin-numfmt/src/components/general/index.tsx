import { LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { FC, useEffect } from 'react';

import { BusinessComponentProps } from '../../base/types';

export const isGeneralPanel = (pattern: string) => !pattern;

export const GeneralPanel: FC<BusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    useEffect(() => {
        props.onChange('');
    }, []);
    return (
        <div>
            <div className="m-t-16 label">{t('sheet.numfmt.preview')}</div>
            <div className="m-t-8 preview"> {props.defaultValue} </div>
            <div className="describe m-t-14">{t('sheet.numfmt.generalDes')}</div>
        </div>
    );
};
