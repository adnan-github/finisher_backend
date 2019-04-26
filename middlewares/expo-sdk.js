let expo_sdk = require('expo-server-sdk');

let expo = expo_sdk();
let messages = [];

for ( let pushToken of pushTokensArray ) {
    if ( !expo_sdk.Expo.isExpoPushToken(pushToken)){
        console.error(`push toekn ${pushToken} is not a valid expo push notification token`);
        continue;
    }
    messages.push({ 
         to     : pushToken,
         sound  : 'default',
         body   : 'this is a test push notification',
         data: { withSome: 'data'}
    })
}

let