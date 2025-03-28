import { CommandType, IAccessor, IMutation } from "@univerjs/core";
import { IRangeThemeStyleJSON, RangeThemeStyle } from "../../model/range-theme-util";
import { SheetRangeThemeModel } from "../../model/range-theme-model";

export interface IAddRangeThemeMutationParams {
    styleJSON: IRangeThemeStyleJSON;
    unitId: string;
    subUnitId: string;
}


export const AddRangeThemeMutation: IMutation<IAddRangeThemeMutationParams> = {
    id: 'sheet.mutation.add-range-theme',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false
        }
        const { styleJSON, unitId } = params;

        const rangeRuleModel = accessor.get(SheetRangeThemeModel);
        const rangeThemeStyle = new RangeThemeStyle(styleJSON.name);
        rangeThemeStyle.fromJson(styleJSON);
        rangeRuleModel.registerRangeThemeStyle(unitId, rangeThemeStyle);

        return true;
    }
}
