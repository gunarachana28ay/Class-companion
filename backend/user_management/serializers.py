# serializers.py
from rest_framework import serializers
from .models import User, Message, Multimedia

class TutorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'email', 'bio', 'location', 'birth_date']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'email', 'bio', 'location', 'birth_date']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['sender', 'receiver','message_content']

class MultimediaSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Nesting the UserSerializer to include user details

    class Meta:
        model = Multimedia
        fields = ['user', 'media_type', 'file_path', 'uploaded_at']
