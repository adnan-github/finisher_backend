// signup message to provider
provider_su_msg = ( Name ) => {
    let message = 'Hello ' + Name + ', your request to join Finisher network has been recieved, you will be notified once your profile is approved';
    return message;
};
// phone verification message 
pv_msg = ( phone_code ) => {
    let message = 'Finisher Home Services\nhttps://www.finisher.pk\n\n Thank you for signing up, your phone verification code is ' + phone_code;
    return message;
};
// profile verified message
pro_ver_msg = ( Name ) => {
    let message = 'Congratulations ' + Name + ', your profile has been approved. Please login into your Finisher account to start providing services';
    return message;
};

// customer signup message
customer_su_msg = ( Name ) => {
    let message = 'Hello ' + Name + ', thank you for joining Finisher Network, login to your account to get the best services ';
    return message;
};

 module.exports = {
    signup_message                  : provider_su_msg,
    phone_verification_message      : pv_msg,
    profile_verification_message    : pro_ver_msg,
    customer_signup_message         : customer_su_msg 
 };


