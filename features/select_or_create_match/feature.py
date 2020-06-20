from entities.match import Match
from features.select_or_create_match.clients import SelectOrCreateMatchClient
from features.select_or_create_match.repositories import SelectOrCreateMatchRepository, CreateMatchException


class SelectOrCreateMatch:

    def __init__(self,
                 client: SelectOrCreateMatchClient,
                 matches: SelectOrCreateMatchRepository,
                 match_factory):
        self.client = client
        self.matches = matches
        self.match_factory = match_factory

    async def execute(self):
        while True:
            waiting_matches = await self.matches.get_waiting_matches()
            match_id, password = await self.client.request_match_id_and_password(waiting_matches)
            try:
                match = await self.select(match_id, password)
            except WrongMatchPasswordException:

                continue
            if match:
                return match
            match = await self.create(match_id, password)
            if match:
                return match

    async def select(self, match_id, password: str) -> Match:
        match: Match = await self.matches.get_by_id(match_id)
        if match:
            if match.check_password(password):
                return match
            await self.client.alert_wrong_match_password(match)
            raise WrongMatchPasswordException()
        return False

    async def create(self, match_id, password):
        try:
            match = await self.match_factory(
                match_id,
                password
            )
            await self.matches.create_match(match)
            return match
        except CreateMatchException as exception:
            await self.client.alert_match_creation_exception(exception)


class WrongMatchPasswordException(Exception):
    pass
