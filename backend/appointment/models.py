from django.db import models
from user_management.models import User

WEEK_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


class Day(models.Model):
    DAYS_OF_WEEK = [(week_day, week_day) for week_day in WEEK_DAYS]
    name = models.CharField(max_length=9, choices=DAYS_OF_WEEK, unique=True)

    def __str__(self):
        return self.name


class AppointmentScheduled(models.Model):
    id = models.AutoField(primary_key=True)
    tutor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="tutor_appointment"
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="student_appointment"
    )
    time = models.DateTimeField()
    status = models.CharField(
        max_length=8,
        choices=[
            ("APPROVED", "APPROVED"),
            ("PENDING", "PENDING"),
            ("DENIED", "DENIED"),
        ],
    )


class AppointmentAvailability(models.Model):
    id = models.AutoField(primary_key=True)
    tutor = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    days = models.ManyToManyField(Day)
