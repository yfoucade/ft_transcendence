// function update_main( old_main, new_main ) {
//     console.log("updating main\n");
//     old_main.classList.replace( "shown", "hidden" );
//     console.log(`new_main.classList = ${new_main.classList}`)
//     new_main.classList.replace( "hidden", "shown" );
// }

// function get_target_main( main_menu_event_target )
// {
//     target_main_id = main_menu_event_target.getAttribute("data-target-main-id");
//     return document.getElementById(target_main_id);
// }

// function init_handlers() {
//     nav_home = document.getElementById("nav-home");
//     nav_home.addEventListener("click", (event) => { update_main( document.querySelector(".shown"), get_target_main(event.target)); });
//     nav_play = document.getElementById("nav-play");
//     nav_play.addEventListener("click", (event) => { update_main( document.querySelector(".shown"), get_target_main(event.target)); });
// }

function main()
{
    init_navigation_listeners();
}

main();
