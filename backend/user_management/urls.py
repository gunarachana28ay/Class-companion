from django.urls import path
from . import views, profile_view, top_view
from . import moderator_view
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.urls import path, re_path


schema_view = get_schema_view(
    openapi.Info(
        title="Class Companion",
        default_version="v1",
        description="Api documentation",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path("signup/validate/", views.signup_validate, name='signup_validate'),
    path("signup/", views.signup_view, name="home"),
    path('login/', views.login, name='token_obtain_pair'),
    path('login/refresh/', views.login_refresh, name='token_refresh'),
    path('retrieve_pending_tutors', moderator_view.get_inactive_users_for_review, name='get_inactive_users_for_review'),
    path('finalize_tutors', moderator_view.activate_user, name='review_and_activate_user'),
    path('profile', profile_view.user_profile, name='user_profile'),
    path('profile/', profile_view.user_profile, name='user_profile'),
    path('my-profile', profile_view.get_my_profile, name='my_profile'),

    # API not in document
    path('search', views.search_tutors, name='search_tutors'),
    path('search-students', views.search_students, name='search_students'),
    path('api/search-user', views.search_user, name='search_user'),
    path('users/new-media-requests', moderator_view.get_new_media_requests, name='get_new_media_requests'),
    path('users/approve-multimedia', moderator_view.approve_multimedia, name='approve_multimedia'),
    path('users/reject-multimedia', moderator_view.reject_multimedia, name='reject_multimedia'),
    path('users/multimedia-details/<int:media_id>', moderator_view.get_media_details, name='get_media_details'),
    path('profile/upload-new-media', profile_view.upload_new_media, name='upload_new_media'),

    # Top tutors and subjects
    path('top_tutors', top_view.get_top_tutors, name='get_top_tutors'),
    path('top_courses', top_view.get_top_subjects, name='get_top_subjects'),
    path('rate_tutor', top_view.rate_tutor, name='rate_tutor'),
]
