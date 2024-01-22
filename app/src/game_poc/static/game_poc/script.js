window.onload = init_game

async function init_game( event )
{
    let response = await fetch( "init_game" );
    response = await response.json();
    console.log(response);
    console.log(`Game id: ${response.game_id}`);
}
