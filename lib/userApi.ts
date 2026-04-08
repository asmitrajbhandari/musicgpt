// API functions for user profile operations

export async function getUserProfileFromBackend(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile?userId=${userId}`);
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user profile');
    }
    
    return result.user;
  } catch (error) {
    console.error('Error fetching user profile from backend:', error);
    throw error;
  }
}

export async function updateUserProfileInBackend(userId: string, displayName: string, photoURL?: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        displayName,
        photoURL
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user profile');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating user profile in backend:', error);
    throw error;
  }
}

export async function uploadProfilePictureToBackend(userId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', userId);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile-picture`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload profile picture');
    }
    
    return result.photoURL;
  } catch (error) {
    console.error('Error uploading profile picture to backend:', error);
    throw error;
  }
}
