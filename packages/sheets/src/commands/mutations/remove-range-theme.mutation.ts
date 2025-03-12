import { CommandType, IMutation } from "@univerjs/core";
import { SheetRangeThemeModel } from "../../model/range-theme-model";

export interface IRemoveRangeThemeMutationParams {
    unitId: string;
    subUnitId: string;
    styleName: string;
}

export const RemoveRangeThemeMutation: IMutation<IRemoveRangeThemeMutationParams> = {
    id: 'sheet.mutation.remove-range-theme',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { styleName } = params;

        const rangeRuleModel = accessor.get(SheetRangeThemeModel);
        rangeRuleModel.unRegisterDefaultRangeTheme(styleName);

        return true;
    },
}
