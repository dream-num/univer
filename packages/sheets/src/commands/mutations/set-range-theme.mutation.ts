
import { SheetRangeThemeModel } from "../../model/range-theme-model";
import { IRangeThemeStyleJSON } from "../../model/range-theme-util";
import { CommandType, IMutation } from "@univerjs/core";

export interface ISetRangeThemeMutationParams {
    unitId: string;
    subUnitId: string;
    styleName: string;
    style: Omit<IRangeThemeStyleJSON, 'name'>;
}


export const SetRangeThemeMutation: IMutation<ISetRangeThemeMutationParams> = {
    id: 'sheet.mutation.set-range-theme',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, styleName, style } = params;
        const rangeThemeModel = accessor.get(SheetRangeThemeModel);
        const rangeThemeStyle = rangeThemeModel.getRangeThemeStyle(unitId, styleName);
        if (rangeThemeStyle) {
            if (style.headerRowStyle) {
                rangeThemeStyle.setHeaderRowStyle(style.headerRowStyle);
            }
            if (style.firstRowStyle) {
                rangeThemeStyle.setFirstRowStyle(style.firstRowStyle);
            }
            if (style.secondRowStyle) {
                rangeThemeStyle.setSecondRowStyle(style.secondRowStyle);
            }
            if (style.lastRowStyle) {
                rangeThemeStyle.setLastRowStyle(style.lastRowStyle);
            }
            // TODO add other style
        }

        return true;
    },
}
