import { ISidebarService, useDependency } from '@univerjs/ui';
import { WATERMARK_PANEL, WATERMARK_PANEL_FOOTER } from '../controllers/components.controller';

export function useWatermark() {
    const sidebarService = useDependency(ISidebarService);

    const onSelect = () => {
        sidebarService.open({
            header: { title: 'Watermark' },
            children: { label: WATERMARK_PANEL },
            footer: { label: WATERMARK_PANEL_FOOTER },
            onClose: () => { },
            width: 330,
        });
    };

    return {
        type: 'item' as const,
        children: '🌊 Watermark Settings',
        onSelect,
    };
}
