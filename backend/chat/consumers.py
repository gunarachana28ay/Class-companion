import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from urllib.parse import parse_qs
from .models import ChatMessage, ChatGroup, User
from django.core.exceptions import ValidationError


def mark_as_read(user_id, chat_id):
    user = User.objects.filter(id=user_id).first()
    messages = ChatMessage.objects.filter(chat_id=chat_id).all()
    for message in messages:
        if user not in set(message.read_by.all()):
            message.read_by.add(user)


def retrieveAllMessages(chat_id):
    try:
        chat_group = ChatGroup.objects.get(chat_id=chat_id)
    except Exception:
        pass

    items = ChatMessage.objects.filter(
        chat_id=chat_group,
        isBlocked=False,
    ).order_by("time")

    items_list = []
    for item in items:
        items_list.append(
            {
                "id": item.message_id,
                "username": item.sender.username,
                "time": item.time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "message": item.message,
                "read_by": list(item.read_by.values_list("id", flat=True)),
                "delivered_to": list(item.delivered_to.values_list("id", flat=True)),
            }
        )
    return items_list


def create_nudge(chat_group_users):
    from channels.layers import get_channel_layer

    channel_layer = get_channel_layer()

    for chat_group_user in chat_group_users:
        async_to_sync(channel_layer.group_send)(
            f"notification_counter_{chat_group_user.id}",
            {
                "type": "receive",
                "message": "update",
            },
        )


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        self.chat_id = query_params.get("chat_id", ["general"])[0]
        self.room_group_name = self.chat_id
        self.user_id = query_params.get("user_id", None)[0]
        if self.user_id is None:
            return

        mark_as_read(self.user_id, self.chat_id)

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {"type": "chat_message", "message": "unchanged"},
        )

        self.chat_group = ChatGroup.objects.get(chat_id=self.room_group_name)
        self.chat_group_users = self.chat_group.users.all()

        create_nudge(self.chat_group_users)

    def receive(self, text_data):
        prev_all_messages = retrieveAllMessages(self.chat_id)
        if isinstance(text_data, dict):
            txt_data_json = text_data
        else:
            txt_data_json = json.loads(text_data)
        task = txt_data_json.get("task")

        if task != "status_update":
            msg = txt_data_json.get("message")
            sender_id = txt_data_json.get("sender_id")

            sender = User.objects.get(id=sender_id)

            if sender not in self.chat_group_users:
                return
            new_message = ChatMessage.objects.create(
                chat_id=self.chat_group,
                sender=sender,
                message=msg,
            )
            new_message.read_by.set([sender])
            new_message.delivered_to.set([sender])

        else:
            user_id = txt_data_json.get("user_id")
            chat_id = txt_data_json.get("chat_id")
            mark_as_read(user_id, chat_id)

        if retrieveAllMessages(self.chat_id) == prev_all_messages:
            status = "unchanged"
        else:
            status = "updated"
            create_nudge(self.chat_group_users)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": status,
            },
        )

    def chat_message(self, event):
        msg = event["message"]
        self.send(
            text_data=json.dumps(
                {
                    "type": "chat",
                    "message": retrieveAllMessages(self.chat_id),
                    "status": msg,
                }
            )
        )


class NotificationConsumer(WebsocketConsumer):
    def connect(self):
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        self.user_id = query_params.get("user_id")[0]
        if self.user_id is None:
            return
        self.room_group_name = f"notification_counter_{self.user_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()
        self.receive('hello')

    def receive(self, text_data):
        print("here")
        print(text_data)
        count = 0

        user = User.objects.filter(id=self.user_id).first()
        all_chat_groups = ChatGroup.objects.all()

        for chat_group in all_chat_groups:
            if user in set(chat_group.users.all()):
                last_message = (
                    ChatMessage.objects.filter(chat_id=chat_group.chat_id)
                    .order_by("-time")
                    .first()
                )
                print(user.id)
                print([i.id for i in last_message.read_by.all()])
                if user not in set(last_message.read_by.all()):
                    count += 1

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "nudge",
                "message": count,
            },
        )

    def nudge(self, event):
        msg = event["message"]

        self.send(
            text_data=json.dumps(
                {
                    "type": "nudge",
                    "message": msg,
                }
            )
        )
