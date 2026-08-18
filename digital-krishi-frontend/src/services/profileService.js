import API from './api';

const getProfile = async () => {
  const res = await API.get('/profile');
  console.log('profileService.getProfile ->', res);
  return res;
};

const updateProfile = async (data) => {
  const res = await API.put('/profile', data);
  console.log('profileService.updateProfile ->', res);
  return res;
};

const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await API.post('/profile/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('profileService.uploadImage ->', res);
  return res;
};

const getTip = async () => {
  const res = await API.get('/profile/tip');
  console.log('profileService.getTip ->', res);
  return res;
};

export default {
  getProfile,
  updateProfile,
  uploadImage,
  getTip,
};
