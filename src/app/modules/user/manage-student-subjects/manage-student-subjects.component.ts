import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { enviroment } from '../../../../environments/environment.staging';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-manage-student-subjects',
  templateUrl: './manage-student-subjects.component.html',
  styleUrls: ['./manage-student-subjects.component.scss']
})
export class ManageStudentSubjectsComponent {
  submitted:any=false;
  public batch_id:any=0;
  public role:any = 'Admin';
  public valid = true;  
  public tbody:any=[];
  public leave_type_list:any=[];
  public groupId:any;
  public groups:any=[];
  public subjects:any=[];
  console = console;
  public error_message=false;
  public student_list_error=false;
  public class_id:any;
  new_class_id:any;
  symfonyHost = enviroment.symfonyHost;
  // rolecreateform: FormGroup;
  productForm: FormGroup;  
  radioForm: FormGroup;  
  addedLeaveType:any=[];
  URLConstants = URLConstants;
  isLoader : boolean = true
  isSave : boolean = false

  constructor(
      private UserService: UserService,
      private router: Router,
      private route: ActivatedRoute,
      private fb: FormBuilder,
      private toastr: Toastr,
      public commonService : CommonService
  ) {
    this.batch_id = this.route.snapshot.paramMap.get('id');

    this.productForm = this.fb.group({
      oldRecords: this.fb.array([]),
      group_id: new FormControl(),
    });

    this.radioForm = this.fb.group({
      records: this.fb.array([]),
    });

    // this.radioForm = new FormGroup({
    //   rdm: new FormControl(),
    // });
  }

  ngOnInit() {
    //this.setLeaveType();
    this.UserService.getGroupOfSubject(this.batch_id).subscribe((res:any) => {
    this.isLoader = false
    const data = res.data;
    this.class_id = data.course_id;
    this.new_class_id = data.classes_id;
    this.role = data.name;
    this.groupId = data.selected_group;
    this.groups = data.group;

    // Error handling
    if (data.course_id === 0) {
      this.student_list_error = true;
      return;
    } else if (data?.groups?.length == 0) {
      this.error_message = true;
      return;
    }

    this.subjects = data.groups[this.groupId]; // Set subjects of the selected group
    this.populateStudentSubjects(data.students); // Fill student records

    // Initialize radioForm
    this.records().push(this.fb.group({ rdm: [] }));

      // this.role = res?.data?.name;
    },(err:any)=>{
      this.isLoader = false
      this.toastr.showError(err.error.message);
    });      
  }

  populateStudentSubjects(students: any[], overrideSubjectId: any = 0) {
    students.forEach((student) => {
      const selectedSubject = overrideSubjectId !== 0
        ? overrideSubjectId.toString()
        : student.selected_subject_details_group_id;
  
      this.oldRecords().push(
        this.fb.group({
          hidden_id: student.id,
          name: student.full_name,
          rollno: student.rollno,
          optiona_subject_details_group_id: [selectedSubject, Validators.required],
          option_subject : [student.subject_detail_id] // Here already discussed regarding this
        })
      );
    });
  }

  fun2(subjectId: any, i: number) {
    this.oldRecords().clear();  
    this.reloadData(this.groupId, subjectId);
    this.records().controls[i]?.get('rdm')?.patchValue(subjectId.toString())
  }

  records() : FormArray {  
    return this.radioForm.get("records") as FormArray  
  }  

  oldRecords() : FormArray {  
    return this.productForm.get("oldRecords") as FormArray  
  }  
     

  onSubmit() {  
    this.isSave = true
    Object.assign(this.productForm.value,{group_id:this.groupId,class_id:this.new_class_id})
    this.productForm.value.oldRecords.forEach((element:any) => {
      const option_subject = this.subjects.find(ele => ele.subject_detail_group_id == element.optiona_subject_details_group_id)
      element['option_subject'] = option_subject?.subject_detail_id
    });
    this.UserService.storeAssignSubjectToStudent(this.productForm.value).subscribe((res:any) => {
      this.isSave = false
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      if(res.status==true){
        this.toastr.showSuccess(res.message);
      }            
    });    
  } 

  groupChange(){
    this.oldRecords().clear();  
    //console.log(this.groupId);   
    this.reloadData(this.groupId);
  }

  reloadData(group_id: any, id: any = 0) {
    const param = { batch_id: this.batch_id, group_id };
  
    this.UserService.getGroupOfSubjectByGroupId(param).subscribe(
      (res: any) => {
        if (res.status === false) {
          this.toastr.showError(res.message);
          return;
        }
  
        const data = res.data;
        this.tbody = data;
        this.class_id = data.course_id;
        this.new_class_id = data.classes_id;
        this.role = data.name;
        this.groupId = data.selected_group;
        this.groups = data.group;
  
        if (data.course_id === 0) {
          this.student_list_error = true;
          return;
        } else if (!data.groups) {
          this.error_message = true;
          return;
        }
  
        this.subjects = data.groups[this.groupId]; // Set subjects of the selected group
  
        // Clear previous form records before populating
        this.oldRecords().clear();
  
        // Populate student subjects with optional override
        this.populateStudentSubjects(data.students, id);
  
      },
      (err: any) => {
        this.toastr.showError(err.error?.message || 'Failed to load group data.');
      }
    );
  }
  
}
