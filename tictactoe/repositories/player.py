from abc import ABC
from typing import List

from tictactoe.entities.player import Player


class PlayerRepository(ABC):

    async def get_by_id(self, user_id) -> Player:
        raise NotImplementedError()

    async def save(self, user: Player):
        raise NotImplementedError()

    async def all(self) -> List[Player]:
        raise NotImplementedError()