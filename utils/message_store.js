// signup message 
su_msg = ( Name ) => {
    let message = 'Hi ' + Name + ', your request to join Finisher network has been recieved, we will notify you once your profile is approved';
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

 module.exports = {
    signup_message : su_msg,
    phone_verification_message : pv_msg,
    profile_verification_message : pro_ver_msg,
 };


