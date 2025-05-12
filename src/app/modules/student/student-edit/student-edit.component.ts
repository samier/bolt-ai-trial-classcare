import {Component, OnInit} from '@angular/core';
import {URLConstants} from 'src/app/shared/constants/routerLink-constants';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {StudentService} from '../student.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Toastr} from 'src/app/core/services/toastr';
import {HttpClient} from '@angular/common/http';


@Component({
  selector: 'app-student-edit',
  templateUrl: './student-edit.component.html',
  styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent implements OnInit {

  URLConstants = URLConstants;
  branchId: any = window.localStorage.getItem("branch");
  public id;


  apiYear = {
    current_branch_id: [this.branchId]
  }

  apiClass = {
    branch_id: [this.branchId],
    academic_id: 36
  }

  apiBatch = {
    branch_id: this.branchId,
    academic_id: 1,
    class_id: 1,
    user_id: 1
  }

  yearList: any[] = []
  yearselected: any

  classList: any[] = []
  classSelected: any

  batchList: any[] = []
  batchSelected: any

  lastShoolList: any[] = []

  lastschoolSelected: any

  academicYearId: any


  submitted: boolean | undefined;
  valid: boolean | undefined;

  editstudentform: FormGroup<{
    // document_for: FormControl<string | null>;
    gr_number: FormControl<string | null>;
    uidNo: FormControl<string | null>;
    rollno: FormControl<string | null>;
    first_name: FormControl<string | null>;
    middle_name: FormControl<string | null>;
    last_name: FormControl<string | null>;
    secondary_first_name: FormControl<string | null>;
    secondary_middle_name: FormControl<string | null>;
    secondary_last_name: FormControl<string | null>;
    phone_number: FormControl<string | null>;
    studentWhatsappNo: FormControl<string | null>;
    email: FormControl<string | null>;
    gender: FormControl<string | null>;
    date_of_birth: FormControl<string | null>;
    age: FormControl<string | null>;
    bloodGroup: FormControl<string | null>;
    birthPlace: FormControl<string | null>;
    birth_taluka: FormControl<string | null>;
    birth_district: FormControl<string | null>;
    religion: FormControl<string | null>;
    nationality: FormControl<string | null>;
    categories: FormControl<string | null>;
    cast: FormControl<string | null>;
    sub_cast: FormControl<string | null>;
    adhaar_number: FormControl<string | null>;
    // guardian details
    father_name: FormControl<string | null>;
    father_number: FormControl<string | null>;
    father_occupation: FormControl<string | null>;
    father_education: FormControl<string | null>;
    mother_name: FormControl<string | null>;
    mother_number: FormControl<string | null>;
    mother_occupation: FormControl<string | null>;
    mother_education: FormControl<string | null>;
    send_sms_number: FormControl<string | null>;
    parentWhatsappNo: FormControl<string | null>;
    parentEmail: FormControl<string | null>;
    // ADRESS DETAILS
    address: FormControl<string | null>;
    sameAddress: FormControl<string | null>;
    currentCity: FormControl<string | null>;
    // ADMISSION DETAILS
    // dropdown baki
    rightToEducation: FormControl<string | null>;
    old_new: FormControl<string | null>;
    student_fees_date: FormControl<string | null>;
    create_at: FormControl<string | null>;
    school: FormControl<string | null>;
    percentage: FormControl<string | null>;
    reference: FormControl<string | null>;
    status: FormControl<string | null>;
    siblingInfo: FormControl<string | null>;
  }>;


  constructor(
    private studentService: StudentService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: Toastr,
    private httpRequest: HttpClient,
    private route:ActivatedRoute
  ) {

    this.id = this.route.snapshot.paramMap.get('id');


    this.editstudentform = new FormGroup({

      // document_for : new FormControl(''),
      gr_number: new FormControl(''),
      uidNo: new FormControl(''),
      rollno: new FormControl(''),

      first_name: new FormControl('', [Validators.required, Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      middle_name: new FormControl(''),
      last_name: new FormControl('', [Validators.required, Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      secondary_first_name: new FormControl(''),
      secondary_middle_name: new FormControl(''),
      secondary_last_name: new FormControl(''),
      phone_number: new FormControl(''),
      studentWhatsappNo: new FormControl(''),
      email: new FormControl(''),
      gender: new FormControl('', [Validators.required]),
      date_of_birth: new FormControl(''),
      age: new FormControl(''),
      bloodGroup: new FormControl(''),
      birthPlace: new FormControl(''),
      birth_taluka: new FormControl(''),
      birth_district: new FormControl(''),
      religion: new FormControl(''),
      nationality: new FormControl(''),
      categories: new FormControl(''),
      cast: new FormControl(''),
      sub_cast: new FormControl(''),
      adhaar_number: new FormControl(''),

      // guardian details
      father_name: new FormControl(''),
      father_number: new FormControl('', [Validators.required]),
      father_occupation: new FormControl(''),
      father_education: new FormControl(''),
      mother_name: new FormControl(''),
      mother_number: new FormControl(''),
      mother_occupation: new FormControl(''),
      mother_education: new FormControl(''),
      send_sms_number: new FormControl('', [Validators.required]),
      parentWhatsappNo: new FormControl(''),
      parentEmail: new FormControl(''),


      // ADRESS DETAILS
      address: new FormControl(''),
      sameAddress: new FormControl(''),
      currentCity: new FormControl(''),


      // ADMISSION DETAILS
      // dropdown baki

      rightToEducation: new FormControl(''),
      old_new: new FormControl(''),
      student_fees_date: new FormControl(''),
      create_at: new FormControl('', [Validators.required]),
      school: new FormControl(''),
      percentage: new FormControl(''),
      reference: new FormControl(''),
      status: new FormControl(''),
      siblingInfo: new FormControl(''),
    });

  }

  ngOnInit(): void {
    // console.log(">>>",this.apiYear)

    this.getAcadamicList(this.apiYear)

    let temp = {
      branch_id: this.branchId
    }
    this.getLastSchool(temp)

    this.studentService.getStudentDetail(this.id).subscribe((res:any) => {
      this.yearselected = res.data.student_data.academic_year_id
      this.editstudentform.get('gr_number')?.setValue(res.data.student_data.gr_number);
      this.editstudentform.get('uidNo')?.setValue(res.data.student_data.uidNo);
      this.editstudentform.get('rollno')?.setValue(res.data.student_data.rollno);
      this.editstudentform.get('first_name')?.setValue(res.data.student_data.first_name);
      this.editstudentform.get('middle_name')?.setValue(res.data.student_data.middle_name);
      this.editstudentform.get('last_name')?.setValue(res.data.student_data.last_name);
      this.editstudentform.get('first_name')?.setValue(res.data.student_data.first_name);
      this.editstudentform.get('secondary_first_name')?.setValue(res.data.student_data.secondary_first_name);
      this.editstudentform.get('secondary_middle_name')?.setValue(res.data.student_data.secondary_middle_name);
      this.editstudentform.get('secondary_last_name')?.setValue(res.data.student_data.secondary_last_name);
      this.editstudentform.get('phone_number')?.setValue(res.data.student_data.phone_number);
      this.editstudentform.get('studentWhatsappNo')?.setValue(res.data.student_data.studentWhatsappNo);
      this.editstudentform.get('email')?.setValue(res.data.student_data.email);
      this.editstudentform.get('gender')?.setValue(res.data.student_data.gender);
      this.editstudentform.get('date_of_birth')?.setValue(res.data.student_data.date_of_birth);
      this.editstudentform.get('age')?.setValue(res.data.student_data.age);
      this.editstudentform.get('bloodGroup')?.setValue(res.data.student_data.bloodGroup);
      this.editstudentform.get('birthPlace')?.setValue(res.data.student_data.birthPlace);
      this.editstudentform.get('birth_taluka')?.setValue(res.data.student_data.birth_taluka);
      this.editstudentform.get('birth_district')?.setValue(res.data.student_data.birth_district);
      this.editstudentform.get('religion')?.setValue(res.data.student_data.religion);
      this.editstudentform.get('nationality')?.setValue(res.data.student_data.nationality);
      this.editstudentform.get('categories')?.setValue(res.data.student_data.categories);
      this.editstudentform.get('cast')?.setValue(res.data.student_data.cast);
      this.editstudentform.get('sub_cast')?.setValue(res.data.student_data.sub_cast);
      this.editstudentform.get('adhaar_number')?.setValue(res.data.student_data.adhaar_number);
      // guardian details
      this.editstudentform.get('father_name')?.setValue(res.data.student_data.father_name);
      this.editstudentform.get('father_number')?.setValue(res.data.student_data.father_number);
      this.editstudentform.get('father_occupation')?.setValue(res.data.student_data.father_occupation);
      this.editstudentform.get('father_education')?.setValue(res.data.student_data.father_education);
      this.editstudentform.get('mother_name')?.setValue(res.data.student_data.mother_name);
      this.editstudentform.get('mother_number')?.setValue(res.data.student_data.mother_number);
      this.editstudentform.get('mother_occupation')?.setValue(res.data.student_data.mother_occupation);
      this.editstudentform.get('mother_education')?.setValue(res.data.student_data.mother_education);
      this.editstudentform.get('send_sms_number')?.setValue(res.data.student_data.send_sms_number);
      this.editstudentform.get('parentWhatsappNo')?.setValue(res.data.student_data.parentWhatsappNo);
      this.editstudentform.get('parentEmail')?.setValue(res.data.student_data.parentEmail);
      // ADRESS DETAILS
      this.editstudentform.get('address')?.setValue(res.data.student_data.address);
      this.editstudentform.get('sameAddress')?.setValue(res.data.student_data.sameAddress);
      this.editstudentform.get('currentCity')?.setValue(res.data.student_data.currentCity);
      // ADMISSION DETAILS
      this.editstudentform.get('rightToEducation')?.setValue(res.data.student_data.rightToEducation);
      this.editstudentform.get('old_new')?.setValue(res.data.student_data.old_new);
      this.editstudentform.get('student_fees_date')?.setValue(res.data.student_data.student_fees_date);
      this.editstudentform.get('create_at')?.setValue(res.data.student_data.create_at);
      this.editstudentform.get('school')?.setValue(res.data.student_data.school);
      this.editstudentform.get('percentage')?.setValue(res.data.student_data.percentage);
      this.editstudentform.get('reference')?.setValue(res.data.student_data.reference);
      this.editstudentform.get('status')?.setValue(res.data.student_data.status);
      this.editstudentform.get('siblingInfo')?.setValue(res.data.student_data.siblingInfo);



    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  onSubmit() {
    // console.log("clicked save btn")
    console.log("data is", this.editstudentform.value)

    this.submitted = true;
    this.valid = true;
    const payload = this.editstudentform.value;

    console.log('is valid', this.editstudentform.valid)

    payload['academic_year'] = this.academicYearId;
    payload['branch_id'] = this.branchId;
    payload['class_id'] = this.classSelected;
    payload['batch_id'] = this.batchSelected;

    console.log('on submit', payload);
    console.log(this.academicYearId, this.branchId, this.classSelected)
    if (this.editstudentform.valid) {
      console.log('aas', this.editstudentform.value);
      this.studentService.updateStudent(this.id,payload).subscribe((res: any) => {
        if (res.status == false) {
          this.toastr.showError(res.message);
        } else {
          this.router.navigate([this.setUrl(URLConstants.STUDENT_LIST)]);
        }
      });
    }
  }

  yearChanged(event: any) {
    this.academicYearId = event;
    this.getClassList(
      {
        branch_id: this.branchId,
        academic_id: event
      }
    )
  }

  classChanged(event: any) {
    this.classSelected = event;
    this.getBatchList({
      academic_id: this.academicYearId,
      class_id: event
    });
    console.log('this.classSelected', this.classSelected)
  }

  batchChanged(event: any) {
    this.batchSelected = event;
  }

  // Acadamic Year data

  getAcadamicList(param: any) {
    this.studentService.getAcadamicYearList(param).subscribe((res: any) => {
      if (res.status) {
        this.yearList = res.data
      }
    });
  }

  // ClassList function
  getClassList(param: any) {
    this.studentService.getClassList(param).subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      }
    });

    // this.getSectionList();
  }

  // Batch List Function
  getBatchList(apiBatch: any) {
    this.studentService.getBatchList(apiBatch).subscribe((res: any) => {
      this.batchList = res.data;
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  getLastSchool(param) {
    this.studentService.getlastSchool(param).subscribe((res: any) => {
      if (res.status) {
        this.lastShoolList = res.data
      }
    });
  }

  lastSchoolChanged() {

  }


}
