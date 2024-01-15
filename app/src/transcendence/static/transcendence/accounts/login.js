async function submit_login_form( event )
{
    console.log("submitting form");
    event.preventDefault();

    let form = document.getElementById("login-form");
    let form_data = new FormData();
    let inputs = form.querySelectorAll("input[name]");

    for ( let input of inputs )
        form_data.append( input.name, input.value );

    let response = await fetch( form.action,
                                {
                                    method: form.method,
                                    body: form_data,
                                }
                              );
    update_view( response );
}