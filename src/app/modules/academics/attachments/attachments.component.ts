import { Component, OnInit, Input } from '@angular/core';
import { AcademicService } from '../academics.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {
  //#region Public | Private Variables
  @Input() scf:any;

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    public commonService: CommonService,
    public academicService: AcademicService,
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
  getList(){
    this.academicService.getAttachments({scf_id:this.scf?.id}).subscribe((res:any) => {
      this.scf.fees_attachments = res.data;
    })
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
