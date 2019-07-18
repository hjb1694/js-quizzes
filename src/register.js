const validator = require('validator');


document.querySelector('#subbut').addEventListener('click', e => {
    e.preventDefault();

    let errs = 0;
    let errMsgs = [];
    let errBox = document.querySelector('.errbox');
    errBox.innerHTML = '';

    const fields = {
        email : document.querySelector('#email').value.trim(),
        pass : document.querySelector('#pass').value,
        confirmpass : document.querySelector('#confirmpass').value
    }

    const addError = msg => {
        errs++;
        errMsgs.push(`<p>${msg}</p>`);
    }

    const passRegs = {
        caps : /[A-Z]/,
        lwrcase : /[a-z]/,
        specialChar : /[&$#-+!_?*]/
    }

    !validator.isEmail(fields.email) ? addError('Please enter a valid email address.') : null;
    if(fields.pass.length < 8){
        addError('Passwords must be at least 8 characters in length.');
    }
    if(!passRegs.caps.test(fields.pass)){
        addError('Passwords must contain at least one capital letter.');
    }
    if(!passRegs.lwrcase.test(fields.pass)){
        addError('Passwords must contain at least one lowercase letter.');
    }
    if(!passRegs.specialChar.test(fields.pass)){
        addError('Passwords must have one of the following special characters: &S#-+!_?*');
    }
    if(fields.pass !== fields.confirmpass){
        addError('Confirm password does not match password.');
    }

    if(errs){
        for(errMsg of errMsgs){
            errBox.insertAdjacentHTML('beforeend',errMsg);
        }
    }else{
        

        fetch('http://localhost:3001/user/register',{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            }, 
            body : JSON.stringify(fields)
        })
        .then(result => {

            if(!result.ok){
                throw new Error();
            }


            return result.json();
        })
        .then(result => {
            if(result.errors){
                errBox.innerHTML = result.errors;
            } else if(result.success){
                window.location.href = 'http://localhost:3001/user/subscribe';
            }
        })
        .catch(e => errBox.innerHTML = '<p>There was an issue processing your request. Please try again.</p>');



    }
   




});
