from django.db.models import Avg

from .models import User, Multimedia, Feedback
from django.http import JsonResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
def get_top_tutors(request):
    sorted_tutors_data = get_sorted_tutors()

    # Limit to top 10
    top_10_tutors = sorted_tutors_data[:10]

    return JsonResponse(
        {
            "status": "success",
            "data": top_10_tutors,
        }
    )


@api_view(['GET'])
def get_top_subjects(request):
    sorted_tutors_data = get_sorted_tutors()
    subject_list = list(map(lambda tutor: tutor['subject'], sorted_tutors_data))
    unique_subjects = list(set(subject_list))

    # Limit to top 10
    top_10_subjects = unique_subjects[:10]

    response_data = list(map(lambda subject: {"name": subject}, top_10_subjects))

    return JsonResponse(
        {
            "status": "success",
            "data": response_data,
        }
    )

@api_view(["POST"])
def rate_tutor(request):
    tutor_id = request.data.get("tutor_id")
    rating = request.data.get("rating")

    student = User.objects.get(id=request.user.id)
    tutor = User.objects.get(id=tutor_id)

    if student.user_type.lower() != "student":
        return JsonResponse(
            {"error": "Only students may rate tutors"}, status=403
        )

    if tutor.user_type.lower() != "tutor":
        return JsonResponse(
            {"error": "Only tutors may be rated"}, status=403
        )

    existing_feedback = Feedback.objects.filter(tutor_id=tutor_id, student_id=student.id)
    if existing_feedback.exists():
        return JsonResponse(
            {"error": "You have already rated this tutor"}, status=403
        )

    feedback = Feedback(student=student, tutor=tutor, rating=rating)
    feedback.save()
    return JsonResponse({"message": "Feedback added successfully"}, status=200)


def get_sorted_tutors():
    all_active_tutors = User.objects.filter(user_type='TUTOR', is_active=True)
    tutors_data = []

    for tutor in all_active_tutors:
        avgRating = Feedback.objects.filter(tutor=tutor).aggregate(Avg("rating"))[
            "rating__avg"
        ]
        data = {
            "id": tutor.id,
            "username": tutor.username,
            "email": tutor.email,
            "firstname": tutor.first_name,
            "lastname": tutor.last_name,
            "birthdate": tutor.birth_date,
            "contact_details": tutor.contact_details,
            "user_type": tutor.user_type,
            "bio": tutor.bio,
            "subject": tutor.subject,
            "experience": tutor.experience,
            "cv": Multimedia.objects.get(user=tutor, status='ACTIVE', media_type="cv").file_path,
            "profile_picture": Multimedia.objects.get(user=tutor, status='ACTIVE', media_type='profile_picture').file_path,
            "rating": 0 if avgRating == None else round(
                avgRating,
                1,
            ),
        }
        tutors_data.append(data)

    return sorted(tutors_data, key=lambda x: x['rating'], reverse=True)
