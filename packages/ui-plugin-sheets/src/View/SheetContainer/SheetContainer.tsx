import { BaseComponentProps } from '@univerjs/base-ui';

import { ISheetUIPluginConfig } from '../../Basics';
import { CountBar } from '../CountBar';
import { SheetBar } from '../SheetBar';

export interface BaseSheetContainerProps extends BaseComponentProps {
    config: ISheetUIPluginConfig;
    changeLocale: (locale: string) => void;
    methods?: any;
}

export function RenderSheetFooter() {
    return (
        <>
            <SheetBar></SheetBar>
            <CountBar></CountBar>
        </>
    );
}
