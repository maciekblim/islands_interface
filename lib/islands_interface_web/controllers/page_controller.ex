defmodule IslandsInterfaceWeb.PageController do
  alias IslandsEngine.GameSupervisor
  use IslandsInterfaceWeb, :controller

  def home(conn, _params) do
    # TODO move it into engine
    ongoing_games = :ets.tab2list(:game_state)
    render(conn, :home, layout: false, games: ongoing_games)
  end

  def test(conn, %{"name" => name}) do
    {:ok, _pid} = GameSupervisor.start_game(name)
    redirect(conn, to: "/")
  end
end
