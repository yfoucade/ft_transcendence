async function submit_edit_profile_form(event)
{
    event.preventDefault();
    let form = document.getElementById("edit-profile-form");
    let form_data = new FormData( form );

    let response = await fetch(
        form.action,
        {
            method: form.method,
            enctype: form.enctype,
            body: form_data,
        }
    );
    update_view( response );
}