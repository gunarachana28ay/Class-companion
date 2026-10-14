import uuid
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage, ChatGroup, User
from user_management.models import Multimedia
from django.core.files.storage import default_storage


@api_view(["GET"])
def createIndividualChat(request):
    user1 = request.GET.get("user1", None)
    user2 = request.GET.get("user2", None)

    users = User.objects.filter(id__in=[user1, user2])
    if len(users) != 2:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid userid provided.",
            },
            status=400,
        )

    all_chat_groups = ChatGroup.objects.filter(chat_type="personal")

    for chat_group in all_chat_groups:
        if set(chat_group.users.all()) == set(users):
            return JsonResponse(
                {
                    "status": "success",
                    "data": {"id": chat_group.chat_id},
                },
                status=200,
            )

    chat_group = ChatGroup.objects.create(chat_type="personal")
    chat_group.users.set(users)

    return JsonResponse(
        {
            "status": "success",
            "data": {"id": chat_group.chat_id},
        },
        status=201,
    )


# CREDIT: Samman Adhikari (fdai8002)
@api_view(["POST"])
def createGroup(request):
    group_name = request.data.get("group_name", "Group")
    picture = request.data.get("picture", None)
    user_ids = request.data.get("userids", [])

    if user_ids == []:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid userid.",
            },
            status=400,
        )

    users = User.objects.filter(id__in=user_ids)
    if len(users) != len(user_ids):
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid userid.",
            },
            status=400,
        )

    chat_group = ChatGroup.objects.create(
        chat_type="group",
        name=group_name,
        picture=picture,
    )
    chat_group.users.set(users)

    return JsonResponse(
        {
            "status": "success",
            "data": {
                "group_name": chat_group.name,
                "picture": chat_group.picture,
                "id": chat_group.chat_id,
            },
        },
        status=201,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def uploadChatMedia(request):
    media_file = request.FILES.get("media")

    if not media_file:

        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid file provided.",
            },
            status=400,
        )

    media_file_name = f"{uuid.uuid4()}_{media_file.name}"

    # Save file to S3 and get the URLs
    media_file_path = default_storage.save(media_file_name, media_file)
    media_file_url = default_storage.url(media_file_path)

    return JsonResponse(
        {
            "status": "success",
            "data": {"url": media_file_url},
        }
    )


# CREDIT: Samman Adhikari (fdai8002)
@api_view(["GET"])
def chatLobby(request):
    token = request.headers.get("Authorization").split(" ")[1]
    validated_token = JWTAuthentication().get_validated_token(token)
    user_id = validated_token.get("user_id")

    user = User.objects.filter(id=user_id).first()
    all_chat_groups = ChatGroup.objects.all()

    response = []

    for chat_group in all_chat_groups:
        if user in set(chat_group.users.all()):
            id = chat_group.chat_id
            chat_type = chat_group.chat_type

            if chat_type == "personal":
                sender = chat_group.users.exclude(id=user.id).first()
                name = sender.username
                try:
                    picture = Multimedia.objects.get(
                        user=sender, media_type="profile_picture"
                    ).file_path
                except Exception:
                    picture = None
            elif chat_type == "group":
                name = chat_group.name
                picture = chat_group.picture

            last_message_obj = (
                ChatMessage.objects.filter(chat_id=id).order_by("-time").first()
            )
            if last_message_obj:
                last_message = last_message_obj.message
                last_message_sent_at = last_message_obj.time
                has_read = set(last_message_obj.read_by.all()) == set(
                    chat_group.users.all()
                )

            else:
                last_message = None
                last_message_sent_at = None

            response.append(
                {
                    "id": id,
                    "chat_type": chat_type,
                    "name": name,
                    "picture": picture,
                    "last_message": last_message,
                    "last_message_sent_at": last_message_sent_at,
                    "has_read": has_read,
                }
            )

    return JsonResponse(
        {
            "status": "success",
            "data": response,
        },
        status=200,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def retrieveAllMessages(request):
    current_user = User.objects.filter(id=request.user.id).first()
    query = request.GET.get("chat_id", None)

    if query is None:
        return JsonResponse(
            {
                "status": "failed",
                "message": "chat_id does not exist.",
            },
            status=400,
        )

    try:
        chat_group = ChatGroup.objects.get(chat_id=query)
    except ChatGroup.DoesNotExist:
        return JsonResponse(
            {
                "status": "failed",
                "message": "chat_id does not exist.",
            },
            status=400,
        )

    items = ChatMessage.objects.filter(
        chat_id=chat_group,
        isBlocked=False,
    ).order_by("time")

    items_list = []
    for item in items:
        item.read_by.add(current_user)
        item.delivered_to.add(current_user)
        items_list.append(
            {
                "id": item.message_id,
                "username": item.sender.username,
                "time": item.time,
                "message": item.message,
                "read_by": list(item.read_by.values_list("id", flat=True)),
                "delivered_to": list(item.delivered_to.values_list("id", flat=True)),
            }
        )

    # Update notifications for the current user
    channel_layer = get_channel_layer()

    # Trigger the notification to be sent to the WebSocket group
    async_to_sync(channel_layer.group_send)(
        f"notification_counter_{current_user.id}",
        {
            "type": "receive",
            "message": "update",
        },
    )

    return JsonResponse(
        {
            "status": "success",
            "data": items_list,
        },
        status=200,
    )


@api_view(["POST"])
def deleteMessage(request):
    message_id = request.data.get("id")

    try:
        message_obj = ChatMessage.objects.get(message_id=message_id)
        chat_id = message_obj.chat_id.chat_id
        message_obj.delete()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"{chat_id}",
            {
                "type": "receive",
                "task": "status_update",
            },
        )

    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid message id.",
            },
            status=400,
        )

    return JsonResponse(
        {
            "status": "success",
            "data": {"id": message_id},
        },
        status=200,
    )


@api_view(["POST"])
def reportMessage(request):
    message_id = request.data.get("id")

    try:
        message_obj = ChatMessage.objects.get(message_id=message_id)
        message_obj.isReported = True
        message_obj.save()
    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid message id.",
            },
            status=400,
        )

    return JsonResponse(
        {
            "status": "success",
            "data": {"id": message_id},
        },
        status=200,
    )


@api_view(["GET"])
def retrieveReportedMessages(request):
    reported_messages = ChatMessage.objects.filter(isReported=True).order_by("time")

    reported_messages = list(
        reported_messages.values(
            "message_id",
            "sender__username",
            "time",
            "message",
        )
    )

    for reported_message in reported_messages:
        reported_message["id"] = reported_message.pop("message_id")
        reported_message["username"] = reported_message.pop("sender__username")

    return JsonResponse(
        {
            "status": "success",
            "data": reported_messages,
        },
        status=200,
    )


@api_view(["PATCH"])
def finalizeReport(request):
    message_id = request.data.get("id")
    status = request.data.get("status")

    try:
        message_obj = ChatMessage.objects.get(message_id=message_id)

    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid message id.",
            },
            status=400,
        )

    if status == "approve":
        message_obj.isReported = True
        message_obj.isBlocked = True
    elif status == "reject":
        message_obj.isReported = False
        message_obj.isBlocked = False

    else:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid status.",
            },
            status=400,
        )

    message_obj.save()

    return JsonResponse(
        {
            "status": "success",
            "data": {"id": message_id, "status": status},
        },
        status=200,
    )
