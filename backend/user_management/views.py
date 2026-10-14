import uuid
from .forms import TutorProfileForm
from .models import User, Message, Multimedia, SubjectItem, Feedback
from .serializers import UserSerializer, MessageSerializer, TutorProfileSerializer
from datetime import datetime
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.db.models import Q, Avg
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)


@api_view(["POST"])
def signup_validate(request):
    username = request.data.get("username")
    email = request.data.get("email")
    birthdate = request.data.get("birthdate")
    password = "DummyPassword@123"

    if not email.endswith("@hs-fulda.de"):
        return JsonResponse(
            {
                "status": "failed",
                "message": "Only Fulda University emails are allowed.",
            },
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {
                "status": "failed",
                "message": "username already taken.",
            },
            status=400,
        )

    try:
        datetime.strptime(birthdate, "%Y-%m-%d")
    except:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Date of birth is invalid.",
            },
            status=400,
        )

    user_data = {
        "username": username,
        "email": email,
        "password": password,
        "experience": 0,
        "is_active": False,  # default to inactive
    }

    user = User.objects.create_user(**user_data)
    user.delete()

    return JsonResponse(
        {
            "status": "success",
            "data": {
                "username": username,
                "email": email,
                "birthdate": birthdate,
            },
        },
        status=201,
    )


@api_view(["POST"])
def signup_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email")
    first_name = request.data.get("firstname")
    last_name = request.data.get("lastname")
    birth_date = request.data.get("birthdate")
    contact_details = request.data.get("contact_details")
    user_type = request.data.get("user_type")
    experience = request.data.get("experience")
    bio = request.data.get("bio")
    subject = request.data.get("subject")
    profile_picture = request.FILES.get("profile_picture")
    cv = request.FILES.get("cv")

    # Validate email domain
    if not email.endswith("@hs-fulda.de"):
        return JsonResponse(
            {
                "status": "failed",
                "message": "Only Fulda University emails are allowed.",
            },
            status=400,
        )

    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {
                "status": "failed",
                "message": "username already taken.",
            },
            status=400,
        )

    # Check if user_type is valid
    if user_type not in ["tutor", "student"]:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Invalid user_type. Valid types are student and tutor.",
            },
            status=400,
        )

    required_fields_tutor = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "cv": cv,
        "profile_picture": profile_picture,
        "experience": experience,
        "subject": subject,
        "bio": bio,
    }

    required_fields_students = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
    }

    required_fields = (
        required_fields_tutor if user_type == "tutor" else required_fields_students
    )
    if all(required_fields.values()):
        # Prepare user data dictionary
        user_data = {
            "username": username,
            "email": email,
            "password": password,
            "is_active": False,  # default to inactive
            "first_name": first_name,
            "last_name": last_name,
            "birth_date": birth_date,
            "contact_details": contact_details,
            "user_type": user_type,
            "experience": experience if user_type == "tutor" else None,
            "bio": bio if user_type == "tutor" else None,
            "subject": subject if user_type == "tutor" else None,
        }
        user = User.objects.create_user(**user_data)
    else:
        return JsonResponse(
            {
                "status": "failed",
                "message": f"{', '.join(required_fields_tutor.keys())} are required for {user_type}.",
            },
            status=400,
        )

    if profile_picture:
        profile_picture_name = f"{uuid.uuid4()}_{profile_picture.name}"

        # Save files to S3 and get the URLs
        profile_picture_path = default_storage.save(
            profile_picture_name, profile_picture
        )
        profile_picture_url = default_storage.url(profile_picture_path)

        profile_picture_multimedia = Multimedia(
            user=user, media_type="profile_picture", file_path=profile_picture_url
        )
        profile_picture_multimedia.save()

    if cv and user_type == "tutor":
        cv_name = f"{uuid.uuid4()}_{cv.name}"
        cv_path = default_storage.save(cv_name, cv)
        cv_url = default_storage.url(cv_path)
        cv_multimedia = Multimedia(user=user, media_type="cv", file_path=cv_url)
        cv_multimedia.save()

    return JsonResponse(
        {
            "status": "success",
            "data": {
                "id": user.id,
                "username": user.username,
                "password": user.password,
                "email": user.email,
                "firstname": user.first_name,
                "lastname": user.last_name,
                "birthdate": user.birth_date,
                "contact_details": user.contact_details,
                "user_type": user.user_type,
                "experience": user.experience,
                "bio": user.bio,
                "subject": user.subject,
                "profile_picture": (
                    profile_picture_multimedia.file_path if profile_picture else None
                ),
                "cv": cv_multimedia.file_path if cv and user_type == "tutor" else None,
            },
        },
        status=201,
    )


@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    serializer = TokenObtainPairSerializer(
        data={"username": username, "password": password}
    )

    try:
        serializer.is_valid(raise_exception=True)
        token_data = serializer.validated_data
        return JsonResponse({"status": "success", "data": token_data}, status=200)
    except:
        return JsonResponse(
            {"status": "failed", "message": "Invalid username or password."}, status=401
        )


@api_view(["POST"])
def login_refresh(request):
    refresh = request.data.get("refresh")

    serializer = TokenRefreshSerializer(data={"refresh": refresh})

    try:
        serializer.is_valid(raise_exception=True)
        token_data = serializer.validated_data
        return JsonResponse({"status": "success", "data": token_data}, status=200)
    except:
        return JsonResponse(
            {"status": "failed", "message": "Token is invalid or expired."}, status=401
        )


def searchSubject(request):
    query = request.GET.get("query", "")
    items = SubjectItem.objects.filter(title__contains=query)
    items_list = list(items.values("title"))

    return JsonResponse({"results": items_list}, status=200)


@api_view(["GET"])
def search_tutors(request):
    try:
        user = User.objects.get(id=request.user.id)
    except Exception:
        user = None

    keyword = request.GET.get("keyword", "")
    experience_min = int(request.GET.get("experience_min", 0))
    experience_max = int(request.GET.get("experience_max", 100))
    rating = float(request.GET.get("rating", 0))
    subject = request.GET.get("subject", "")
    user_type = "TUTOR"

    # Build the query
    query = Q()
    if keyword:
        query &= (
            Q(first_name__icontains=keyword)
            | Q(last_name__icontains=keyword)
            | Q(subject__icontains=keyword)
        )
    if experience_min:
        query &= Q(experience__gte=experience_min)
    if experience_max:
        query &= Q(experience__lte=experience_max)
    if subject:
        query &= Q(subject__icontains=subject)
    if user_type:
        query &= Q(user_type__icontains=user_type)
    if user:
        query &= ~Q(id=user.id)

    # Execute the query
    tutors = User.objects.filter(query)

    tutors_data = []

    for tutor in tutors:
        avgRating = None
        cv = None
        profile_picture = None
        try:
            avgRating = Feedback.objects.filter(tutor=tutor).aggregate(Avg("rating"))[
                "rating__avg"
            ]
            cv = Multimedia.objects.get(user=tutor, status="ACTIVE", media_type="cv")
            profile_picture = Multimedia.objects.get(
                user=tutor, status="ACTIVE", media_type="profile_picture"
            )
        except:
            pass
        # Prepare the response
        data = {
            "id": tutor.id,
            "firstname": tutor.first_name,
            "lastname": tutor.last_name,
            "email": tutor.email,
            "subject": tutor.subject,
            "experience": tutor.experience,
            "rating": (
                0
                if avgRating == None
                else round(
                    avgRating,
                    1,
                )
            ),
            "cv": cv.file_path if cv else None,
            "profile_picture": profile_picture.file_path if profile_picture else None,
        }
        tutors_data.append(data)

    filtered_tutors_data = [
        tutor
        for tutor in tutors_data
        if tutor["rating"] is not None and tutor["rating"] >= rating
    ]

    return JsonResponse({"tutors": filtered_tutors_data}, status=200)


@api_view(["GET"])
def search_students(request):
    keyword = request.GET.get("keyword", "")
    username = request.GET.get("username", "")
    user_type = "STUDENT"

    # Build the query
    query = Q()
    if keyword:
        query &= Q(first_name__icontains=keyword) | Q(last_name__icontains=keyword)
    if username:
        query &= Q(username__icontains=username)
    if user_type:
        query &= Q(user_type__icontains=user_type)

    # Execute the query
    students = User.objects.filter(query)

    students_data = []

    for student in students:
        profile_picture = None
        try:
            profile_picture = Multimedia.objects.get(
                user=student, status="ACTIVE", media_type="profile_picture"
            )
        except:
            pass
        # Prepare the response
        data = {
            "id": student.id,
            "username": student.username,
            "firstname": student.first_name,
            "lastname": student.last_name,
            "email": student.email,
            "profile_picture": profile_picture.file_path if profile_picture else None,
        }
        students_data.append(data)
    return JsonResponse({"students": students_data}, status=200)


@api_view(["GET"])
def search_user(request):
    keyword = request.GET.get("keyword", "")
    username = request.GET.get("username", "")

    # Build the query
    query = Q()
    if keyword:
        query &= Q(username__icontains=keyword) | Q(email__icontains=keyword)
    if username:
        query &= Q(username__icontains=username)

    # Execute the query
    users = User.objects.filter(query)

    # Prepare the response
    users_data = UserSerializer(users, many=True).data

    return Response({"users": users_data}, status=200)
