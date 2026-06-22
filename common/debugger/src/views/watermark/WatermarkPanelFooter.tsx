import { Button } from '@univerjs/design';
import { IWatermarkTypeEnum } from '@univerjs/engine-render';
import { IClipboardInterfaceService, ISidebarService, useDependency } from '@univerjs/ui';
import { WatermarkService, WatermarkTextBaseConfig } from '@univerjs/watermark';

export function WatermarkPanelFooter() {
    const sidebarService = useDependency(ISidebarService);
    const watermarkService = useDependency(WatermarkService);
    const clipboardService = useDependency(IClipboardInterfaceService);

    return (
        <div className="univer-flex univer-items-center univer-justify-between">
            <a
                className="univer-text-sm univer-text-primary-600 univer-underline"
                onClick={() => {
                    watermarkService.updateWatermarkConfig({
                        type: IWatermarkTypeEnum.Text,
                        config: { text: WatermarkTextBaseConfig },
                    });
                    watermarkService.refresh();
                }}
            >
                Cancel Watermark
            </a>

            <div className="univer-flex univer-items-center univer-gap-2">
                <Button
                    onClick={async () => {
                        const watermarkConfig = await watermarkService.getWatermarkConfig();
                        let config;
                        if (watermarkConfig?.type === IWatermarkTypeEnum.Text) {
                            config = watermarkConfig.config.text;
                        } else if (watermarkConfig?.type === IWatermarkTypeEnum.Image) {
                            config = watermarkConfig.config.image;
                        }
                        clipboardService.writeText(JSON.stringify(config));
                    }}
                >
                    Copy Config
                </Button>
                <Button
                    onClick={async () => {
                        const watermarkConfig = await watermarkService.getWatermarkConfig();
                        if (watermarkConfig?.type === IWatermarkTypeEnum.Text && !watermarkConfig.config.text?.content) {
                            watermarkService.deleteWatermarkConfig();
                        } else if (watermarkConfig?.type === IWatermarkTypeEnum.Image && !watermarkConfig.config.image?.url) {
                            watermarkService.deleteWatermarkConfig();
                        }
                        sidebarService.close();
                    }}
                >
                    Close Panel
                </Button>
            </div>
        </div>
    );
};
