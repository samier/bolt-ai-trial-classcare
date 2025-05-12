import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Toastr } from 'src/app/core/services/toastr';
import { TransportService } from '../transport.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-area-create',
  templateUrl: './area-create.component.html',
  styleUrls: ['./area-create.component.scss']
})
export class AreaCreateComponent implements OnInit {
  //#region Public | Private Variables

  @Output() reload = new EventEmitter<any>();
  areaCreate:FormGroup = new FormGroup({})
  @Input() area: any;
  @Input() isEditing: boolean = false;

  isSubmit: boolean = false;
  id : any
  
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: Toastr,
    private transportService: TransportService,
    private route: ActivatedRoute,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
   }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.formInit();

    if (this.isEditing && this.area) {
      this.showDetail(this.area.id);
    }
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  submit()
  {
    this.isSubmit  = true;
    if(this.area?.id)
    {
      this.transportService.updateData(this.areaCreate.value,this.area?.id).subscribe((resp:any) => {        
        if(resp?.success == true)
        {
          this.toastr.showSuccess(resp.message);
          this.modalService.dismissAll()
          this.isSubmit  = false;
          this.reload.emit({});
        }else
        {
          this.toastr.showError(resp.message);
          this.isSubmit  = false;
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        this.isSubmit  = false;
      });
    }else
    {
      this.transportService.submitData(this.areaCreate.value).subscribe((resp:any) => {        
        if(resp?.success == true)
        {
          this.toastr.showSuccess(resp.message);
          this.modalService.dismissAll()
          this.isSubmit  = false;
          this.reload.emit({});
        }else
        {
          this.toastr.showError(resp.message);
          this.isSubmit  = false;
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        this.isSubmit  = false;
      });
    }
  }

  close() {
    this.modalService.dismissAll()
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  formInit(){
    this.areaCreate = this.fb.group({
      name : [null,[Validators.required]],
    })
  }

  showDetail(id)
  {
    this.transportService.showDetail(id).subscribe((resp:any) => {
      this.areaCreate.get('name')?.setValue(resp?.data?.name);
    });
  }

  //#endregion Private methods

}
