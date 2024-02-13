window.addEventListener( "popstate", pop_state_event_handler );
window.onload = dispatchEvent( new PopStateEvent("popstate") );
console.log(history.state);
/*
http://localhost:8000
*/