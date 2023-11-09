/**
 * Theme color types.
 *
 * @remarks
 * SpreadsheetProperties contain a SpreadsheetTheme that defines a mapping of these theme color types to concrete colors.
 *
 * Reference: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#ThemeColor
 * 
 * 17.18.97 ST_ThemeColor (Theme Color)
 * 
 * <xsd:enumeration value="dark1"/>
    2703 <xsd:enumeration value="light1"/>
    2704 <xsd:enumeration value="dark2"/>
    2705 <xsd:enumeration value="light2"/>
    2706 <xsd:enumeration value="accent1"/>
    2707 <xsd:enumeration value="accent2"/>
    2708 <xsd:enumeration value="accent3"/>
    2709 <xsd:enumeration value="accent4"/>
    2710 <xsd:enumeration value="accent5"/>
    2711 <xsd:enumeration value="accent6"/>
    2712 <xsd:enumeration value="hyperlink"/>
    2713 <xsd:enumeration value="followedHyperlink"/
 */
export enum ThemeColorType {
    /**
     * TEXT
     */
    DARK1,
    /**
     * BACKGROUND
     */
    LIGHT1,
    DARK2,
    LIGHT2,
    ACCENT1,
    ACCENT2,
    ACCENT3,
    ACCENT4,
    ACCENT5,
    ACCENT6,
    /**
     * LINK
     */
    HYPERLINK,
    FOLLOWED_HYPERLINK,
}

// TODO: get color list to color picker
// TODO: 取色

export enum ThemeColors {
    OFFICE = 'Office',
    OFFICE_2007_2010 = 'Office 2007-2010',
    GRAYSCALE = 'Grayscale',
    BLUE_WARM = 'Blue Warm',
    BLUE = 'Blue',
    BLUE_II = 'Blue II',
    BLUE_GREEN = 'Blue Green',
    GREEN = 'Green',
    GREEN_YELLOW = 'Green Yellow',
    YELLOW = 'Yellow',
    YELLOW_ORANGE = 'Yellow Orange',
    ORANGE = 'Orange',
    ORANGE_RED = 'Orange Red',
    RED_ORANGE = 'Red Orange',
    RED = 'Red',
    RED_VIOLET = 'Red Violet',
    VIOLET = 'Violet',
    VIOLET_II = 'Violet II',
    MEDIAN = 'Median',
    PAPER = 'Paper',
    MARQUEE = 'Marquee',
    SLIPSTREAM = 'Slipstream',
    Aspect = 'Aspect',
}
