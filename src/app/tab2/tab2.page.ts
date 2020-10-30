import { Photo } from './../models/photo';
import { PhotoService } from './../services/photo.service';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  constructor(public photoService: PhotoService, public actionSheetCtrl: ActionSheetController,){}

  async ngOnInit(){
    await this.photoService.loadSaved();
  }
  addPhotoToGallery()
  {
    this.photoService.addNewToGalery();
  }
  public async showActionSheet(photo: Photo, position: number){
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Photos',
      buttons: [{
        text: 'delete',
        role: 'destroy',
        icon: 'trash',
        handler: () =>{
          this.photoService.delePicture(photo, position);
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        icon: 'cancel',
        handler:() =>{}
        }
      ]
  });
    await actionSheet.present();
  }

}
