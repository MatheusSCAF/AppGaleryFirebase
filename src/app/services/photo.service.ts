import { AuthenticationService } from './auth.service';
import { Platform } from '@ionic/angular';
import { Photo } from './../models/photo';
import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor,
FilesystemDirectory, CameraPhoto, CameraSource, Filesystem} from '@capacitor/core';
import { promises, resolve } from 'dns';
import {take} from 'rxjs/operators';
import {AngularFireStorage} from '@angular/fire/storage';




const{Camera, FileSystem, Storage} = Plugins;
@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];
  private PHOTO_STORAGE = 'photos';
  private platform: Platform;

  constructor(platform: Platform, public authService: AuthenticationService, public fireStorage: AngularFireStorage) {this.platform = platform;}

  public async loadSaved() {

    const photoList = await Storage.get({key: this.PHOTO_STORAGE});
    this.photos = JSON.parse(photoList.value) || [];
    if (!this.platform.is('hybrid')){
        for (const photo of this.photos) {
          const readFile = await Filesystem.readFile({
              path: photo.filepath,
              directory: FilesystemDirectory.Data
          });

          photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        }
      }
  }
  public async addNewToGalery(){
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    }) ;
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });
}
 private async savePicture(cameraPhoto: CameraPhoto){
   const fileName = new Date().getTime() + '.jpeg';
   const base64Data = await this.readAsBase64(cameraPhoto, fileName);

   const savedFile = await Filesystem.writeFile({
     path: fileName,
     data: base64Data,
     directory: FilesystemDirectory.Data
   });
   if (this.platform.is('hybrid')){
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri)
    };
  }
    else{
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
 }
  private async readAsBase64(cameraPhoto: CameraPhoto, fileName: string) {
  if (this.platform.is('hybrid')){
    const file = await Filesystem.readFile({
      path: cameraPhoto.path
    });
    this.uploadPicture(file.data, fileName);
    return file.data;
  }
  else{
   const response = await fetch(cameraPhoto.webPath);
   const blob = await response.blob();
   this.uploadPicture(blob, fileName);

   return await this.convertBlobToBase64(blob) as string;
  }
}
private uploadPicture(file: any, filename: string){
  this.authService.getUser().
  pipe(
    take(1)
  ).subscribe((user) => {
    const ref = this.fireStorage.ref(user.uid + '/' + filename);
    const task = ref.put(file);
  });
}

convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
  resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});
    public async delePicture(photo: Photo, position: number)
    {
      this.photos.splice(position, 1);
      Storage.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos)
      });
      const fileName = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
      await Filesystem.deleteFile({
        path: fileName,
        directory: FilesystemDirectory.Data
      });
      this.authService.getUser().
      
      pipe(
        take(1)
      ).subscribe((user) => {
        const ref = this.fireStorage.ref(user.uid + '/' + fileName);
        ref.delete();

      });

    }
  }
