import { Component, OnInit } from '@angular/core';
import { Image, ModalGalleryRef, ModalGalleryService } from '@ks89/angular-modal-gallery';
// import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public GalleryImage: Image[] = [
    new Image(
      1,
      { //modal
        img: './assets/img/photos/1.jpg',
        title: '',
      }
    ),
    new Image(
      2,
      { //modal
        img: './assets/img/photos/2.jpg',
        title: '',
      }
    ),
    new Image(
      3,
      { //modal
        img: './assets/img/photos/3.jpg',
        title: '',
      }
    ),
    new Image(
      4,
      { //modal
        img: './assets/img/photos/4.jpg',
        title: '',
      }
    ),
    new Image(
      5,
      { //modal
        img: './assets/img/photos/5.jpg',
        title: '',
      }
    ),
    new Image(
      6,
      { //modal
        img: './assets/img/photos/6.jpg',
        title: '',
      }
    ),
    new Image(
      7,
      { //modal
        img: './assets/img/photos/7.jpg',
        title: '',
      }
    ),
    new Image(
      8,
      { //modal
        img: './assets/img/photos/8.jpg',
        title: '',
      }
    ),
    new Image(
      9,
      { //modal
        img: './assets/img/photos/9.jpg',
        title: '',
      }
    ),
  
  ]


  constructor(private modalGalleryService: ModalGalleryService) {}

  ngOnInit() {

  }

  openImageModalRowDescription(id: number, image: Image): void {
    const index: number = this.getCurrentIndexCustomLayout(image, this.GalleryImage);
    const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
      id,
      images: this.GalleryImage,
      currentImage: this.GalleryImage[index]
    }) as ModalGalleryRef;
  }

  private getCurrentIndexCustomLayout(image: Image, images: Image[]): number {
    return image ? images.indexOf(image) : -1;
  };

}

const data = [
  {
    srcUrl: './assets/img/photos/1.jpg',
    previewUrl: './assets/img/photos/1.jpg'
  },
  {
    srcUrl: './assets/img/photos/2.jpg',
    previewUrl: './assets/img/photos/2.jpg',
  },
  {
    srcUrl: './assets/img/photos/3.jpg',
    previewUrl: './assets/img/photos/3.jpg',
  },
  {
    srcUrl: './assets/img/photos/2.jpg',
    previewUrl: './assets/img/photos/2.jpg',
  },
  {
    srcUrl: './assets/img/photos/4.jpg',
    previewUrl: './assets/img/photos/4.jpg',
  },
  {
    srcUrl: './assets/img/photos/5.jpg',
    previewUrl: './assets/img/photos/5.jpg',
  },
  {
    srcUrl: './assets/img/photos/6.jpg',
    previewUrl: './assets/img/photos/6.jpg',
  },
  {
    srcUrl: './assets/img/photos/7.jpg',
    previewUrl: './assets/img/photos/7.jpg',
  },
  {
    srcUrl: './assets/img/photos/8.jpg',
    previewUrl: './assets/img/photos/8.jpg',
  },
];
