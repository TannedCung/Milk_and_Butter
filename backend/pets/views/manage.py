from requests import Response
from ..permissions import IsOwner
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from ..models import Pet, HealthStatus, Owner
from ..serializers.manage import PetSerializer, HealthStatusSerializer, OwnerSerializer, RegisterSerializer
from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
import os
from django.core.exceptions import PermissionDenied
from django.utils import timezone
# from django.http.multipartparser import MultiPartParser

class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    # parser_classes = (MultiPartParser,)

    def get_queryset(self):
        # Only return the pets that belong to the logged-in user (owner)
        return Pet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the owner of the pet
        print(self.request.user )
        owner = User.objects.get(username=self.request.user)
        serializer.save(owner=owner)

    def get_object(self):
        pet = super().get_object()
        if pet.owner != self.request.user:
            raise PermissionDenied("You do not have permission to view this pet.")
        return pet
    
    @action(detail=True, methods=['get'], url_path='avatar')
    def get_avatar(self, request, pk=None):
        pet = self.get_object()
        if not pet.avatar:  # Assuming `avatar` is the field that stores the pet's avatar
            return Response({"error": "Avatar not found."}, status=status.HTTP_404_NOT_FOUND)
        
        avatar_path = pet.avatar.path  # Get the file path for the avatar image
        if os.path.exists(avatar_path):
            return FileResponse(open(avatar_path, 'rb'), content_type='image/jpeg')  # Adjust content type if necessary
        else:
            return Response({"error": "Avatar file does not exist."}, status=status.HTTP_404_NOT_FOUND)

class HealthStatusViewSet(viewsets.ModelViewSet):
    queryset = HealthStatus.objects.all()
    serializer_class = HealthStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter health attributes to only those that belong to the logged-in user's pets
        return HealthStatus.objects.filter(pet__owner=self.request.user)

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
        # Only allow the logged-in user to access their own profile
        return Owner.objects.filter(id=self.request.user.id)

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
            
            # Get or create a user based on the email
            email = idinfo['email']
            user, created = User.objects.get_or_create(username=email, defaults={'email': email})
            
            # Generate JWT token for the authenticated user
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

