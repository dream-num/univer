const http = require('http');

const server = http.createServer();
server.on('request', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
    );
    res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    if (req.url === '/') {
        const responseBody = {
            index: 1,
        };

        res.statusCode = 200;
        res.write(JSON.stringify(responseBody));
        res.end();
    } else if (req.url.indexOf('/action') === 0 && req.method === 'POST') {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            // buffer => string => object
            const dataStr = Buffer.concat(chunks).toString();
            const data = JSON.parse(JSONize(dataStr));

            const json = {
                message: {
                    actionName: data.actionName,
                },
                code: 0,
            };
            res.statusCode = 200;
            res.write(JSON.stringify(json));
            res.end();
        });
    }
});

server.listen(3998, () => {
    console.log('Node server running on port 3998...');
});

const JSONize = (str) =>
    // https://stackoverflow.com/questions/14432165/uncaught-syntaxerror-unexpected-token-with-json-parse/50730876
    str
        .replace(/\\n/g, '\\n')
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, '\\&')
        .replace(/\\r/g, '\\r')
        .replace(/\\t/g, '\\t')
        .replace(/\\b/g, '\\b')
        .replace(/\\f/g, '\\f')
        // remove non-printable and other non-valid JSON chars
        .replace(/[\u0000-\u0019]+/g, '')

        // https://stackoverflow.com/questions/9036429/convert-object-string-to-json
        // wrap keys without quote with valid double quote
        .replace(/([\w]+)\s*:/g, (_, $1) => `"${$1}":`)
        // replacing single quote wrapped ones to double quote
        .replace(/'([^']+)'/g, (_, $1) => `"${$1}"`)
        // '{ "value": "red",    }' to '{ "value": "red"    }'
        .replace(/,(?=\s*})/g, '');
