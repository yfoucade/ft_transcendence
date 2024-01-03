function hydrate_common_elements() {
    console.log("hydrating common elements");
    let links = document.querySelectorAll("a");
    for ( let link of links )
        link.addEventListener( "click", route );
}

function hydrate( recipe )
{
    if ( !recipe )
        return ;
    for ( let event of recipe )
        for ( let id of event )
            document.getElementById( id ).addEventListener( event, event.id );
}

