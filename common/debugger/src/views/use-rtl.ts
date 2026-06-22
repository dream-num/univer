import { LocaleService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

export function useRTL() {
    const localeService = useDependency(LocaleService);

    useEffect(() => {
        const dir = localStorage.getItem('local.direction');

        if (dir === 'rtl' || dir === 'ltr') {
            localeService.setDirection(dir);
        }
    }, [localeService]);

    const onSelect = () => {
        const current = localeService.getDirection();
        const nextDirection = current === 'rtl' ? 'ltr' : 'rtl';

        localeService.setDirection(nextDirection);
        localStorage.setItem('local.direction', nextDirection);
    };

    return {
        type: 'item' as const,
        children: '↔️ Toggle RTL',
        onSelect,
    };
}
