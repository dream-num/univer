const http = require('http');

export function post(action: string, send: object, callback: any) {
    const data = JSON.stringify(send);
    const options = {
        hostname: 'http://127.0.0.1:3998',
        port: '', // do not set 8080
        path: action,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        },
    };

    const req = http.request(options, (res: any) => {
        // A post variable is defined to temporarily store the information of the request body
        let body = '';
        res.setEncoding('utf8');
        // Through the data event monitoring function of res, whenever the data of the request body is received, it is added to the post variable
        res.on('data', (chunk: any) => {
            body += chunk;
        });
        // After the end event of res is triggered, the post is parsed into a real POST request format through JSON.parse, and then the passed callback function is called to process the data
        res.on('end', () => {
            const json = JSON.parse(body);

            callback(json);
        });
    });
    req.on('error', (e: any) => {
        console.log(`problem with request: ${e.message}`);
    });
    req.write(data);
    req.end();
}
