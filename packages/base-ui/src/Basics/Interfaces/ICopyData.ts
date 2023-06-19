export interface ICopyData {
    /**
     * table type or property,
     *
     * noEmbed does not need to be serialized to the table tag
     */
    key: 'type' | 'property' | 'noEmbed';

    /**
     * table type: univer / office / google / wps ...,
     * e.g
     * univer
     * <table data-type="universheet_copy_action_table"
     *
     * google
     * <google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml"
     *
     * property: image / filter ..., use plugin name
     * e.g
     * <table data-image="[{left:0,right:0,width:100,height:100,url:''}] data-filter"
     */
    tag: string;

    /**
     * property value
     */
    value: string;
}
