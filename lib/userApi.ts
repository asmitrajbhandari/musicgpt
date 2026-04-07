// API functions for user profile operations

export async function getUserProfileFromBackend(userId: string) {
  try {
    console.log('Fetching user profile from Express backend for userId:', userId);
    const response = await fetch(`http://localhost:3002/user/profile?userId=${userId}`);
    
    const result = await response.json();
    console.log('Received response from Express backend:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user profile');
    }
    
    console.log('Successfully fetched user profile:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error fetching user profile from backend:', error);
    throw error;
  }
}

export async function updateUserProfileInBackend(userId: string, displayName: string, photoURL?: string) {
  try {
    console.log('Updating user profile in Express backend:', { userId, displayName, photoURL });
    const response = await fetch(`http://localhost:3002/user/profile`, {
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
    console.log('Received update response from Express backend:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user profile');
    }
    
    console.log('Successfully updated user profile:', result.user);
    return result;
  } catch (error) {
    console.error('Error updating user profile in backend:', error);
    throw error;
  }
}

export async function uploadProfilePictureToBackend(userId: string, file: File) {
  try {
    console.log('Uploading profile picture to Express backend for userId:', userId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', userId);

    const response = await fetch(`http://localhost:3002/user/profile-picture`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Received upload response from Express backend:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload profile picture');
    }
    
    console.log('Successfully uploaded profile picture:', result.photoURL);
    return result.photoURL;
  } catch (error) {
    console.error('Error uploading profile picture to backend:', error);
    throw error;
  }
}
