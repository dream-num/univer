import { CommandType, ICommand, LocaleType } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { I18nService } from '../../services/i18n.service';

export interface II18nCommandParams {
    value: LocaleType;
}

export const I18nOperation: ICommand = {
    id: 'debugger.operation.locale',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: II18nCommandParams) => {
        const localeService = accessor.get(I18nService);
        localeService.setI18n(params.value);
        return true;
    },
};
