from typing import List

from tictactoe.entities.match import Match
from tictactoe.entities.player import Player
from tictactoe.repositories.match import MatchRepository
from tictactoe.repositories.player import PlayerRepository


class MemoryMatchRepository(MatchRepository):
    __memory__ = dict()

    async def get_by_id(self, match_id) -> Match:
        return MemoryMatchRepository.__memory__.get(match_id)

    async def save(self, match: Match):
        MemoryMatchRepository.__memory__[match.id] = match

    async def all(self) -> List[Match]:
        return list(
            MemoryMatchRepository.__memory__.values()
        )

    async def all_waiting(self) -> List[Match]:
        return [m for m in MemoryMatchRepository.__memory__.values() if not m.is_ready()]

    async def join(self, match: Match, player: Player):
        await match.join(player)
        await self.save(match)
        return match


class MemoryPlayerRepository(PlayerRepository):
    __memory__ = dict()

    async def get_by_id(self, user_id) -> Player:
        return MemoryPlayerRepository.__memory__.get(user_id)

    async def save(self, user: Player):
        MemoryPlayerRepository.__memory__[user.id] = user

    async def all(self) -> List[Player]:
        return list(
            MemoryPlayerRepository.__memory__.values()
        )
