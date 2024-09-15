from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import GoogleLogin, PetViewSet, HealthStatusViewSet, OwnerViewSet, RegisterView
from .views import logout_view

router = DefaultRouter()
router.register(r'pets', PetViewSet)
router.register(r'health-status', HealthStatusViewSet)
router.register(r'owners', OwnerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout_view, name='logout'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
]