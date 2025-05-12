import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { SectionAddEditComponent } from '../section-add-edit/section-add-edit.component';
import { SectionService } from '../section.service';
import {Toastr} from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-section-list',
  templateUrl: './section-list.component.html',
  styleUrls: ['./section-list.component.scss']
})
export class SectionListComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  $destroy: Subject<void> = new Subject<void>();
  homeworkForm : FormGroup = new FormGroup({})
  
  URLConstants = URLConstants;

  sections : any = []

  inputValue : any = ''
  filteredData : any = []

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private _modalService : NgbModal,
    private SectionService : SectionService,
    private toaster: Toastr,
  ) {}
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.fetchSection()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  addEditBatch( isEdit:boolean = false , section:any={} ) {
    const modalRef = this._modalService.open(SectionAddEditComponent,{
      size: 'md',
      // centered: true,
      // backdrop: 'static',
      windowClass: 'duplicate-modal-section',
      backdropClass: 'duplicate-modal-backdrop',
      backdrop: true,
    });
    modalRef.componentInstance.isEdit = isEdit
    modalRef.componentInstance.section = section

    modalRef.result.then((response: any) => {
      if(response.status) {
        this.fetchSection()
      }
    })
  }

  filteredFun(){
    const inputValue = this.inputValue.toLowerCase();
    return this.sections.filter((section: any) => section.name.toString().toLowerCase().includes(inputValue));
  }

  handleDelete(section: any) {

    const con = confirm(`Are you sure you want to Delete ${section.name} Section`)

    if (con) {

      this.SectionService.deleteSection(section).subscribe((res: any) => {
        if (res.status) {
          this.toaster.showSuccess(res.message)
          this.fetchSection()
        }
        else {
          this.toaster.showError(res.message)
        }
      }, (error: any) => {
        this.toaster.showError(error?.error?.message ?? error?.message)
      })
    }

  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.homeworkForm = this._fb.group({
      name: ['']
    })
  }
  
	fetchSection(){
    this.SectionService.getSectionList().subscribe((res:any)=>{
      if(res.status){
        this.sections = res.data;
      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}