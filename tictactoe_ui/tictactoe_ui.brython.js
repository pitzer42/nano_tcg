__BRYTHON__.use_VFS = true;
var scripts = {"$timestamp": 1593878105012, "tictactoe_ui.component": [".py", "def remove_children(element):\n for child in element.children:\n  child.remove()\n  \n  \ndef create_table(doc,data_dicts,table=None ,**header_aliases):\n table=table or doc.createElement('table')\n if len(data_dicts)==0 and len(header_aliases)==0:\n  return table\n  \n if len(header_aliases)==0:\n  header_aliases={key:key for key in data_dicts[0].keys()}\n  \n tr=doc.createElement('tr')\n for alias in header_aliases.values():\n  th=doc.createElement('th')\n  th.innerText=alias\n  tr.appendChild(th)\n  \n thead=doc.createElement('thead')\n thead.appendChild(tr)\n \n table.appendChild(thead)\n \n tbody=doc.createElement('tbody')\n for data in data_dicts:\n  tr=doc.createElement('tr')\n  for header in header_aliases.keys():\n   td=doc.createElement('td')\n   td.innerText=data[header]\n   tr.appendChild(td)\n  tbody.appendChild(tr)\n table.appendChild(tbody)\n \n return table\n \n \ndef instantiate_template(document,template_id):\n template=document[template_id]\n instance=template.content.cloneNode(True )\n if instance.firstElementChild.id:\n  instance.firstElementChild.id=f'{instance.firstElementChild.id}_{id(instance)}'\n else :\n  instance.firstElementChild.id=f'{template_id}_{id(instance)}'\n instance_id=instance.firstElementChild.id\n document.body.append(instance)\n return document[instance_id]\n \n \ndef swap_view(to_hide,to_show):\n def _swap_view(*args,**kwargs):\n  to_hide.hide()\n  to_show.show()\n  \n return _swap_view()\n \n \nclass UIComponent:\n\n def __init__(self,document,template_id=None ,parent_id='root'):\n  self.doc=document\n  \n  template_id=template_id or type(self).__name__\n  self.element=instantiate_template(document,template_id)\n  \n  if parent_id in document:\n   parent=document[parent_id]\n  else :\n   parent=document.body\n  parent.appendChild(self.element)\n  \n  if hasattr(type(self),'children'):\n   for child in type(self).children:\n    self.__dict__[child]=self.get_child_element_by_name(child)\n    \n  self._default_style_display=self.element.style.display\n  self.hide()\n  \n def get_child_element_by_name(self,child_name:str):\n  return self.element.querySelector(f'[name={child_name}]')\n  \n def hide(self):\n  self.element.style.display='none'\n  \n def show(self):\n  self.element.style.display=self._default_style_display\n  self.element.focus()\n", []], "tictactoe_ui": [".py", "import json\n\nfrom browser import document,alert\nfrom browser.websocket import WebSocket\n\nfrom tictactoe_ui.component import swap_view\nfrom tictactoe_ui.views.board import BoardView\nfrom tictactoe_ui.views.loading import LoadingView\nfrom tictactoe_ui.views.login import LoginView\nfrom tictactoe_ui.views.match_selector import MatchSelectorView\n\nloading=LoadingView(document)\nloading.show()\n\nlogin=LoginView(document)\n\nmatch_selector=MatchSelectorView(document)\n\nboard=BoardView(document)\n\nws=WebSocket('ws://0.0.0.0:8080/ws')\n\n\ndef on_ws_event(event):\n data=json.loads(event.data)\n print(f'{event}:{data}')\n if 'message'in data:\n  message=data['message']\n  if message =='request_client_id':\n   def send_user_name(user_name):\n    json_response=json.dumps(dict(\n    client_id=user_name\n    ))\n    ws.send(json_response)\n    swap_view(login,loading)\n    \n   login.on_login(send_user_name)\n   swap_view(loading,login)\n  elif message =='alert_unavailable_player_id':\n   login.login_error()\n   swap_view(loading,login)\n  elif message =='request_match_id_and_password':\n   options=data['options']\n   match_selector.display_match_list(options)\n   \n   def join_match(match_id,match_password):\n    json_response=json.dumps(dict(\n    match_id=match_id,\n    password=match_password\n    ))\n    ws.send(json_response)\n    swap_view(match_selector,loading)\n    \n   match_selector.on_join(join_match)\n   swap_view(loading,match_selector)\n  elif message =='sync':\n   board.display(data['match']['board'])\n   board.show()\n   loading.hide()\n  elif message =='request_move':\n   def send_play(index):\n    print(index)\n    print(data['options'][index])\n    json_response=json.dumps(dict(\n    movement_index=index\n    ))\n    ws.send(json_response)\n    \n   board.enable_play(data['options'],send_play)\n   board.show()\n  elif message =='notify_game_over':\n   winner=data['winner']\n   alert(f'{winner} won')\n   \n   \nws.bind('message',on_ws_event)\n", ["browser", "browser.websocket", "json", "tictactoe_ui.component", "tictactoe_ui.views.board", "tictactoe_ui.views.loading", "tictactoe_ui.views.login", "tictactoe_ui.views.match_selector"], 1], "tictactoe_ui.views.loading": [".py", "from tictactoe_ui.component import UIComponent\n\n\nclass LoadingView(UIComponent):\n pass\n", ["tictactoe_ui.component"]], "tictactoe_ui.views.board": [".py", "from tictactoe_ui.component import UIComponent\n\n\nclass BoardView(UIComponent):\n children=[\n 'board_table'\n ]\n \n def display(self,board):\n  self.board_table.innerHTML=''\n  for row in board:\n   tr=self.doc.createElement('tr')\n   for cell in row:\n    td=self.doc.createElement('td')\n    td.innerText=cell\n    tr.appendChild(td)\n   self.board_table.appendChild(tr)\n   \n def enable_play(self,options,on_play):\n  def play_button_callback_factory(index,func):\n   def callback(*args,**kwargs):\n    return func(index)\n    \n   return callback\n   \n  for i,option in enumerate(options):\n   row_index=int(option['row'])\n   row=self.board_table.children[row_index]\n   column_index=int(option['column'])\n   cell=row.children[column_index]\n   cell.innerText=''\n   button=self.doc.createElement('button')\n   button.textContent='*'\n   button.onclick=play_button_callback_factory(i,on_play)\n   cell.appendChild(button)\n   \n def callback_factory(self,index,func):\n  def callback(*args,**kwargs):\n   return func(index)\n   \n  return callback\n", ["tictactoe_ui.component"]], "tictactoe_ui.views": [".py", "", [], 1], "tictactoe_ui.views.login": [".py", "from tictactoe_ui.component import UIComponent\n\n\nclass LoginView(UIComponent):\n children=[\n 'user_name_input',\n 'login_button'\n ]\n \n def on_login(self,action):\n  self.login_button.onclick=lambda _:action(self.user_name_input.value)\n  \n def show(self):\n  super(LoginView,self).show()\n  self.user_name_input.focus()\n  \n def login_error(self):\n  self.user_name_input.classList.add('is-danger')\n  self.user_name_input.classList.add('is-outlined')\n  self.user_name_input.value=''\n  self.user_name_input.focus()\n", ["tictactoe_ui.component"]], "tictactoe_ui.views.match_selector": [".py", "from tictactoe_ui.component import UIComponent,create_table\n\n\nclass MatchSelectorView(UIComponent):\n children=[\n 'match_id_input',\n 'match_password_input',\n 'join_button',\n 'match_table'\n ]\n \n def display_match_list(self,match_list):\n  if len(match_list)>0:\n   create_table(self.doc,match_list,table=self.match_table,id='ID')\n   self.match_table.focus()\n   \n def on_join(self,action):\n  self.join_button.onclick=lambda _:action(\n  self.match_id_input.value,\n  self.match_password_input.value,\n  )\n  \n def show(self):\n  super(MatchSelectorView,self).show()\n  self.match_id_input.focus()\n", ["tictactoe_ui.component"]]}
__BRYTHON__.update_VFS(scripts)
