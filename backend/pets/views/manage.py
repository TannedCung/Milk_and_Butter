from requests import Response
from ..permissions import IsOwner
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, action
from ..models import Pet, HealthStatus, Owner, Vaccination
from ..serializers.manage import PetSerializer, HealthStatusSerializer, OwnerSerializer, RegisterSerializer, VaccinationSerializer
from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
import os
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from ..pagination.manage import VaccinationPagination, HealthStatusPagination  # Import the custom pagination


class VaccinationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to view, create, update or delete vaccinations.
    """
    permission_classes = [IsAuthenticated]
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    pagination_class = VaccinationPagination

    def get_queryset(self):
        queryset = Vaccination.objects.filter(pet__owner=self.request.user)
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet=pet_id)
        return queryset

    def get_object(self):
        try:
            return Vaccination.objects.get(pk=self.kwargs['pk'])
        except Vaccination.DoesNotExist:
            return None

    # def get_serializer_context(self):
    #     return {'pet_pk': self.kwargs['pet']}

class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        # Only return the pets that belong to the logged-in user (owner)
        return Pet.objects.filter(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        # Log request data for debugging
        print(f"Pet creation request data: {request.data}")
        print(f"Pet creation request files: {request.FILES}")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the pet
        serializer.save(owner=self.request.user)

    def get_object(self):
        pet = super().get_object()
        if pet.owner != self.request.user:
            raise PermissionDenied("You do not have permission to view this pet.")
        return pet
    
    @action(detail=True, methods=['get'], url_path='avatar')
    def get_avatar(self, request, pk=None):
        pet = self.get_object()
        if not pet.avatar:
            return Response({"error": "Avatar not found."}, status=status.HTTP_404_NOT_FOUND)
        
        avatar_path = pet.avatar.path
        if os.path.exists(avatar_path):
            return FileResponse(open(avatar_path, 'rb'), content_type='image/jpeg')
        else:
            return Response({"error": "Avatar file does not exist."}, status=status.HTTP_404_NOT_FOUND)

class HealthStatusViewSet(viewsets.ModelViewSet):
    queryset = HealthStatus.objects.all()
    serializer_class = HealthStatusSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = HealthStatusPagination

    def get_queryset(self):
        queryset = HealthStatus.objects.filter(pet__owner=self.request.user)
        pet_id = self.request.query_params.get('pet', None)
        if pet_id is not None:
            queryset = queryset.filter(pet=pet_id)
        return queryset

    def perform_create(self, serializer):
        pet = serializer.validated_data['pet']
        if pet.owner != self.request.user:
            raise PermissionDenied("You do not have permission to add health data for this pet.")

        # Default measured_at to the current time if it's not provided
        if 'measured_at' not in serializer.validated_data:
            serializer.validated_data['measured_at'] = timezone.now()

        serializer.save()

class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Owner.objects.filter(user=self.request.user)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLogin(APIView):
    def post(self, request):
        token = request.data.get('token')
        try:
            # Verify the token using Google's API
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), "150416007830-pr16pii17ta44b6netma2qah4fp8rt1q.apps.googleusercontent.com")
            
            if 'email' not in idinfo:
                return Response({'error': 'Email not provided'}, status=400)
            
            email = idinfo['email']
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'email': user.email,
            })
        except ValueError:
            return Response({'error': 'Invalid token'}, status=400)

@api_view(['POST'])
def logout_view(request):
    # Here you might want to invalidate the refresh token or any other session data
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
