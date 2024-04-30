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

function position_island(channel, player, island, row, col) {
  channel
    .push("position_island", {
      player,
      island,
      row,
      col,
    })
    .receive("ok", (response) => console.log("Island positioned!", response))
    .receive("error", (response) =>
      console.log("Unable to position insland!", response)
    );
}

window.position_island = position_island;

function set_islands(channel, player) {
  channel
    .push("set_islands", player)
    .receive("ok", (response) => {
      console.log("Here is the board:");
      console.dir(response.board);
    })
    .receive("error", (response) =>
      console.log("Unable to set islands for:", player, response)
    );
}

window.set_islands = set_islands;

function guess_coordinate(channel, player, row, col) {
  channel
    .push("position_island", { player, row, col })
    .receive("error", (response) =>
      console.log("Unable to guess coordinate!", player, response)
    );
}

window.guess_coordinate = guess_coordinate;

window.setup1 = function setup1(name, player) {
  game_channel = new_channel("moon", name);
  join(game_channel);
  game_channel.push("show_subscribers");
  if (player === "player1") {
    new_game(game_channel);
    game_channel.on("player_added", console.log);
  } else {
    game_channel.on("player_added", console.log);
    add_player(game_channel, name);
  }
};

window.setup2 = function setup2(game_channel, player) {
  position_island(game_channel, player, "dot", 1, 1);
  position_island(game_channel, player, "atoll", 1, 3);
  position_island(game_channel, player, "l_shape", 1, 8);
  position_island(game_channel, player, "s_shape", 4, 3);
  position_island(game_channel, player, "s_shape", 6, 3);
  position_island(game_channel, player, "square", 5, 7);
};

function attach_events(channel) {
  channel.on("player_added", (response) => console.log(response.message));

  channel.on("player_set_islands", (response) =>
    console.log("Player set islands: ", response.player)
  );

  channel.on("player_guessed_coordinate", (response) =>
    console.log("Player guessed coordinate: ", response.result)
  );

  channel.on("subscribers", (response) =>
    console.log("These players have joined: ", response)
  );
}

window.attach_events = attach_events;
