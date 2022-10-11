import { ThemeColorType } from '../../src/Enum';
import { Color, RgbColor, ThemeColor } from '../../src/Sheets/Domain/Color';
import { ColorBuilder } from '../../src/Sheets/Domain/ColorBuilder';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test Color RgbColor', () => {
    const builder = new ColorBuilder();
    builder.setRgbColor('rgb(0,10,100)');
    const rgb = builder.build() as RgbColor;
    expect(rgb.getRed()).toEqual(0);
    expect(rgb.getGreen()).toEqual(10);
    expect(rgb.getBlue()).toEqual(100);
    expect(rgb.getAlpha()).toEqual(1);

    const hex = Color.rgbColorToHexValue(rgb);
    const hRgb = Color.hexValueToRgbColor(hex);
    console.log(hex);
    console.log(hRgb);

    builder.setRgbColor('rgba(0,10,100, 0.2)');
    const rgba = builder.build() as RgbColor;
    expect(rgba.getRed()).toEqual(0);
    expect(rgba.getGreen()).toEqual(10);
    expect(rgba.getBlue()).toEqual(100);
    expect(rgba.getAlpha()).toEqual(0.2);
});

test('Test Color themeColor Office', () => {
    const builder = new ColorBuilder();
    builder.setThemeColor(ThemeColorType.ACCENT1);
    const color = builder.build() as ThemeColor;
    const rgba = color.asRgbColor();
    expect(rgba.getRed()).toEqual(68);
    expect(rgba.getGreen()).toEqual(114);
    expect(rgba.getBlue()).toEqual(196);
    expect(rgba.getAlpha()).toEqual(1);
});

test('Test Color themeColor', () => {
    const builder = new ColorBuilder();
    builder.setThemeColor(ThemeColorType.ACCENT1);
    const color = builder.build() as ThemeColor;
    expect(color.getThemeColorType()).toEqual(ThemeColorType.ACCENT1);
});

test('Test Color RgbColor Dark', () => {
    const builder = new ColorBuilder();
    builder.setRgbColor('rgb(8,255,0)');
    const rgb = builder.build() as RgbColor;
    expect(rgb.getRed()).toEqual(8);
    expect(rgb.getGreen()).toEqual(255);
    expect(rgb.getBlue()).toEqual(0);
    expect(rgb.getAlpha()).toEqual(1);
    RgbColor.RGB_COLOR_AMT = -100;
    expect(rgb.getRed()).toEqual(0);
    expect(rgb.getGreen()).toEqual(155);
    expect(rgb.getBlue()).toEqual(0);
    expect(rgb.getAlpha()).toEqual(1);
});
