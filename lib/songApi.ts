// API functions for song operations

export async function saveSongToBackend(userId: string, songData: any) {
  try {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        songData,
        action: 'save'
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save song');
    }
    
    return result;
  } catch (error) {
    console.error('Error saving song to backend:', error);
    throw error;
  }
}

export async function updateSongInBackend(userId: string, songId: string, updates: any) {
  try {
    const response = await fetch('/api/songs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        songId,
        updates
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update song');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating song in backend:', error);
    throw error;
  }
}

export async function getSongsFromBackend(userId: string) {
  try {
    const response = await fetch(`/api/songs?userId=${userId}`);
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch songs');
    }
    
    return result.songs;
  } catch (error) {
    console.error('Error fetching songs from backend:', error);
    throw error;
  }
}
