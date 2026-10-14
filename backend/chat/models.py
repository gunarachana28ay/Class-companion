from django.db import models
from user_management.models import User


class ChatGroup(models.Model):
    CHAT_TYPE_CHOICES = [
        ("group", "group"),
        ("individual", "individual"),
    ]

    chat_id = models.AutoField(primary_key=True)
    chat_type = models.CharField(max_length=10, choices=CHAT_TYPE_CHOICES)
    name = models.TextField()
    picture = models.TextField(null=True)
    users = models.ManyToManyField(User, related_name="group_users")


class ChatMessage(models.Model):
    message_id = models.AutoField(primary_key=True)
    chat_id = models.ForeignKey(ChatGroup, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    isReported = models.BooleanField(default=False)
    isBlocked = models.BooleanField(default=False)
    read_by = models.ManyToManyField(User, related_name="read_by")
    delivered_to = models.ManyToManyField(User, related_name="delivered_to")

    class Meta:
        ordering = ["time"]
