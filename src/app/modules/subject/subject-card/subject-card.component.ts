import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { subjectService } from '../subject.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-subject-card',
  templateUrl: './subject-card.component.html',
  styleUrls: ['./subject-card.component.scss']
})
export class SubjectCardComponent implements OnInit {
  //#region Public | Private Variables
  
  URLConstants = URLConstants;
  @Input() subject: any
  $destroy: Subject<void> = new Subject<void>();
  @Output() subjectToDelete : EventEmitter<any> = new EventEmitter();
  subjectGroupForm : FormGroup = new FormGroup({})
  isEdit : boolean = false

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    public commonService: CommonService,
    private router: Router,
    private _modalService: NgbModal,
    private _fb : FormBuilder
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    // if (this.subject.is_child_subject) {
    //   this.subjectInitForm(this.subject?.child_subject)
    // }
  }
  
  ngOnDestroy(): void {
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  onEdit(subject: any){
    this.router.navigate([this.commonService.setUrl(URLConstants.ADD_SUBJECT+'/'+subject.id)])
  }

  onDelete(subject: any){
    const confirmation = window.confirm("Are you sure you want to delete subject?");
    if(confirmation){
      this.subjectToDelete.emit(subject);
    }
  }

  openSubjectViewModel(modalName) {
    this._modalService.open(modalName, {
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop',
      size : 'lg'
    });
  }

  closeSubjectViewModel() {
    this._modalService.dismissAll();
  }

  // get subjectArray(): FormArray {
  //   return this.subjectGroupForm.get("subjects") as FormArray
  // }

  // resetColor(index: number) {
  //   this.subjectArray.controls[index].get('color')?.setValue('#000000')
  // }

  // editSubject(index) {
  //   this.isEdit = true
  //   this.subjectArray.controls[index]['controls']['id'].enable();
  //   this.subjectArray.controls[index]['controls']['name'].enable();
  //   this.subjectArray.controls[index]['controls']['color'].enable();
  // }

  // saveSubject(index) {
  //   this.isEdit = false
  //   this.subjectArray.controls[index]['controls']['id'].disable();
  //   this.subjectArray.controls[index]['controls']['name'].disable();
  //   this.subjectArray.controls[index]['controls']['color'].disable();
  // }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  // subjectInitForm(data) {
  //   this.subjectGroupForm = this._fb.group({
  //     subjects: this._subFormArray(data),
  //   });
  // }

  // private _subFormArray(data): FormArray {
  //   const formArry: any = this._fb.array([]);
  //   if (data?.length > 0) {
  //     data.forEach((ele: any, index) => {
  //       formArry.push(this._subArrayGroup(ele, index));
  //     });
  //   }
  //   return formArry;
  // }

  // private _subArrayGroup(data: any, i) {
  //   const fa: FormGroup = this._fb.group({
  //     id: [{value : data?.id ?? '', disabled:true}],
  //     name: [{value : data?.name ?? '', disabled:true}],
  //     color: [{value : data?.color ?? '', disabled:true}],
  //   })
  //   return fa;
  // }

	
  //#endregion Private methods
}