import { TinyColor } from '@ctrl/tinycolor';
import { ISelectionStyle } from '@univerjs/base-sheets';
import { ThemeService } from '@univerjs/core';

export const FORMULA_REF_SELECTION_PLUGIN_NAME = 'formula_reference_selection_plugin_name';

export function getFormulaRefSelectionStyle(themeService: ThemeService, refColor: string, id: string): ISelectionStyle {
    const style = themeService.getCurrentTheme();
    const fill = new TinyColor(refColor).setAlpha(0.05).toString();
    return {
        id,
        strokeWidth: 2,
        stroke: refColor,
        // strokeDash: 10,
        fill,

        widgets: { tl: true, tc: true, tr: true, ml: true, mr: true, bl: true, bc: true, br: true },
        widgetSize: 6,
        widgetStrokeWidth: 1,
        widgetStroke: style.colorWhite,

        hasAutoFill: false,

        hasRowHeader: false,

        hasColumnHeader: false,
    };
}
