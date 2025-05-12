import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { EventService } from '../event.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { AddEventGalleryComponent } from '../add-event-gallery/add-event-gallery.component';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-event-gallery-detail',
  templateUrl: './event-gallery-detail.component.html',
  styleUrls: ['./event-gallery-detail.component.scss']
})
export class EventGalleryDetailComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  id: any
  eventDetail: any
  URLConstants = URLConstants;
  selectedImages: number[] = [];
  selectAllImage: boolean = false;
  selectedIndex: any
  sortedImages: any[] = []
  dropListIds: string[] = [];
  sortableOptions = {
    animation: 150,
    direction: 'auto', // allows auto-adjustment for mixed orientation
    ghostClass: 'sortable-ghost',
    swapThreshold: 0.65,
    onUpdate: () => this.setImageOrder(),
  };

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private eventService: EventService,
    public CommonService: CommonService,
    private toastr: Toastr,
    public dateFormateService: DateFormatService,
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getEvent();
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  viewImage(index: any, eventMdl) {
    this.selectedIndex = index;
    this.modalService.open(eventMdl, {
      windowClass: 'event_detail_modal',
    });
  }

  getEvent() {
    this.eventService.getEvent(this.id).subscribe((resp: any) => {
      this.eventDetail = resp?.data;
      this.sortedImages = [...this.eventDetail?.event_files];
    }, (error: any) => {
      this.toastr.showError(error?.error?.message || error?.message)
    })
  }

  trackByImageId(index: number, item: any): number {
    return item.id;
  }

  close() {
    this.modalService.dismissAll()
    this.clearForm()
    this.selectedIndex = null;
  }

  clearForm() {

  }

  openModal(isEventAdd: boolean = false) {
    const modalRef = this.modalService.open(AddEventGalleryComponent, {
      size: 'md',
      windowClass: 'duplicate-modal-section latest-design-modal',
      backdropClass: 'duplicate-modal-backdrop',
      backdrop: true,
    });
    modalRef.componentInstance.isEventAdd = isEventAdd
    modalRef.componentInstance.eventDetailId = this.id

    modalRef.result.then((response: any) => {
      if (response.status) {
        this.getEvent();
      }
    })
  }

  selectAll(event: any) {
    this.selectAllImage = event.target.checked;

    if (this.selectAllImage) {
      this.selectedImages = this.eventDetail?.event_files.map(img => img.id) || [];
    } else {
      this.selectedImages = [];
    }
  }

  selectImage(event: any, id: any) {
    if (event.target.checked) {
      this.selectedImages.push(id);
    } else {
      this.selectedImages = this.selectedImages.filter(imageId => imageId !== id);
    }
    this.selectAllImage = this.selectedImages.length === (this.eventDetail?.event_files.length || 0);
  }

  deleteImages(id?: any) {
    let imagesToDelete = id ? [id] : this.selectedImages;

    if (imagesToDelete.length == 0) {
      this.toastr.showError("Please Select Image");
      return;
    }

    let confirm = window.confirm(`Are you sure you want to delete image?`);
    if (confirm) {
      const payload = {
        images_id: imagesToDelete
      }
      this.eventService.deleteImages(payload).subscribe((resp: any) => {
        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.getEvent();
        }
      }, (error: any) => {
        this.toastr.showError(error?.error?.message || error?.message)
      })
      this.selectedImages = [];
      this.selectAllImage = false;

      if (imagesToDelete.length == 0) {
        this.selectAllImage = false;
      }
    }
  }

  showImage(id: any) {
    const payload = {
      event_id: this.eventDetail?.id,
      image_id: [id]
    }
    this.eventService.showImage(payload).subscribe((resp: any) => {
      if (resp.status) {
        this.toastr.showSuccess(resp.message);
        this.getEvent();
      } else {
        this.toastr.showError(resp.message);
      }
    }, (error: any) => {
      this.toastr.showError(error?.error?.message || error?.message)
    })
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      this.prevImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    }
  }

  prevImage() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.eventDetail?.event_files.length - 1;
    }
  }

  nextImage() {
    if (this.selectedIndex < this.eventDetail?.event_files.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
  }

  selectImageFromThumbnail(index: number) {
    this.selectedIndex = index;
  }

  setImageOrder() {
    const updatedOrder = this.sortedImages.map((img: any, index: number) =>
      ({ id: img.id, image_order: index })
    );
    this.eventService.updateImageOrder({ mobile_slider_image: updatedOrder }).subscribe(
      (res: any) => {
        if (res?.status) {
          this.toastr.showSuccess(res?.message);
        } else {
          this.toastr.showError(res?.message);
        }
      },
      (error) => {
        this.toastr.showError(error?.error?.message ?? error?.message);
      }
    );
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------





  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------

}
