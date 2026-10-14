from django.urls import re_path, path
from . import consumers
from . import views

websocket_urlpatterns = [
    path("ws/chat/", consumers.ChatConsumer.as_asgi()),
    path("ws/notifications/", consumers.NotificationConsumer.as_asgi()),
]

urlpatterns = [
    path("get_personal_chat_id", views.createIndividualChat),
    path("create_group", views.createGroup),
    path("chat_lobby", views.chatLobby),
    path("delete_message", views.deleteMessage),
    path("retrieve_all_messages", views.retrieveAllMessages),
    path("report_message", views.reportMessage),
    path("retrieve_reported_messages", views.retrieveReportedMessages),
    path("finalize_report", views.finalizeReport),
    path("upload_chat_media", views.uploadChatMedia),
]
