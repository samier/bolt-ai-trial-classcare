import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from 'src/app/modules/transport-management/transport.service';
import { ExamServiceService } from '../exam-service.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-exam-grade',
  templateUrl: './exam-grade.component.html',
  styleUrls: ['./exam-grade.component.scss']
})
export class ExamGradeComponent {
  constructor(
    private fb: FormBuilder, 
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    private transportService: TransportService,
    private examGradeService: ExamServiceService,
    public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  exam_grade_detail: any = [];
  classes: any = [];
  selectedClasses: any = [];
  classDropdownSettings: IDropdownSettings = {};

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    this.examGradeService.getClassesList().subscribe((res) => {
      this.classes = res;
    }); 

    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';

      this.examGradeService.getExamGradeDetail(this.id).subscribe((res) => { 
        this.exam_grade_detail = res;
        let classess = this.exam_grade_detail?.data?.class; 
        this.selectedClasses = classess;     
        this.form.patchValue({
            name: this.exam_grade_detail?.data?.name,
            status: this.exam_grade_detail?.data?.status,
        });
        let grade_detail = this.exam_grade_detail?.data?.gradedetails;
        let len = grade_detail.length;
        for(let i=0; i<len; i++) {
          this.gradeDetailFieldAsFormArray.removeAt(i);
          let rowData = this.fb.group({
            from_mark: this.fb.control(grade_detail[i].from_mark,[Validators.required, Validators.min(0), Validators.max(200), Validators.pattern('[0-9.]*$')]),
            to_mark: this.fb.control(grade_detail[i].to_mark ,[Validators.required, Validators.min(0), Validators.max(200), Validators.pattern('[0-9.]*$')]),
            grade_value: this.fb.control(grade_detail[i].grade_value,[Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z0-9+ ]*')]),
            remarks: this.fb.control(grade_detail[i].remarks),
            id: this.fb.control(grade_detail[i].id),
          });
          this.gradeDetailFieldAsFormArray.push(rowData);
        }
      });      
    }

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  form = this.fb.group({
    name: ['',[Validators.required]],
    classes: ['',[Validators.required]],
    status: ['active',[Validators.required]],
    grades: this.fb.array([
      this.fb.group({
        from_mark: this.fb.control('',[Validators.required, Validators.min(0), Validators.max(200), Validators.pattern('[0-9.]*$')]),
        to_mark: this.fb.control('',[Validators.required, Validators.min(0), Validators.max(200), Validators.pattern('[0-9.]*$')]),
        grade_value: this.fb.control('',[Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z0-9+ ]*')]),
        remarks: this.fb.control(''),
        id: this.fb.control(''),
      })
    ]),
  });

  get gradeDetailFieldAsFormArray(): any {
    return this.form.get('grades') as FormArray;
  }

  get_from_mark(i:number): any {
    return this.gradeDetailFieldAsFormArray.controls?.[i]?.controls?.from_mark;
  }

  get_to_mark(i:number): any {
    return this.gradeDetailFieldAsFormArray.controls?.[i]?.controls?.to_mark;
  }

  get_grade_value(i:number): any {
    return this.gradeDetailFieldAsFormArray.controls?.[i]?.controls?.grade_value;
  }

  getGradeDetail(): any {
    return this.fb.group({
      from_mark: this.fb.control('',[Validators.required, Validators.min(0), Validators.max(200), Validators.pattern('[0-9.]*$')]),
      to_mark: this.fb.control('',[Validators.required, Validators.min(0), Validators.max(200), Validators.pattern('[0-9.]*$')]),
      grade_value: this.fb.control('',[Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z0-9+ ]*')]),
      remarks: this.fb.control(''),
      id: this.fb.control(''),
    });
  }

  addRowControl(): void {
    this.gradeDetailFieldAsFormArray.push(this.getGradeDetail());
  }

  remove(i: number): void {    
    this.gradeDetailFieldAsFormArray.removeAt(i);
  }

  submit(): void{
    Object.assign(this.form.value, {id:this.id});
    this.examGradeService.saveExamGrade(this.form.value,this.id).subscribe((res:any) => {         
      if(res.status == true) {
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.LIST_EXAM_GRADE)]);
      } else {
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  class_array:any = [];
  onClassSelect() {
  }
}
