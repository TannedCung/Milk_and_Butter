from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views.overview import DashboardOverviewView
from .views.manage import GoogleLogin, PetViewSet, HealthStatusViewSet, OwnerViewSet, RegisterView, VaccinationViewSet
from .views.manage import logout_view
from .views.health import health_check, ready_check, live_check

router = DefaultRouter()
router.register(r'pets', PetViewSet)
router.register(r'health-status', HealthStatusViewSet)
router.register(r'owners', OwnerViewSet)
router.register(r'vaccination', VaccinationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout_view, name='logout'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('health/', health_check, name='health-check'),
    path('ready/', ready_check, name='ready-check'),
    path('live/', live_check, name='live-check'),
]
