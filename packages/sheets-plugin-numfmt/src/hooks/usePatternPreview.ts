import { ThemeService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { useMemo } from 'react';

import { getPatternPreview } from '../utils/pattern';

export const usePatternPreview = (pattern: string, value: number) => {
    const themeService = useDependency(ThemeService);
    return useMemo(() => {
        const info = getPatternPreview(pattern, value);
        if (info.color) {
            const colorMap = themeService.getCurrentTheme();
            const color = colorMap[`${info.color}500`];
            return {
                ...info,
                color,
            };
        }
        return info;
    }, [pattern, value]);
};
