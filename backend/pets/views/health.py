from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import redis
from django.conf import settings
import os


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check endpoint for load balancer and monitoring
    """
    try:
        # Check database connectivity
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    # Check cache (Redis) connectivity
    try:
        cache.set('health_check', 'ok', 30)
        cache_result = cache.get('health_check')
        cache_status = "healthy" if cache_result == 'ok' else "unhealthy"
    except Exception as e:
        cache_status = f"unhealthy: {str(e)}"
    
    # Overall health status
    overall_status = "healthy" if db_status == "healthy" and cache_status == "healthy" else "unhealthy"
    
    health_data = {
        "status": overall_status,
        "database": db_status,
        "cache": cache_status,
        "version": "1.0.0",
        "environment": os.getenv('DJANGO_SETTINGS_MODULE', 'unknown'),
    }
    
    status_code = 200 if overall_status == "healthy" else 503
    return JsonResponse(health_data, status=status_code)


@csrf_exempt
@require_http_methods(["GET"])
def ready_check(request):
    """
    Readiness check endpoint
    """
    try:
        # Check if we can perform basic operations
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_migrations")
            cursor.fetchone()
        
        return JsonResponse({"status": "ready"}, status=200)
    except Exception as e:
        return JsonResponse({"status": "not ready", "error": str(e)}, status=503)


@csrf_exempt
@require_http_methods(["GET"])
def live_check(request):
    """
    Liveness check endpoint
    """
    return JsonResponse({"status": "alive"}, status=200) 