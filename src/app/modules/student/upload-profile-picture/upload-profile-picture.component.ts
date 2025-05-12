import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Toastr } from 'src/app/core/services/toastr';
import { StudentService } from "../student.service";
import { WebcamModalComponent } from '../webcam-modal/webcam-modal.component';

@Component({
  selector: 'app-upload-profile-picture',
  templateUrl: './upload-profile-picture.component.html',
  styleUrls: ['./upload-profile-picture.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UploadProfilePictureComponent implements OnInit {
  //#region Public | Private Variables
  image_for:any;
  student:any;
  loader:boolean = false;
  image64Data:any = null;
  imgType: 'file' | 'webcam' | undefined
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public studentService: StudentService,
    public modalRef: NgbActiveModal,
    public toastr: Toastr,
    private modalService: NgbModal,
  ) {}
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  closeModal() {
    this.modalRef.close(false);
  }

  onFileSelected(event: Event): void {
    this.image64Data = null;
    this.imgType = 'file'
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.image64Data = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture(){
    this.loader = true;
    let formData:any;
    if(this.imgType === 'webcam') {
      formData = new FormData();
      formData.append('student_id',this.student?.id);
      formData.append('image_for',this.image_for);
      formData.append('image_type','webcam');
      formData.append('image',this.image64Data);
    } else {
      const form = document.getElementById('profileForm') as HTMLFormElement;
      formData = new FormData(form);
      formData.append('student_id',this.student?.id);
      formData.append('image_for',this.image_for);
      formData.append('image_type','upload_file');
    }
    this.studentService.uploadProfilePicture(formData).subscribe((response:any) => {
      this.loader = false;
      if(response.status){
        this.toastr.showSuccess(response.message);
        this.modalRef.close(true);
      }else{
        this.toastr.showError(response.message);
      }
    },(error:any)=>{
      this.loader = false;
      this.toastr.showError(error.error.message);
    });
  }

  openWebcamModal(){
    const form = document.getElementById('profileForm') as HTMLFormElement;
    form.reset()
    this.image64Data = null;
    this.imgType = 'webcam'
    const webcamModalRef = this.modalService.open(WebcamModalComponent,{
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
    webcamModalRef.componentInstance.controlName = null;
    webcamModalRef.result.then((response: any) => {
      if(response?.image64) {
        this.image64Data = response?.image64
        this.imgType = 'webcam'
      } else {
        this.image64Data = null;
        this.imgType = 'webcam'
      }
    })
  }
  //#endregion Public methods
  
}
