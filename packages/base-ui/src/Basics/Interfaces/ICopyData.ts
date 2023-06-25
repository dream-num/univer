export interface ICopyData {
    /**
     * table
     * e.g
     * <table data-type="universheet_copy_action_table"></table>
     *
     * or plugin name: image / filter ...
     * e.g
     * <table data-image="[{left:0,right:0,width:100,height:100,url:''}] data-filter"
     */
    name: string;

    /**
     *
     * table html content or plugin config
     */
    value: string;
    /**
     * Whether to embed plugin configuration
     */
    embed: boolean;
}
