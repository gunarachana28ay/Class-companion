from django.urls import path
from . import views

urlpatterns = [
    path("availability", views.getAvailability),
    path("availability/", views.postAvailability),
    path("book_appointment/", views.bookAppointment),
    path("get_scheduled_appointments", views.getScheduledAppointments),
    path("approve_appointment/", views.approveAppointment),
    path("delete_appointment/", views.deleteAppointment),
]
