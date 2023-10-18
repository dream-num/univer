import { CommandType, ICommand, IStyleSheet } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ThemeService } from '../../services/theme.service';

export interface IThemeCommandParams {
    value?: IStyleSheet;
}

export const ThemeOperation: ICommand = {
    id: 'debugger.operation.theme',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IThemeCommandParams) => {
        const themeService = accessor.get(ThemeService);

        params.value && themeService.setTheme(params.value);
        return true;
    },
};
