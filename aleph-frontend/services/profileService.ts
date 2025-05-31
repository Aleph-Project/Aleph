export interface ProfileExistsResponse {
    exists: boolean;
}

export interface CreateProfileData {
    auth_id: string;
    name: string;
    bio: string;
    birthday: string;
    city_id: string | number;
    avatar_file?: File;
    background_file?: File;
}

export interface Country {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface City {
    id: number;
    country_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    country: Country;
}

export interface Profile {
    id: number;
    city_id: number;
    name: string;
    bio: string;
    birthday: string;
    created_at: string;
    updated_at: string;
    auth_id: string;
    city: City;
    avatar_url: string | null;
    background_url: string | null;
}

const PROFILE_API_URL = '/api/v1/profiles';
const COMPOSED_API_URL = '/api/v1/composite';  

export async function checkProfileExists(auth_id: string): Promise<ProfileExistsResponse> {
    const response = await fetch(`${PROFILE_API_URL}/exists-profile/${auth_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        
    });

    if (!response.ok) {
        throw new Error('Error checking profile existence');
    }

    return await response.json();
}

export async function CreateProfile(data: CreateProfileData): Promise<any> {
    const formData = new FormData();
    formData.append("profile[auth_id]", data.auth_id);
    formData.append("profile[name]", data.name);
    formData.append("profile[bio]", data.bio);
    formData.append("profile[birthday]", data.birthday);
    formData.append("profile[city_id]", String(data.city_id));
    if (data.avatar_file) {
        formData.append("profile[avatar_file]", data.avatar_file);
    }
    if (data.background_file) {
        formData.append("profile[background_file]", data.background_file);
    }

  const response = await fetch(`${PROFILE_API_URL}/create-profile`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error creating profile");
  }

  return response.json();
}

export async function getProfileLogued(auth_id: string): Promise<any> {
    try{
        const response = await fetch(`${PROFILE_API_URL}/my-profile/${auth_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok){
        throw new Error('Error fetching profile log');
    } 

    return await response.json();
    } catch (error) {
        console.error('Error fetching profile log:', error);
        throw error;
    }
    
    
}

export async function DeleteProfile(auth_id: string): Promise<any> {
    try {
        const response = await fetch(`${COMPOSED_API_URL}/delete-profile/${auth_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return { success: false, message: 'Error deleting profile' };
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting profile:', error);
        return { success: false, message: 'Exception occurred while deleting profile', error };
    }
}

export async function editProfile(data: CreateProfileData, auth_id: string): Promise<any> {
    const formData = new FormData();
    formData.append("profile[auth_id]", data.auth_id);
    formData.append("profile[name]", data.name);
    formData.append("profile[bio]", data.bio);
    formData.append("profile[birthday]", data.birthday);
    formData.append("profile[city_id]", String(data.city_id));
    if (data.avatar_file) {
        formData.append("profile[avatar_file]", data.avatar_file);
    }
    if (data.background_file) {
        formData.append("profile[background_file]", data.background_file);
    }

  const response = await fetch(`${PROFILE_API_URL}/my-profile-update/${auth_id}`, {
    method: "PATCH",
    body: formData,
  });

//   const response = await fetch(`${PROFILE_API_URL}/create-profile`, {
//     method: "POST",
//     body: formData,
//   });

  if (!response.ok) {
    throw new Error("Error editing profile");
  }

  return response.json();
}



