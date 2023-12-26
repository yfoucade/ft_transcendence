let fetch_link = document.querySelector( ".fetch-and-replace" );
fetch_link.addEventListener( "click", fetch_handler );

let parser = new DOMParser();

// function handle_response( response )
// {
//     return response.text;
// }

async function fetch_handler( event )
{
    event.preventDefault();
    let link_target = event.currentTarget.getAttribute( "href" );
    // let fetch_response = fetch( link_target );
    let response = await fetch( "http://localhost:8000/test_ssr/view_b" );
    let text = await response.text();
    // let blob = await response.blob();
    // console.log( blob );
    // let tmp_url = URL.createObjectURL(blob);
    // location.replace( tmp_url );
    let html_document = parser.parseFromString( text, "text/html" );
    // console.log( html_document );
    document.replaceChildren();
    document.replaceChildren( html_document.documentElement );
    // document.replaceChild( html_document, document.documentElement );
}
