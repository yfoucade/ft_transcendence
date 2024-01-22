"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 4.2.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

# TODO: enable (force ?) HTTPS connections: https://docs.djangoproject.com/fr/4.2/topics/security/

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# TODO: keep secret key used in production secret!
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-zig57@5d4$kn%i1((e%dzm4xtin#&1%ad^cyjjuf=+bqmnym24'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"] # TODO: set to empty list in production


# Application definition

INSTALLED_APPS = [
    'transcendence',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'transcendence.middleware.UpdateLastRequestTimeMiddleware'
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'transcendence.context_processors.profile'
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# https://stackoverflow.com/questions/73633619/trouble-hooking-up-postgres-to-django
# TODO: require ssl connection: https://neoctobers.readthedocs.io/en/latest/python/django_postgresql.html

DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.postgresql',
		'NAME': os.environ.get("POSTGRES_DATABASE"),
		'USER': os.environ.get("POSTGRES_USER"),
		'PASSWORD': os.environ.get("POSTGRES_PASSWORD"),
		'HOST': os.environ.get("POSTGRES_HOST"),
		'PORT': os.environ.get("POSTGRES_PORT"),
	}
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

from django.utils.translation import gettext_lazy as _

LANGUAGE_CODE = 'en-us'

LANGUAGES = [
    ('en', _('English')),
    ('fr', _('French')),
    ('el', _('Greek')),
    ('ar', _('Arabic')),
    ('es', _('Spanish')),
    ('pl', _('Polish')),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'config', 'locale'),
    os.path.join(BASE_DIR, 'locale'),
]

LANGUAGE_COOKIE_NAME = 'user_language'

TIME_ZONE = 'Europe/Paris'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# TODO: see https://docs.djangoproject.com/en/4.2/howto/static-files/deployment/
# for proper strategies to serve static files in production environments.
STATIC_URL = 'static/'
STATIC_ROOT = "/var/www/transcendence/static/"

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# For avatars: https://docs.djangoproject.com/en/5.0/ref/models/fields/#imagefield
MEDIA_URL = "media/"
MEDIA_ROOT = "/var/www/transcendence/media/"

# https://stackoverflow.com/questions/12174040/forbidden-403-csrf-verification-failed-request-aborted
# https://docs.djangoproject.com/en/4.0/releases/4.0/#csrf-trusted-origins-changes-4-0
CSRF_TRUSTED_ORIGINS = [
    "https://localhost:8001",
]
