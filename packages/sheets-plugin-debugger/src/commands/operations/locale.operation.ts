import { CommandType, ICommand, LocaleType } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { LocaleService } from '../../services/locale.service';

export interface ILocaleCommandParams {
    value: LocaleType;
}

export const LocaleOperation: ICommand = {
    id: 'debugger.operation.locale',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ILocaleCommandParams) => {
        const localeService = accessor.get(LocaleService);
        localeService.setLocale(params.value);
        return true;
    },
};
