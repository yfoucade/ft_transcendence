function hydrate_common_elements() {
    console.log("hydrating common elements");
    let links = document.querySelectorAll("#main-navbar a");
    for ( let link of links )
        link.addEventListener( "click", route );

    let lang_form = document.getElementById("lang-form");
    lang_form.addEventListener( "submit", submit_form );
	startBackground();
}

function hydrate( recipe )
{
    if ( !recipe )
        return ;
    for ( let event of recipe )
        for ( let id of event )
            document.getElementById( id ).addEventListener( event, event.id );
}

