async function logout( event )
{
    event.preventDefault();

    let form = document.getElementById("logout-form");
    let form_data = new FormData(form);
    
    let response = await fetch( form.action,
        {
            method: form.method,
            body: form_data,
        }
    );
    update_view( response );
}