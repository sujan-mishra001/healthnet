const REGISTER_URL = 'https://healthnet-v3g1.onrender.com/api/register';
const LOGIN_URL = 'https://healthnet-v3g1.onrender.com/api/login';
const PROFILE_URL = 'https://healthnet-v3g1.onrender.com/api/profile';
const GET_URL = 'https://healthnet-v3g1.onrender.com/api/getform';
const UPLOAD_URL = 'https://healthnet-v3g1.onrender.com/api/uploadform';
const SHOWFORM_URL ='https://healthnet-v3g1.onrender.com/api/myforms/:id';
const UPDATEPASSWORD_URL='https://healthnet-v3g1.onrender.com/api/updatepassword';

export const register = async (fullname, contact,DOB,bloodType ,email, password) => {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
      body: JSON.stringify({ fullname, contact ,DOB,bloodType ,email, password})
    });

    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(`Failed to register: ${errorMessage}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email,password) => {
  const token = localStorage.getItem('token');


  try {
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${token}` },
      body: JSON.stringify({email,password})
    });

    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(`Failed to login: ${errorMessage}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(PROFILE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(`Failed to get profile: ${errorMessage}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};


 export const setFormData = async(fullname,contactnumber,email,tag,bloodType,age,weight,gender,address,userId)=>{
  const token = localStorage.getItem('token');
  try {

    const res = await fetch(UPLOAD_URL,{
      method: "POST",
      credentials: 'include',
      headers: { "Content-Type": "application/json",'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ fullname,contactnumber,email,tag, bloodType,age,weight,gender,address,userId}),
    });
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(`Failed to set form data: ${errorMessage}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export const showBloodRequestData = async(tag)=>{
  const token = localStorage.getItem('token');

  const url = new URL(GET_URL);  
  const params = new URLSearchParams({
    tag: tag,
  });
  url.search = params.toString();  

  try {
    const res =  await fetch(url ,{
      method: "GET",
      credentials: "include",
     
      headers: { "Content-Type": "application/json",'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(`Failed to get profile: ${errorMessage}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;

}
}



export const getFormById = async (id) => {
  const token = localStorage.getItem('token');
  const url =SHOWFORM_URL.replace(':id', id);


  try {
    const res = await fetch(url,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`

      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return await res.json(); // Ensure JSON is returned here
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};

export const updatePassword = async ({ email, password }) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(UPDATEPASSWORD_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};
