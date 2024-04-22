defmodule IslandsInterfaceWeb.PageController do
  alias IslandsEngine.GameSupervisor
  use IslandsInterfaceWeb, :controller

  def home(conn, _params) do
    render(conn, :home, layout: false, games: IslandsEngine.GamesRepository.find_all_names())
  end

  def test(conn, %{"name" => name}) do
    {:ok, _pid} = GameSupervisor.start_game(name)
    redirect(conn, to: "/")
  end
end
