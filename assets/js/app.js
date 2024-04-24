// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "../vendor/topbar";

let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;

let socket = new Socket("/socket", {});
socket.connect();
window.socket = socket;

function new_channel(subtopic, screen_name) {
  return socket.channel(`game:${subtopic}`, {
    screen_name: screen_name,
  });
}
window.new_channel = new_channel;

function join(channel) {
  channel
    .join()
    .receive("ok", (response) => console.log("Joined successfully!", response))
    .receive("error", (response) => console.log("Unable to join!", response));
}

window.join = join;

function leave(channel) {
  channel
    .leave()
    .receive("ok", (response) => console.log("Left successfully!", response))
    .receive("error", (response) => console.log("Unable to leave!", response));
}

window.leave = leave;

function new_game(channel) {
  channel
    .push("new_game")
    .receive("ok", (response) => console.log("New game!", response))
    .receive("error", (response) =>
      console.log("Unable to start new game!", response)
    );
}

window.new_game = new_game;

function add_player(channel, player) {
  channel
    .push("add_player", player)
    .receive("error", (response) =>
      console.log("Unable to add new player!", response)
    );
}

window.add_player = add_player;