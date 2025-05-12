import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-add-attachment',
  templateUrl: './add-attachment.component.html',
  styleUrls: ['./add-attachment.component.scss']
})
export class AddAttachmentComponent implements OnInit {
  //#region Public | Private Variables
  scf:any = [];
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public modalRef: NgbActiveModal,
    public toastr: Toastr,
  ) {}
  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.scf.title = (this.scf.month??"")+' '+(this.scf.category ? this.scf.category.type_name : 'School Fees');
  }
  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  closeModal(clearFiles = false) {
    if(clearFiles){
      this.scf.files = [];
    }else{
      var error = false;
      this.scf.files.forEach((file:any)=>{
        if(file.file_name == ''){
          error = true;
        }
      })
      if(error){
        return;
      }
    }
    this.modalRef.dismiss();
  }

  remove(event){
    this.scf?.files.splice(this.scf?.files.indexOf(event), 1);
  }

  onFileSelected(event: any) {
    if(this.scf?.files == undefined || !this.scf?.files){
      this.scf.files = [];
    }
    const count = this.scf?.fees_attachments?.length + event.target?.files?.length + this.scf.files?.length;
    if(count > 10){
      this.toastr.showError('You can not select more than '+(10 - this.scf?.fees_attachments?.length)+' images.');
      return;
    }
    for (var i = 0; i < event.target.files.length; i++) { 
      let file =  event.target.files[i]; 
      if (file) {
        if(!['.jpg','.jpeg','.png','.gif','.webp'].some(extension => file.name.endsWith(extension))) {    
          this.toastr.showError("Please select images only");                   
        }else{
          this.previewImage(file).then((preview) => {
            const name = file?.name?.split('.');
            name?.pop();
            this.scf.files.push({ file: file, file_name: name?.join('.'), preview: preview });
          });
        }
      }
    }        
  }

  previewImage(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
      fileReader.readAsDataURL(file);
    });
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
