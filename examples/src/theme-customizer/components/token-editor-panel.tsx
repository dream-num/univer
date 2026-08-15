import type { Theme } from '@univerjs/themes';
import type { LoopColorKey, ThemeGrayEndpointKey, ThemeScaleKey, ThemeShadeKey } from '../types';
import { IntegrationExampleSection, ThemeGrayEndpointsSection, ThemeLoopColorSection, ThemeScaleSection } from './theme-sections';

export function TokenEditorPanel(props: {
    copyLabel: string;
    theme: Theme;
    visibleScaleKeys: ThemeScaleKey[];
    onCopy: () => void;
    onLoopColorChange: (key: LoopColorKey, value: string) => void;
    onGrayEndpointChange: (key: ThemeGrayEndpointKey, value: string) => void;
    onScaleColorChange: (scale: ThemeScaleKey, shade: ThemeShadeKey, value: string) => void;
}) {
    const { copyLabel, theme, visibleScaleKeys, onCopy, onGrayEndpointChange, onLoopColorChange, onScaleColorChange } = props;

    return (
        <div className="univer-flex univer-flex-col univer-gap-4">
            <ThemeGrayEndpointsSection theme={theme} onChange={onGrayEndpointChange} />

            {visibleScaleKeys.map((scale, index) => (
                <ThemeScaleSection
                    key={scale}
                    title={scale}
                    scale={scale}
                    theme={theme}
                    defaultExpanded={index < 2}
                    onChange={onScaleColorChange}
                />
            ))}

            <ThemeLoopColorSection theme={theme} onChange={onLoopColorChange} />
            <IntegrationExampleSection copyLabel={copyLabel} onCopy={onCopy} />
        </div>
    );
}
