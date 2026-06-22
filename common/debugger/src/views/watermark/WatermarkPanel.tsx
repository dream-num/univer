import type { IWatermarkConfig, IWatermarkConfigWithType } from '@univerjs/engine-render';
import { ILocalStorageService } from '@univerjs/core';
import { Select } from '@univerjs/design';
import { IWatermarkTypeEnum, UNIVER_WATERMARK_STORAGE_KEY } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { WatermarkImageBaseConfig, WatermarkService, WatermarkTextBaseConfig } from '@univerjs/watermark';
import { useCallback, useEffect, useState } from 'react';
import { WatermarkImageSetting } from './WatermarkImageSetting';
import { WatermarkTextSetting } from './WatermarkTextSetting';

export function WatermarkPanel() {
    const [watermarkType, setWatermarkType] = useState<IWatermarkTypeEnum>(IWatermarkTypeEnum.Text);
    const [config, setConfig] = useState<IWatermarkConfig>();
    const watermarkService = useDependency(WatermarkService);
    const localStorageService = useDependency(ILocalStorageService);
    const _refresh = useObservable(watermarkService.refresh$);

    function handleConfigChange(config: IWatermarkConfig, type?: IWatermarkTypeEnum) {
        setConfig(config);
        watermarkService.updateWatermarkConfig({ type: type ?? watermarkType, config });
    }

    const getWatermarkConfig = useCallback(async () => {
        const watermarkConfig = await localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
        if (watermarkConfig) {
            setWatermarkType(watermarkConfig.type);
            setConfig(watermarkConfig.config);
        } else {
            setConfig({ text: WatermarkTextBaseConfig });
        }
    }, []);

    useEffect(() => {
        getWatermarkConfig();
    }, [_refresh, getWatermarkConfig]);

    return (
        <div className="univer-grid univer-gap-3 univer-text-sm">
            {/* Watermark type */}
            <div className="univer-grid univer-gap-2">
                <div className="univer-text-gray-400">Type</div>
                <Select
                    value={watermarkType}
                    options={[
                        { label: 'Text', value: IWatermarkTypeEnum.Text },
                        { label: 'Image', value: IWatermarkTypeEnum.Image },
                    ]}
                    onChange={(v) => {
                        setWatermarkType(v as IWatermarkTypeEnum);
                        if (v === IWatermarkTypeEnum.Text) {
                            handleConfigChange({ text: WatermarkTextBaseConfig }, IWatermarkTypeEnum.Text);
                        } else if (v === IWatermarkTypeEnum.Image) {
                            handleConfigChange({ image: WatermarkImageBaseConfig }, IWatermarkTypeEnum.Image);
                        }
                    }}
                />
            </div>

            <div className="univer-grid univer-gap-2">
                {watermarkType === IWatermarkTypeEnum.Text && <WatermarkTextSetting config={config?.text} onChange={(v) => handleConfigChange({ text: v })} />}
                {watermarkType === IWatermarkTypeEnum.Image && <WatermarkImageSetting config={config?.image} onChange={(v) => handleConfigChange({ image: v })} />}
            </div>
        </div>
    );
};
