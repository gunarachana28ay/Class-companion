import uuid

from django.db.models import Avg

from .models import User, Multimedia, Feedback
from django.core.files.storage import default_storage
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(["GET", "PATCH"])
def user_profile(request):
    if request.method == "GET":
        return get_user_profile(request)
    elif request.method == "PATCH":
        return update_user_profile(request)


def get_user_profile(request):
    user_id = request.GET.get("id")

    try:
        user = User.objects.get(id=user_id)
    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "message": str(e),
            },
            status=400,
        )

    profile_picture = Multimedia.objects.get(user=user, status="ACTIVE", media_type="profile_picture")
    if user.user_type.lower() == "tutor":
        try:
            cv = Multimedia.objects.get(user=user, status="ACTIVE", media_type="cv")
            avgRating = Feedback.objects.filter(tutor=user).aggregate(Avg("rating"))[
                "rating__avg"
            ]
        except Exception as e:
            return JsonResponse(
                {
                    "status": "failed",
                    "message": str(e),
                },
                status=400,
            )
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "birthdate": user.birth_date,
            "contact_details": user.contact_details,
            "user_type": user.user_type,
            "bio": user.bio,
            "subject": user.subject,
            "experience": user.experience,
            "cv": cv.file_path,
            "profile_picture": profile_picture.file_path if profile_picture else None,
            "rating": 0 if avgRating == None else round(
                avgRating,
                1,
            ),
        }
    else:
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "birthdate": user.birth_date,
            "user_type": user.user_type,
            "profile_picture": profile_picture.file_path if profile_picture else None,
        }

    return JsonResponse(
        {
            "status": "success",
            "data": user_data,
        },
        status=200,
    )


def update_user_profile(request):
    token = request.headers.get("Authorization").split(" ")[1]
    validated_token = JWTAuthentication().get_validated_token(token)
    user_id = validated_token.get("user_id")

    password = request.data.get("password", None)
    contact_details = request.data.get("contact_details", None)
    experience = request.data.get("experience", None)
    bio = request.data.get("bio", None)
    subject = request.data.get("subject", None)

    try:
        user = User.objects.get(id=user_id)
    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "message": str(e),
            },
            status=400,
        )

    user.contact_details = contact_details if contact_details else user.contact_details
    user.experience = experience if experience else user.experience
    user.bio = bio if bio else user.bio
    user.subject = subject if subject else user.subject

    if password:
        user.set_password(password)

    if user.user_type.lower() == "tutor":
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "birthdate": user.birth_date,
            "contact_details": user.contact_details,
            "user_type": user.user_type,
            "bio": user.bio,
            "subject": user.subject,
            "experience": user.experience,
        }
    else:
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "birthdate": user.birth_date,
            "user_type": user.user_type,
        }

    user.save()

    return JsonResponse(
        {
            "status": "success",
            "data": user_data,
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_new_media(request):
    user = request.user

    new_file = request.FILES.get("file")
    media_type = request.data.get("media_type")
    file_name = f"{uuid.uuid4()}_{new_file.name}"
    file_path = default_storage.save(file_name, new_file)
    file_url = default_storage.url(file_path)

    new_multimedia = Multimedia(
        user=user,
        media_type=media_type,
        file_path=file_url,
        status="WAITING",
    )
    new_multimedia.save()

    media_data = {
        "id": new_multimedia.media_id,
        "media_type": new_multimedia.media_type,
        "file_path": new_multimedia.file_path,
        "status": new_multimedia.status,
    }
    return JsonResponse({"data": media_data}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_profile(request):
    try:
        user = User.objects.get(id=request.user.id)
    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "message": str(e),
            },
            status=400,
        )

    if user.user_type.lower() == "tutor":
        try:
            cv = Multimedia.objects.get(user=user, status="ACTIVE", media_type="cv")
            profile_picture = Multimedia.objects.get(
                user=user, status="ACTIVE", media_type="profile_picture"
            )

        except Exception as e:
            return JsonResponse(
                {
                    "status": "failed",
                    "message": str(e),
                },
                status=400,
            )
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "birthdate": user.birth_date,
            "contact_details": user.contact_details,
            "user_type": user.user_type,
            "bio": user.bio,
            "subject": user.subject,
            "experience": user.experience,
            "cv": cv.file_path,
            "profile_picture": profile_picture.file_path,
        }
    else:
        try:
            profile_picture = Multimedia.objects.get(
                user=user, status="ACTIVE", media_type="profile_picture"
            ).file_path
        except Exception as e:
            profile_picture = None

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "birthdate": user.birth_date,
            "user_type": user.user_type,
            "profile_picture": profile_picture,
        }

    return JsonResponse(
        {
            "status": "success",
            "data": user_data,
        },
        status=200,
    )
