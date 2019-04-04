
const https         = require('https');
const queryString   = require('query-string');

// send sms to provided Number
sendSMS = ( toNumber, toMessage ) => {
    console.log(' -- ', toNumber, toMessage)
    return new Promise(( resolve, reject ) => {

        // creating request body to send SMS
        const requestPath = '/api/sendsms.php?id=' + process.env.finisher_id + 
                            '&key=' + process.env.finisher_key + '&' +
                            queryString.stringify({ msg: toMessage}) +
                            '&to=' + toNumber +
                            '&mask=' + process.env.finisher_mask;

        const post_options = {
            hostname    : 'brandedsms.pk',
            path        : requestPath,
            method      : 'POST'
        };

        const request = https.request( post_options, (res) => {
            var str = '';
            res.setEncoding('utf8');
            res.on('data', ( response ) => {
                console.log('Response: ' + response);
                str += response;
            });
            res.on('end',() => {
                obj = JSON.parse(str);
                resolve(obj);
            }); 
            res.on('error', (error) => {
                console.log('error', error);
            })
        });

        request.write('hi');
        request.end();
    });
};

module.exports = {
    sendSMSToPhone: sendSMS
};