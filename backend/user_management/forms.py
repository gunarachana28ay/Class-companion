from django import forms
from .models import User

class TutorProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
           'birth_date', 'contact_details',
            'subject', 'experience'
        ]
   