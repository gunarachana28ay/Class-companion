import json

from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.conf import settings
from .models import User, Multimedia
from .serializers import MultimediaSerializer


@api_view(["GET"])
def get_inactive_users_for_review(request):
    users = User.objects.filter(is_active=False, is_disabled=False)
    users_list = []

    for user in users:
        multimedia = Multimedia.objects.filter(
            user=user, media_type__in=["profile_picture", "cv"]
        )
        profile_picture = multimedia.filter(media_type="profile_picture").first()
        cv = multimedia.filter(media_type="cv").first()

        user_data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "birth_date": user.birth_date,
            "email": user.email,
            "id": user.id,
            "user_type": user.user_type,
            "bio": user.bio,
            "subject": user.subject,
            "experience": user.experience,
            "profile_picture": profile_picture.file_path if profile_picture else None,
            "cv": cv.file_path if cv else None,
        }
        users_list.append(user_data)

    return JsonResponse({"status": "success", "data": users_list}, status=200)


@api_view(["PATCH"])
def activate_user(request):
    user_id = request.data.get("id")
    isApproved = json.loads(request.data.get("isApproved"))
    try:
        user = User.objects.get(id=user_id, is_active=False)
        if isApproved:
            user.is_active = True
            user.is_disabled = False
            multimedia_items = Multimedia.objects.filter(user=user, status="WAITING")
            multimedia_items.update(status="ACTIVE")
        else:
            user.is_disabled = True
        user.save()
        return JsonResponse(
            {"status": "success", "data": {"id": user_id, "isApproved": isApproved}},
            status=200,
        )
    except User.DoesNotExist:
        return JsonResponse(
            {"status": "failed", "message": "Invalid user_id."}, status=400
        )


@api_view(["GET"])
def get_new_media_requests(request):
    multimedia_items = Multimedia.objects.filter(user__is_active=True, status="WAITING")

    response = [
        {
            "user": {
                "username": item.user.username,
                "fullname": item.user.first_name + " " + item.user.last_name,
                "email": item.user.email,
            },
            "media_id": item.media_id,
            "file": item.file_path,
            "media_type": item.media_type,
            "uploaded_at": item.uploaded_at,
        }
        for item in multimedia_items
    ]

    return JsonResponse({"data": response}, status=200)


@api_view(["GET"])
def get_media_details(request, media_id):
    try:
        multimedia = Multimedia.objects.get(media_id=media_id)
        response_data = {
            "user": {
                "username": multimedia.user.username,
                "fullname": multimedia.user.get_full_name(),
                "email": multimedia.user.email,
            },
            "file": multimedia.file_path,
            "media_type": multimedia.media_type,
            "uploaded_at": multimedia.uploaded_at,
            "status": multimedia.status,
        }
        return JsonResponse(response_data, safe=False, status=200)
    except Multimedia.DoesNotExist:
        return JsonResponse(
            {"error": "Multimedia not found or already approved"}, status=404
        )


@api_view(["POST"])
def approve_multimedia(request):
    media_id = request.data.get("mediaId")
    try:
        new_multimedia = Multimedia.objects.get(media_id=media_id)
        old_multimedia = Multimedia.objects.get(
            user=new_multimedia.user,
            status="ACTIVE",
            media_type=new_multimedia.media_type,
        )
        old_multimedia.status = "INACTIVE"
        old_multimedia.save()
        new_multimedia.status = "ACTIVE"
        new_multimedia.save()
        return JsonResponse({"message": "Multimedia approved successfully"}, status=200)
    except Multimedia.DoesNotExist:
        return JsonResponse(
            {"error": "Multimedia not found or already approved"}, status=404
        )


@api_view(["POST"])
def reject_multimedia(request):
    media_id = request.data.get("mediaId")
    try:
        multimedia = Multimedia.objects.get(media_id=media_id)
        multimedia.status = "REJECTED"
        multimedia.save()
        return JsonResponse({"message": "Multimedia rejected successfully"}, status=200)
    except Multimedia.DoesNotExist:
        return JsonResponse(
            {"error": "Multimedia not found or already approved"}, status=404
        )
