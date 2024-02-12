import re

from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.forms import CharField, Textarea, ModelForm
from django.forms.widgets import TextInput
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import CUSTOM_USERNAME_MAXLENGTH
from .models import Profile


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("username", "email",)
        help_texts = {
            "username": _(f"Required. {CUSTOM_USERNAME_MAXLENGTH} characters or fewer. Letters, digits and @/./+/-/_ only.")
        }

    def clean_username(self):
        validation_errors = []
        data = self.cleaned_data.get("username")
        if len(data) > CUSTOM_USERNAME_MAXLENGTH:
            msg = _("Username is too long")
            validation_errors.append( ValidationError(msg, "uername_too_long") )
        if not re.match("^[0-9A-Za-z@.+_-]+$", data):
            msg = _("Username contains invalid characters")
            validation_errors.append( ValidationError(msg, "username_invalid_chars") )
        if validation_errors:
            raise ValidationError( validation_errors )
        return data


    def clean_email(self):
        data = self.cleaned_data.get("email")
        if data and User.objects.filter(email=data).exists():
            msg = _('A user with that email already exists.')
            raise ValidationError(msg, code="email_duplicate")

        return data

class CustomUserChangeForm(ModelForm):
    class Meta:
        model = User
        fields = ["username", "email"]
        help_texts = {
            "username": _(f"Required. {CUSTOM_USERNAME_MAXLENGTH} characters or fewer. Letters, digits and @/./+/-/_ only.")
        }

    def clean_username(self):
        validation_errors = []
        data = self.cleaned_data.get("username")
        if len(data) > CUSTOM_USERNAME_MAXLENGTH:
            msg = _("Username is too long")
            validation_errors.append( ValidationError(msg, "uername_too_long") )
        if not re.match("^[0-9A-Za-z@.+_-]+$", data):
            msg = _("Username contains invalid characters")
            validation_errors.append( ValidationError(msg, "username_invalid_chars") )
        if validation_errors:
            raise ValidationError( validation_errors )
        return data

    def clean_email(self):
        data = self.cleaned_data.get("email")
        if data == self.instance.email:
            return data
        if data and User.objects.filter(email=data).exists():
            msg = 'A user with that email already exists.'
            raise ValidationError(msg, code="email_duplicate")

        return data


class CustomProfileChangeForm(ModelForm):
    class Meta:
        model = Profile
        fields = ["display_name", "picture"]

    def clean_display_name(self):
        validation_errors = []
        data = self.cleaned_data["display_name"]
        if data == self.instance.display_name:
            return data
        if len(data) > CUSTOM_USERNAME_MAXLENGTH:
            msg = _("Display name too long")
            validation_errors.append( ValidationError(msg, code="display_name_too_long") )
        if not re.match("^[0-9A-Za-z@.+-_]+$", data):
            msg = _('Display name contains invalid characters')
            validation_errors.append( ValidationError(msg, code="invalid_display_name") )
        if Profile.objects.filter(display_name__iexact=data).exists():
            msg = _('Display name already in use')
            validation_errors.append( ValidationError(msg, code="display_name_duplicate") )
        if validation_errors:
            raise ValidationError( validation_errors )
        return data
