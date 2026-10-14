from datetime import datetime, timedelta
from django.db.models import Q
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from user_management.models import User
from .models import *


def generate_time_slots(year, week_number, tutor):
    try:
        appointment_availability = AppointmentAvailability.objects.get(tutor=tutor)
    except AppointmentAvailability.DoesNotExist:
        print("Tutor has not yet provided their availability.")
        return []

    res = []
    hours = []
    current_time = appointment_availability.start_time
    while current_time < appointment_availability.end_time:
        hours.append(current_time.hour)
        current_time += timedelta(hours=1)

    available_days = set(appointment_availability.days.values_list("name", flat=True))

    # Enumerate over each day, e.g., 1, Monday
    for day_index, day in enumerate(WEEK_DAYS, start=1):
        # Check if the tutor is available on that specific date
        if day in available_days:
            # Extract hours and add to list
            for hour in hours:
                check_datetime = (
                    datetime.fromisocalendar(int(year), int(week_number), day_index)
                    .replace(hour=hour)
                    .strftime("%Y-%m-%dT%H:%M:%S")
                    + "Z"
                )
                res.append(check_datetime)
    return res


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def postAvailability(request):
    user = User.objects.filter(id=request.user.id).first()
    if not user:
        return JsonResponse(
            {"status": "failed", "message": "User does not exist."}, status=400
        )

    AppointmentAvailability.objects.filter(tutor=user).delete()

    start_time = request.data.get("start_time")
    end_time = request.data.get("end_time")
    days = request.data.get("days", "").split()

    appointment_availability = AppointmentAvailability.objects.create(
        tutor=user,
        start_time=start_time,
        end_time=end_time,
    )

    for day in days:
        day_object, _ = Day.objects.get_or_create(name=day)
        appointment_availability.days.add(day_object)

    return JsonResponse(
        {
            "status": "success",
            "data": {
                "id": appointment_availability.id,
                "tutor": appointment_availability.tutor.username,
                "start_time": appointment_availability.start_time,
                "end_time": appointment_availability.end_time,
                "days": days,
            },
        },
        status=201,
    )


@api_view(["GET"])
def getAvailability(request):
    tutor_id = request.GET.get("tutor_id")
    week_number = request.GET.get("week_number")
    year = "2024"

    user = User.objects.filter(id=tutor_id).first()
    if not user:
        return JsonResponse(
            {"status": "failed", "message": "Invalid tutor_id."}, status=400
        )

    existing_schedules = [
        existing_schedule.time.strftime("%Y-%m-%dT%H:%M:%S") + "Z"
        for existing_schedule in AppointmentScheduled.objects.filter(
            tutor=user, status="APPROVED"
        )
    ]

    appointment_time_slots = generate_time_slots(year, week_number, user)

    res = [
        time_slot
        for time_slot in appointment_time_slots
        if time_slot not in existing_schedules
    ]

    return JsonResponse(
        {"status": "success", "data": res},
        status=200,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bookAppointment(request):
    student = User.objects.filter(id=request.user.id).first()
    if not student:
        return JsonResponse(
            {"status": "failed", "message": "User does not exist."}, status=400
        )

    tutor_id = request.data.get("tutor_id")
    time = request.data.get("time")

    tutor = User.objects.filter(id=tutor_id, user_type="TUTOR").first()
    if not tutor:
        return JsonResponse(
            {"status": "failed", "message": "Invalid tutor_id."}, status=400
        )

    if AppointmentScheduled.objects.filter(
        tutor=tutor, time=time, status="APPROVED"
    ).exists():
        return JsonResponse(
            {"status": "failed", "message": "This time slot is already booked."},
            status=400,
        )

    if AppointmentScheduled.objects.filter(
        tutor=tutor, time=time, student=student
    ).exists():
        return JsonResponse(
            {
                "status": "failed",
                "message": "You have already requested for this time slot.",
            },
            status=400,
        )

    datetime_obj = datetime.strptime(time, "%Y-%m-%dT%H:%M:%SZ")
    year, week_number, _ = datetime_obj.isocalendar()
    appointment_time_slots = generate_time_slots(year, week_number, tutor)

    if time not in appointment_time_slots:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Provided time is out of tutor's availability.",
            },
            status=400,
        )

    new_appointment = AppointmentScheduled.objects.create(
        tutor=tutor, student=student, time=time, status="PENDING"
    )
    return JsonResponse(
        {
            "status": "success",
            "data": {
                "id": new_appointment.id,
                "tutor": new_appointment.tutor.id,
                "student": new_appointment.student.id,
                "time": new_appointment.time,
                "status": new_appointment.status,
            },
        },
        status=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getScheduledAppointments(request):
    user = User.objects.filter(id=request.user.id).first()
    if not user:
        return JsonResponse(
            {"status": "failed", "message": "User does not exist."}, status=400
        )

    appointments = AppointmentScheduled.objects.filter(
        Q(tutor=user) | Q(student=user),
        time__gte=datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
    ).order_by("time")

    res = [
        {
            "id": appointment.id,
            "tutor": {
                "id": appointment.tutor.id,
                "first_name": appointment.tutor.first_name,
                "last_name": appointment.tutor.last_name,
            },
            "student": {
                "id": appointment.student.id,
                "first_name": appointment.student.first_name,
                "last_name": appointment.student.last_name,
            },
            "time": appointment.time,
            "status": appointment.status,
        }
        for appointment in appointments
    ]

    return JsonResponse(
        {"status": "success", "data": res},
        status=200,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approveAppointment(request):
    tutor = User.objects.filter(id=request.user.id).first()
    if not tutor:
        return JsonResponse(
            {"status": "failed", "message": "User does not exist."}, status=400
        )

    appointment_id = request.data.get("appointment_id")
    is_approved = request.data.get("is_approved")

    if appointment_id is None or is_approved is None:
        return JsonResponse(
            {
                "status": "failed",
                "message": "appointment_id and is_approved are required.",
            },
            status=400,
        )

    appointment = AppointmentScheduled.objects.filter(
        id=appointment_id, tutor=tutor
    ).first()

    if not appointment:
        return JsonResponse(
            {"status": "failed", "message": "Appointment not found."},
            status=404,
        )

    appointment.status = "APPROVED" if is_approved.lower() == "true" else "DENIED"
    appointment.save()

    return JsonResponse(
        {
            "status": "success",
            "data": {
                "id": appointment.id,
                "tutor": appointment.tutor.id,
                "student": appointment.student.id,
                "time": appointment.time,
                "status": appointment.status,
            },
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def deleteAppointment(request):
    user = User.objects.filter(id=request.user.id).first()
    if not user:
        return JsonResponse(
            {"status": "failed", "message": "User does not exist."}, status=400
        )

    appointment_id = request.data.get("appointment_id")

    if not appointment_id:
        return JsonResponse(
            {"status": "failed", "message": "appointment_id is required."},
            status=400,
        )

    appointment = AppointmentScheduled.objects.filter(
        Q(tutor=user) | Q(student=user), id=appointment_id
    ).first()

    if not appointment:
        return JsonResponse(
            {
                "status": "failed",
                "message": "Appointment not found or you do not have permission to delete it.",
            },
            status=404,
        )

    appointment.delete()

    return JsonResponse(
        {"status": "success", "data": {"id": appointment_id, "message": "Deleted"}},
        status=200,
    )
