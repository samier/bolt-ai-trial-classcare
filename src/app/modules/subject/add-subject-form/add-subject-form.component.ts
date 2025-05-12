import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { subjectService } from '../subject.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-add-subject-form',
  templateUrl: './add-subject-form.component.html',
  styleUrls: ['./add-subject-form.component.scss']
})
export class AddSubjectFormComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  addSubjectForm : FormGroup = new FormGroup({})
  name: any;
  color: any;
  subjectId:any
  subjectData: any
  URLConstants =URLConstants
  deletedSubjectIds:any = [] 
  isDisable = false
  get childSubjectFormArry(): FormArray {
    return this.addSubjectForm.get('child_subject') as FormArray;
  }

  is_loading : boolean = false
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private subjectService : subjectService,
    private activatedRouteService : ActivatedRoute, 
    private toastr: Toastr,
    private router: Router,
    private _formValidationService : FormValidationService
  ) {
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm(null);
    this.subjectId = this.activatedRouteService?.snapshot?.params['id'];

    if(this.subjectId){
      this.getSubjectData();
    }
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  onSave(){
    this.addSubjectForm.markAllAsTouched();
    if (this.addSubjectForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.addSubjectForm);
      this.childSubjectFormArry.controls.forEach((form:any)=>{
        this._formValidationService.getFormTouchedAndValidation(form);
      })
      // this.toastr.showError("Please fill all the required field");
      return
    }
    this.is_loading = true
    const subject = this.addSubjectForm?.value;
    if (!this.addSubjectForm?.value.is_child_subject) {
      subject.child_subject = []
    }
    if(this.subjectId){
      subject.deleted_subject_id = this.deletedSubjectIds
      this.subjectService.updateSubject(subject,this.subjectId).subscribe(
        (res: any) => {
          this.is_loading = false
          if(res?.status){
            this.toastr.showSuccess(res?.message);
            this.router.navigate([this.setUrl(URLConstants.SUBJECT_LIST)]);
          } else {
            this.toastr.showError(res?.message);
          }
        },
        (error: any) => {
          this.is_loading = false
          this.toastr.showError(error?.error?.message ?? error?.message);
        }
      );
    }else{
      this.subjectService.addSubject(subject).subscribe(
        (res: any) => {
          this.is_loading = false
          if(res.status) {
            this.toastr.showSuccess(res?.message)
            this.router.navigate([this.setUrl(URLConstants.SUBJECT_LIST)]);
          } else {
            this.toastr.showError(res?.message)
          }
        }, (error)=> {
          this.is_loading = false
          this.toastr.showError(error?.error?.message ?? error?.message)
        }
      );
    }
  }

  resetColor(index:number | null){
    if (index || index == 0){
      this.childSubjectFormArry.controls[index].get('color')?.setValue('#000000')
    } else {
      this.addSubjectForm.controls['color'].setValue('#000000');
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  public addChildSubject(data=null) {
    this.childSubjectFormArry.push(this._subArrayGroup(data ?? ''));
  }

  public removeChildSubject(index: number,id) {
    this.childSubjectFormArry.removeAt(index);
    this.deletedSubjectIds.push(id)
  }

  subSubjectSelect(event) {
    this.childSubjectFormArry.controls = []
    if(event?.target?.checked){
      const data:any = {}
      this.isDisable = true
      if(this.subjectId){
        data.id = this.subjectId
        data.name = this.subjectData.name
      }
      this.addChildSubject(data);
      this.addChildSubject()
    }
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm(data) {
    this.addSubjectForm = this._fb.group({
      name: [data?.name ?? '',Validators.required],
      color: [data?.color ?? '#000000'],
      is_child_subject : [data?.is_child_subject ?? false],
      child_subject: this._subFormArray(data?.child_subject ?? []),
    })
  }

  private _subFormArray(data: any[]): FormArray<FormGroup> {
    const formArry = new FormArray<FormGroup>([]); 
    data.forEach((inv: any) => {
      formArry.push(this._subArrayGroup(inv)); 
    });
    return formArry;
  }

  private _subArrayGroup(data: any) {
    const fa: FormGroup = this._fb.group({
      id: [data.id ?? null],
      name: [data.name ?? '' ,[Validators.required]],
      color: [data?.color ?? '#000000' ?? '' ,],
    });
    return fa;
  }
	
  getSubjectData(){
      this.subjectService.getSubjectonId(this.subjectId).subscribe(
        (res:any)=>{
          if(res.status) {
            this.subjectData = res.data
            this.initForm( this.subjectData)
            this.isDisable = this.subjectData.is_child_subject ?  false : true 
          } else {
            this.toastr.showError(res.message)
          }
        },
        (error: any) => {
          this.toastr.showError(error?.error?.message ?? error?.message);
        }
      )
  }
  //#endregion Private methods
}
