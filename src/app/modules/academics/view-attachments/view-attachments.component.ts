import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AcademicService } from '../academics.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-view-attachments',
  templateUrl: './view-attachments.component.html',
  styleUrls: ['./view-attachments.component.scss']
})
export class ViewAttachmentsComponent implements OnInit {
  //#region Public | Private Variables
  scf:any;
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public academicService: AcademicService,
    public modalRef: NgbActiveModal,
    public toastr: Toastr
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
  closeModal() {
    this.modalRef.dismiss();
  }

  deleteAttachement(file:any){
    file.deleting = true;
    
    const params = {
      attachment_id : file.id,
      scf_id : this.scf?.id,
    };

    this.academicService.deleteAttachement(params).subscribe((response:any) => {
      file.deleting = false;
      if(response.status){
        this.toastr.showSuccess(response.message);
        this.scf.fees_attachments = response.data;
      }else{
        this.toastr.showError(response.message);
      }
    },(error:any)=>{
        this.toastr.showError(error.error.message);
    });
  }
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  //#endregion Private methods
}
