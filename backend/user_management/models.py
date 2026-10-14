# yourapp/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.models import BaseUserManager
import uuid
import re


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')

        # Restrict email to hs-fulda.de domain
        domain_pattern = r'@hs-fulda\.de$'
        if not re.search(domain_pattern, email):
            raise ValueError('Only Fulda University emails are allowed')

        email = self.normalize_email(email)

        # Collect and validate the additional fields
        first_name = extra_fields.pop('first_name', '')
        last_name = extra_fields.pop('last_name', '')
        birth_date = extra_fields.pop('birth_date', None)
        contact_details = extra_fields.pop('contact_details', '')
        user_type = extra_fields.pop('user_type', 'STUDENT').upper()  # Default to Student if not provided
        experience = extra_fields.pop('experience', '')

        if user_type == 'TUTOR':
            bio = extra_fields.pop('bio', None)
            subject = extra_fields.pop('subject', None)


        # Create the user model instance
        user = self.model(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            birth_date=birth_date,
            contact_details=contact_details,
            user_type=user_type,
            experience=experience,
        )

        # Additional fields only for Tutor
        if user_type == 'TUTOR':
            user.bio = bio
            user.subject = subject

        user.set_password(password)
        user.is_active = False  # User is inactive until email verification
        user.save(using=self._db)

        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    birth_date = models.DateField(null=True, blank=True)
    contact_details = models.TextField(null=True, blank=True)
    is_disabled = models.BooleanField(default=False) 

    # Additional fields for user types
    # Additional fields for user types
    USER_CHOICES = [
        ('STUDENT', 'STUDENT'),
        ('TUTOR', 'TUTOR'),
    ]
    user_type = models.CharField(max_length=10, choices=USER_CHOICES, default='STUDENT')

    bio = models.CharField(max_length=3000, blank=True, null=True)
    subject = models.CharField(max_length=100, blank=True, null=True)
    # Additional fields for the User model
    experience = models.IntegerField(null=True, blank=True)

    objects = CustomUserManager()

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
        ]


class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'roles'


class UserRole(models.Model):
    user_role_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')  # Specify related_name
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        db_table = 'user_roles'
        unique_together = ('user', 'role')


class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message_content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username}: {self.content}"

    class Meta:
        db_table = 'messages'


class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, related_name='given_feedback', on_delete=models.CASCADE)
    tutor = models.ForeignKey(User, related_name='received_feedback', on_delete=models.CASCADE)
    rating = models.IntegerField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback'


class Multimedia(models.Model):
    media_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='multimedia')  # Specify related_name
    media_type = models.CharField(max_length=50, null=True, blank=True)
    file_path = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='WAITING')

    class Meta:
        db_table = 'multimedia'


class Group(models.Model):
    group_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)

    class Meta:
        db_table = 'groups'


class UserGroup(models.Model):
    user_group_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_groups')  # Specify related_name

    class Meta:
        db_table = 'user_group'
        unique_together = ('group', 'user')


class MessageGroup(models.Model):
    message_group_id = models.AutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE)

    class Meta:
        db_table = 'message_group'


class SubjectItem(models.Model):
    title = models.CharField(max_length=50)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'subject_items'
