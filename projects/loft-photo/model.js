// eslint-disable-next-line no-unused-vars

// eslint-disable-next-line no-unused-vars

import { resolve } from 'path';
import { rejects } from 'assert';

export default {
  getRandomElement(array) {
    if (!array.length){
      return null;
    }

    // const index = Math.random(Math.random() * (array.length - 1));

    // return array[index]
  },

  async getNextPhoto() {
    const friend = this.getRandomElement(this.friends.items);
    const photos = await this.getFriendPhoto(friend.id);
    const photo = this.getRandomElement(photos.items);
    const size = this.findSize(photo);

    return { friend, id: photo.id, url: size.url };
  },

  findSize(photo){
    const size = photo.sizes.find((size) =>size.width >= 360);

    if (!size){
      return photo.size.reduce((biggest, curent) => {
        if (curent.width > biggest.width) {
          return curent;
        }

        return biggest;
      }, photo.sizes[0]);
    }

    return size;
  },

  async init(){
    this.photoCache = {};
    this.friends = await this.getFriends();
  },

  login() {
    return new Promise((resolve, reject) =>{
      VK.init({
        apiId: APP_ID,
      });

      VK.Auth.login((response) => {
        if (response.session) {
          resolve(response);
        } else {
          console.error(response);
          reject(response);
        }
      }, PERM_FRIENDS | PERM_PHOTOS);
    });
  },

  callApi(method, params) {
    params.v = params.v || '5.120';

    return new Promise((resolve, reject) => {
      VK.api(method, params, (response) => {
        if (response.error) {
          reject(new Error(response.error.error_msg));
        } else {
          resolve(response.response);
        }
      });
    });
  },

  getFriends() {
    const params = {
      fields: ['photo_50', 'photo_100'],
    };

    return this.callApi('friends.get', params);
  },

  getPhotos(owner) {
    const params = {
      owner_id: owner,
    }

    return this.callApi('photos.getAll', params);
  },

  async getFriendPhotos(id){
    let photos = this.photoCache[id];

    if (photos){
      return photos;
    }

    photos = await this.getFriendPhotos(id);

    this.photoCache[id] = photos;

    return photos;
  },

};
