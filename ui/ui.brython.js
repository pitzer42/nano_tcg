__BRYTHON__.use_VFS = true;
var scripts = {"$timestamp": 1591063498220, "ui": [".py", "from browser import document,console\n\nfrom ui.components.board import BoardView\nfrom ui.components.deck import DeckView\nfrom ui.components.login import LoginView\nfrom ui.components.match import MatchView\nfrom ui.components.mulligan import MulliganView\nfrom ui.components.play import PlayView\nfrom ui.components.wait import WaitView\nfrom ui.events import WSEvents\n\n\n\nSERVER_ADDRESS='wss://8080-bc8a2ac2-98c4-4df7-8481-7668f5d64b67.ws-us02.gitpod.io/ws'\n\n\ndef send_name(*args,**kwargs):\n login_component.hide()\n name=login_component.get_name()\n ws.send(name)\n \n \nlogin_component=LoginView(document)\nlogin_component.set_action(send_name)\n\n\ndef send_deck(*args,**kwargs):\n deck_component.hide()\n deck=deck_component.get_deck()\n ws.send(deck)\n ws.send('end_deck')\n \n \ndeck_component=DeckView(document)\ndeck_component.set_action(send_deck)\n\n\ndef send_match(*args,**kwargs):\n match_component.hide()\n match=match_component.get_match()\n ws.send(match)\n \n \ndef send_match_password(*args,**kwargs):\n password=match_component.get_password()\n ws.send(password)\n \n \nmatch_component=MatchView(document)\nmatch_component.set_ok_action(send_match)\n\nwait_component=WaitView(document)\n\n\ndef send_mulligan(*args,**kwargs):\n mulligan_component.hide()\n wait_component.show()\n ws.send('yes')\n \n \ndef send_keep(*args,**kwargs):\n mulligan_component.hide()\n wait_component.show()\n ws.send('no')\n \n \ndef show_mulligan_component(hand):\n wait_component.hide()\n mulligan_component.show(hand)\n \n \nmulligan_component=MulliganView(document)\nmulligan_component.set_mulligan_action(send_mulligan)\nmulligan_component.set_keep_action(send_keep)\n\n\ndef set_hand(hand):\n wait_component.hide()\n board_view.set_board(hand)\n \n \nboard_view=BoardView(document)\n\n\ndef show_board(cards):\n board_view.set_board(cards)\n board_view.show()\n \n \nplayView=PlayView(document)\n\n\ndef play_dialog(options):\n wait_component.hide()\n playView.set_options(options)\n \n def on_choice(index):\n  message=str(index)\n  ws.send(message)\n  playView.hide()\n  \n def end_turn(event):\n  message='-1'\n  ws.send(message)\n  playView.hide()\n  console.log(event)\n  \n playView.on_pass=end_turn\n playView.on_choice=on_choice\n playView.show()\n \n \nevents=WSEvents(SERVER_ADDRESS)\n\nevents.on('request_name',login_component.show)\nevents.on('request_deck',deck_component.show)\nevents.on('request_match',match_component.show)\nevents.on('request_match_password',send_match_password)\nevents.on('waiting_other_players',wait_component.show)\nevents.on('mulligan',show_mulligan_component)\nevents.on('start',console.log)\nevents.on('request_play',play_dialog)\nevents.on('set_board',show_board)\n\nws=events._ws\n", ["browser", "ui.components.board", "ui.components.deck", "ui.components.login", "ui.components.match", "ui.components.mulligan", "ui.components.play", "ui.components.wait", "ui.events"], 1], "ui.events": [".py", "from browser import console\nfrom browser.websocket import WebSocket\n\nCOMMAND_ARGS_SEPARATOR=' '\n\n\nclass WSEvents:\n\n def __init__(self,address):\n  self._ws=WebSocket(address)\n  self._ws.bind(\n  'message',\n  self.dispatch)\n  self._events=dict()\n  \n def on(self,event,action):\n  actions=self._events.get(event)\n  if actions is None :\n   actions=list()\n   self._events[event]=actions\n  actions.append(action)\n  \n def dispatch(self,event):\n \n  console.log(event.data)\n  \n  command,args=self.parse(event.data)\n  actions=self._events.get(command)\n  if actions:\n   if args:\n    for action in actions:\n     action(args)\n   else :\n    for action in actions:\n     action()\n     \n def parse(self,message:str)->tuple:\n  try :\n   split_index=message.index(COMMAND_ARGS_SEPARATOR)\n   command=message[:split_index]\n   args=message[split_index+1:]\n  except ValueError:\n   command=message\n   args=None\n  return command,args\n", ["browser", "browser.websocket"]], "ui.scryfall": [".py", "from browser import ajax\n\n\ndef get_images_url(card:str,on_result):\n\n def parse(response):\n  start=response.text.index('small')\n  start +=len('small')+3\n  end=response.text.index(',',start)\n  end -=1\n  image_url=response.text[start:end]\n  on_result(image_url)\n  \n request=ajax.Ajax()\n request.bind('complete',parse)\n request.open(\n 'GET',\n 'https://api.scryfall.com/cards/named?exact='+card.replace(' ','+')\n )\n request.send()\n", ["browser"]], "ui.components": [".py", "class Component:\n root='ViewRoot'\n \n def __init__(self,document,template_id=None ):\n  if template_id is None :\n   template_id=type(self).__name__+Component.__name__\n  self._document=document\n  template=document[template_id]\n  clone=template.content.cloneNode(True )\n  root=document[Component.root]\n  root.appendChild(clone)\n  self._element=document[type(self).__name__]\n  self._default_display_style=self._element.style.display\n  self.hide()\n  \n def hide(self):\n  self._element.style.display='none'\n  \n def show(self):\n  self._element.style.display=self._default_display_style\n  self._element.focus()\n", [], 1], "ui.components.match": [".py", "from ui.components import Component\n\n\nclass MatchView(Component):\n id_input='matchInput'\n _match_password_input='matchPasswordInput'\n _match_buton='matchButton'\n \n def __init__(self,document):\n  super(MatchView,self).__init__(document)\n  self._id_input=document[MatchView.id_input]\n  self._password_input=document[MatchView._match_password_input]\n  self._ok=document[MatchView._match_buton]\n  self._first_try=True\n  \n def get_match(self):\n  return self._id_input.value\n  \n def get_password(self):\n  return self._password_input.value\n  \n def set_ok_action(self,action):\n  self._ok.bind(\n  'click',\n  action\n  )\n  \n def show(self):\n  super(MatchView,self).show()\n  if not self._first_try:\n   self._id_input.classList.add('is-danger')\n   self._id_input.classList.add('is-outlined')\n  self._first_try=False\n  self._id_input.value=''\n  self._password_input.value=''\n  self._id_input.focus()\n", ["ui.components"]], "ui.components.login": [".py", "from ui.components import Component\n\n\nclass LoginView(Component):\n name_input='nameInput'\n login_button='loginButton'\n \n def __init__(self,document):\n  super(LoginView,self).__init__(document)\n  self.name_input=document[LoginView.name_input]\n  self.login_button=document[LoginView.login_button]\n  self._first_try=True\n  \n def get_name(self):\n  return self.name_input.value\n  \n def set_action(self,action):\n  self.login_button.bind(\n  'click',\n  action\n  )\n  \n def show(self):\n  super(LoginView,self).show()\n  if not self._first_try:\n   self.name_input.classList.add('is-danger')\n   self.name_input.classList.add('is-outlined')\n  self._first_try=False\n  self.name_input.value=''\n  self.name_input.focus()\n", ["ui.components"]], "ui.components.board": [".py", "import json\n\nfrom ui.components import Component\nfrom ui.scryfall import get_images_url\n\n\nclass BoardView(Component):\n board_container='boardContainer'\n \n def __init__(self,document):\n  super(BoardView,self).__init__(document)\n  self._board_container=document[BoardView.board_container]\n  \n def set_board(self,cards):\n  self._board_container.innerHTML=''\n  cards=json.loads(cards)\n  \n  def display_option(image_url):\n   img=self._document.createElement('img')\n   img.src=image_url\n   self._board_container.appendChild(img)\n   \n  for card in cards:\n   get_images_url(\n   card,\n   display_option\n   )\n   \n  super(BoardView,self).show()\n", ["json", "ui.components", "ui.scryfall"]], "ui.components.deck": [".py", "from ui.components import Component\n\n\nclass DeckView(Component):\n _deck_input='deckInput'\n _deck_end_button='deckEndButton'\n \n def __init__(self,document):\n  super(DeckView,self).__init__(document)\n  self._input=document[DeckView._deck_input]\n  self._ok=document[DeckView._deck_end_button]\n  self._input.value=\"30 Serra Angel\\n30 Plains\"\n  \n def get_deck(self):\n  return self._input.value\n  \n def set_action(self,action):\n  self._ok.bind(\n  'click',\n  action\n  )\n  \n def reset(self):\n  self._input.value=''\n  \n def show(self):\n  super(DeckView,self).show()\n  self._input.focus()\n", ["ui.components"]], "ui.components.play": [".py", "import json\nfrom functools import partial\n\nfrom ui.components import Component\nfrom ui.scryfall import get_images_url\n\n\nclass PlayView(Component):\n hand_container='handContainer'\n pass_button='passButton'\n \n def __init__(self,document):\n  super(PlayView,self).__init__(document)\n  self.on_choice=lambda :None\n  self.on_pass=lambda :None\n  self._hand_container=document[PlayView.hand_container]\n  self._pass_button=document[PlayView.pass_button]\n  self._pass_button.onclick=self.bridge\n  \n def bridge(self,event):\n  self.on_pass(event)\n  \n def set_options(self,options):\n  self._hand_container.innerHTML=''\n  options=json.loads(options)\n  \n  def display_option(option_i,image_url):\n   img=self._document.createElement('img')\n   img.src=image_url\n   self._hand_container.appendChild(img)\n   img.onclick=lambda *args:self.on_choice(option_i)\n   \n  n_options=len(options)\n  for i in range(n_options):\n   option=options[i]\n   get_images_url(\n   option,\n   partial(display_option,i)\n   )\n", ["functools", "json", "ui.components", "ui.scryfall"]], "ui.components.wait": [".py", "from ui.components import Component\n\n\nclass WaitView(Component):\n\n def __init__(self,document):\n  super(WaitView,self).__init__(document)\n", ["ui.components"]], "ui.components.mulligan": [".py", "import json\n\nfrom ui.components import Component\nfrom ui.scryfall import get_images_url\n\n\nclass MulliganView(Component):\n wait_container='mulliganContainer'\n keep_button='\u1e31eepButton'\n mulligan_button='mulliganButton'\n cards_mulligan_container='cardsMulliganContainer'\n \n def __init__(self,document):\n  super(MulliganView,self).__init__(document)\n  self._keep_button=document[MulliganView.keep_button]\n  self._mulligan_button=document[MulliganView.mulligan_button]\n  \n def set_keep_action(self,action):\n  self._keep_button.bind('click',action)\n  \n def set_mulligan_action(self,action):\n  self._mulligan_button.bind('click',action)\n  \n def show(self,cards:str):\n  def display_image(image_url):\n   img=self._document.createElement('img')\n   img.src=image_url\n   image_container.appendChild(img)\n   \n  image_container=self._document[MulliganView.cards_mulligan_container]\n  image_container.innerHTML=''\n  self._element.appendChild(image_container)\n  cards=json.loads(cards)\n  \n  for card in cards:\n   get_images_url(card,display_image)\n   \n  super(MulliganView,self).show()\n", ["json", "ui.components", "ui.scryfall"]]}
__BRYTHON__.update_VFS(scripts)
