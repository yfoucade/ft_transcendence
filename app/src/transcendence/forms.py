from django.core.exceptions import ValidationError
from django.forms import CharField, Textarea
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("username", "email",)

    def clean_email(self):
        print("Validating email") 
        data = self.cleaned_data.get("email")
        if User.objects.filter(email=data).exists():
            msg = 'A user with that email already exists.'
            raise ValidationError(msg, code="email_duplicate")

        return data
