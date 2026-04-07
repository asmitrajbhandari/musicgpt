// API functions for profile operations

export async function updateProfileInBackend(userId: string, displayName: string, photoURL?: string) {
  try {
    const response = await fetch('/api/profile', {
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
      throw new Error(result.error || 'Failed to update profile');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating profile in backend:', error);
    throw error;
  }
}
