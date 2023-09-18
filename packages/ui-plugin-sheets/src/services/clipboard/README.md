# Sheet Clipboard Module Design

## HTML format

To communicate with other spreadsheet softwares, we support HTML format to store the data in clipboard.

A demo:

```html
<html>
    <body>
        <style type="text/css"></style>
        <table
            xmlns="http://www.w3.org/1999/xhtml"
            cellspacing="0"
            cellpadding="0"
            dir="ltr"
            border="1"
            style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"
        >
            <!-- col style -->
            <colgroup>
                <col width="100" />
                <col width="100" />
                <col width="100" />
            </colgroup>
            <tbody>
                <!-- row style -->
                <tr style="height:21px;">
                    <td style="border-right:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;" data-sheets-value='{"1":3,"3":1}'>
                        1
                    </td>
                    <td
                        style="border-top:1px solid #000000;border-right:1px solid #000000;border-bottom:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;"
                        data-sheets-value='{"1":3,"3":4}'
                    >
                        4
                    </td>
                    <td
                        style="border-top:1px solid #000000;border-right:1px solid #000000;border-bottom:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;"
                        data-sheets-value='{"1":3,"3":5}'
                    >
                        5
                    </td>
                </tr>
                <tr style="height:21px;">
                    <td style="border-right:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;" data-sheets-value='{"1":3,"3":2}'>
                        2
                    </td>
                    <td
                        style="border-right:1px solid #000000;border-bottom:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;"
                        data-sheets-value='{"1":3,"3":6}'
                    >
                        6
                    </td>
                    <td
                        style="border-right:1px solid #000000;border-bottom:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;"
                        data-sheets-value='{"1":3,"3":7}'
                    >
                        7
                    </td>
                </tr>
                <tr style="height:21px;">
                    <td style="border-right:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;" data-sheets-value='{"1":3,"3":3}'>
                        3
                    </td>
                    <td
                        style="border-right:1px solid #000000;border-bottom:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;"
                        data-sheets-value='{"1":3,"3":8}'
                    >
                        8
                    </td>
                    <td
                        style="border-right:1px solid #000000;border-bottom:1px solid #000000;overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;text-align:right;"
                        data-sheets-value='{"1":3,"3":9}'
                    >
                        9
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>
```

## MSO
