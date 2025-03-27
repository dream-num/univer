/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IUser, Nullable } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { IImageWatermarkConfig, ITextWatermarkConfig, IUserInfoWatermarkConfig, IWatermarkConfigWithType } from './type';
import { IWatermarkTypeEnum } from './type';

export function renderWatermark(ctx: UniverRenderingContext, config: IWatermarkConfigWithType, image: Nullable<HTMLImageElement>, userInfo: Nullable<IUser>) {
    const type = config.type;
    const watermarkConfig = config.config;
    if (type === IWatermarkTypeEnum.UserInfo && watermarkConfig.userInfo) {
        renderUserInfoWatermark(ctx, watermarkConfig.userInfo, userInfo);
    } else if (type === IWatermarkTypeEnum.Image && watermarkConfig.image) {
        renderImageWatermark(ctx, watermarkConfig.image, image);
    } else if (type === IWatermarkTypeEnum.Text && watermarkConfig.text) {
        renderTextWatermark(ctx, watermarkConfig.text);
    }
}

export function renderUserInfoWatermark(ctx: UniverRenderingContext, config: IUserInfoWatermarkConfig, userInfo: Nullable<IUser>) {
    const { x, y, repeat, spacingX, spacingY, rotate, opacity, name, fontSize, color, bold, italic, direction } = config;

    if (!userInfo) {
        return;
    }

    let watermarkContent = '';
    if (name) {
        watermarkContent += `${userInfo.name} `;
    }

    // if (email) {
    //     watermarkContent += `Email: ${userInfo.email} `;
    // }
    // if (phone) {
    //     watermarkContent += `Phone: ${userInfo.phone} `;
    // }
    // if (uid) {
    //     watermarkContent += `UID: ${userInfo.uid} `;
    // }

    if (!watermarkContent) {
        return;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    ctx.direction = direction;

    let fontStyle = '';
    if (italic) fontStyle += 'italic ';
    if (bold) fontStyle += 'bold ';
    fontStyle += `${fontSize}px Arial`;
    ctx.font = fontStyle;
    ctx.fillStyle = color;

    if (repeat) {
        // Draw repeated text across the canvas
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        for (let posY = y; posY < canvasHeight; posY += fontSize + spacingY) {
            for (let posX = x; posX < canvasWidth; posX += ctx.measureText(watermarkContent).width + spacingX) {
                ctx.save();
                ctx.translate(posX, posY);
                ctx.rotate((Math.PI / 180) * rotate);
                ctx.fillText(watermarkContent, 0, 0);
                ctx.restore();
            }
        }
    } else {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * rotate);
        ctx.fillText(watermarkContent, 0, 0);
        ctx.restore();
    }

    ctx.restore();
}

export function renderTextWatermark(ctx: UniverRenderingContext, config: ITextWatermarkConfig) {
    const { x, y, repeat, spacingX, spacingY, rotate, opacity, content, fontSize, color, bold, italic, direction } = config;

    ctx.save();
    ctx.globalAlpha = opacity;

    ctx.direction = direction;

    let fontStyle = '';
    if (italic) fontStyle += 'italic ';
    if (bold) fontStyle += 'bold ';
    fontStyle += `${fontSize}px Arial`;
    ctx.font = fontStyle;
    ctx.fillStyle = color;

    if (content) {
        if (repeat) {
            // Draw repeated text across the canvas
            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;

            for (let posY = y; posY < canvasHeight; posY += fontSize + spacingY) {
                for (let posX = x; posX < canvasWidth; posX += ctx.measureText(content).width + spacingX) {
                    ctx.save();
                    ctx.translate(posX, posY);
                    ctx.rotate((Math.PI / 180) * rotate);
                    ctx.fillText(content, 0, 0);
                    ctx.restore();
                }
            }
        } else {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.PI / 180) * rotate);
            ctx.fillText(content, 0, 0);
            ctx.restore();
        }
    }

    ctx.restore();
}

export function renderImageWatermark(ctx: UniverRenderingContext, config: IImageWatermarkConfig, image: Nullable<HTMLImageElement>) {
    const { x, y, repeat, spacingX, spacingY, rotate, opacity, width, height, maintainAspectRatio, originRatio } = config;

    if (!image?.complete) {
        return;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    const actualWidth = maintainAspectRatio ? width : width;
    const actualHeight = maintainAspectRatio ? width / originRatio : height;

    if (repeat) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        for (let posY = y; posY < canvasHeight; posY += actualHeight + spacingY) {
            for (let posX = x; posX < canvasWidth; posX += actualWidth + spacingX) {
                ctx.save();
                ctx.translate(posX, posY);
                ctx.rotate((Math.PI / 180) * rotate);
                ctx.drawImage(image, 0, 0, actualWidth, actualHeight);
                ctx.restore();
            }
        }
    } else {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * rotate);
        ctx.drawImage(image, 0, 0, actualWidth, actualHeight);
        ctx.restore();
    }

    ctx.restore();
};
