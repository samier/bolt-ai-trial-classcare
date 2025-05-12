import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { PollManagementService } from '../poll-management.service';
import { CommonService } from 'src/app/core/services/common.service';

interface Batch {
  id: any;
  name: any;
}

interface Section {
  id: any;
  name: any;
}

@Component({
  selector: 'app-poll-create',
  templateUrl: './poll-create.component.html',
  styleUrls: ['./poll-create.component.scss']
})
export class PollCreateComponent {
  
  public userDetails:any = ('; '+document.cookie)?.split(`; user=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  page:string = 'Add';
  saveBtn:string = 'Save';
  acedemicYearId:any = null;
  userId:any = null;
  id:any = null;

  constructor(
    private router: Router,
    private activatedRouteService: ActivatedRoute,
    private fb: FormBuilder,    
    private toastr: Toastr,
    private pollManagementService: PollManagementService,
    private datePipe: DatePipe,
    public CommonService: CommonService
  ) {
    const userDetailsDecodedData = decodeURIComponent(this.userDetails);
    const userDetailsJsonData = JSON.parse(userDetailsDecodedData);
    this.userId = (userDetailsJsonData) ? userDetailsJsonData?.userid : "";
  }  

  sections: any = [];  
  selectedSection: any = [];
  batches: any = [];
  selectedBatches: any = [];
  batchDropdownSettings: IDropdownSettings = {};
  pollOptionCount:number = 0;
  totalOptionCount:number = 1;
  optionsHideShow:string = "hide";
  currentDate:any = null;
  poll_edit_data: any = [];
  editPollData: any = [];
  editOprionsData: any = [];
  editBatchData: any = [];
  editSectionData: any = [];
  batchesArr: Batch[] = [];
  sectionArr: Section[] = [];

  ngOnInit(): void {

    this.pollManagementService.getSectionList(this.sections).subscribe((res: any) => {             
        this.sections = this.sections.concat(res.data);
        // console.log(this.sections);  
        // console.log(res);  
    });

    this.pollManagementService.getBranchList().subscribe((res) => {
      this.batches = res;
    });
    this.pollManagementService.getAcademicYearId().subscribe((res:any) => {
      this.acedemicYearId = (res?.data) ? res?.data : '';
    });

    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id) {      
      this.saveBtn = 'Update';
      this.page = 'Edit';

      this.pollManagementService.getPollRecord(this.id).subscribe((res:any) => { 
        // console.log('Response poll edit : ', res);
        this.poll_edit_data = res?.data;
        this.editPollData = this.poll_edit_data[0];        
        this.editOprionsData = this.poll_edit_data[1];        
        this.editBatchData = this.poll_edit_data[2];
        this.editSectionData = this.poll_edit_data[3];
        
        for(let batchData of this.editBatchData) {
          const batch: Batch = {id:batchData?.pivot?.batch_id, name:batchData?.name};
          this.batchesArr.push(batch);
        }      
        this.selectedBatches = this.batchesArr;

        for(let sectionData of this.editSectionData) {
          const section: Section = {id:sectionData?.pivot?.section_id, name:sectionData?.name};
          this.sectionArr.push(section);
        } 
             
        let sections_val = this.sectionArr[0].id;
        // this.sections = this.sectionArr;
        console.log(this.sectionArr);
        console.log(this.sectionArr[0].id);

        this.form.patchValue({
            title: this.editPollData?.title,
            description: this.editPollData?.description,
            status: this.editPollData?.status,  
            section: sections_val,      
            start_date: this.editPollData?.start_date,
            end_date: this.editPollData?.end_date,
            poll_for: this.editPollData?.poll_for,
            show_result: this.editPollData?.show_result,
        });

        if(this.editPollData?.type == 0 || this.editPollData?.type == 2) {
          this.form.patchValue({
            type: this.editPollData?.type,
          });

          this.getOptionFormArray.removeAt(0);
          for(let optionsData of this.editOprionsData) {            
            let rowData = this.fb.group({
              ans: this.fb.control(optionsData?.ans,[Validators.required]),
              type: this.fb.control(optionsData?.type),
            });
            //console.log("ngoninit option : ", optionsData?.ans);
            this.getOptionFormArray.push(rowData);
          }
        } else if(this.editPollData?.type == 1) {
          this.form.patchValue({
            type: this.editPollData?.type,
          });
          this.clearValidatorsForFormControl(this.editPollData?.type);
        }
      });
    }

    this.batchDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
  }

  

  form = this.fb.group({
    title: ['',[Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z0-9 ]*')]],
    description: ['',[Validators.required]],
    status: ['1',[Validators.required]],    //0=inactive,1=active
    start_date: ['',[Validators.required]],
    end_date: ['',[Validators.required]],
    poll_for: ['0',[Validators.required]], //0=student,1=faculty,2=both 
    show_result: ['1',[Validators.required]], //0=no,1=yes
    section: ['',[Validators.required]],
    batch: ['',[Validators.required]],
    type: ['',[Validators.required]], //0=default,1=textbox,2=both
    options: this.fb.array([
      this.fb.group({
        ans: this.fb.control('',[Validators.required]),
        type: this.fb.control('0'),
      })
    ]),
  });

  get getOptionFormArray(): any {
    return this.form.get('options') as FormArray;
  }
  get_ans(i:number): any {
    return this.getOptionFormArray.controls?.[i]?.controls?.ans;
  }
  get_type(i:number): any {
    return this.getOptionFormArray.controls?.[i]?.controls?.type;
  }
  getOptionArray(): any {
    return this.fb.group({
      ans: this.fb.control('',[Validators.required]),
      type: this.fb.control('0'),
    });
  }
  addTextboxControl(): void {
    this.totalOptionCount += 1;
    this.getOptionFormArray.push(this.getOptionArray());
    //console.log("form controll : ", this.totalOptionCount);
  }
  remove(i: number): void { 
    this.totalOptionCount -= 1;  
    this.getOptionFormArray.removeAt(i);
    //console.log("remove options : ", this.totalOptionCount);
  }

  
  onPollTypeOptionsSelected(event:any) {
    const value = event.target.value;
    //console.log("current selected option : ", value);
    if(value == 0) {
      this.pollOptionCount = 10;
      this.removeAllOptions(0);
      this.clearValidatorsForFormControl(2);
    } else if(value == 2) {
      this.pollOptionCount = 9;
      this.removeAllOptions(0);
      this.clearValidatorsForFormControl(2);
    } else if(value == 1) {
      this.removeAllOptions(1);
      this.pollOptionCount = 0;
    } else {
      this.pollOptionCount = 0;
      this.removeAllOptions(1);
    }
  }

  removeAllOptions(status:number): void {
    //console.log("Calling option", this.totalOptionCount);
    while (this.getOptionFormArray.length > 1) {
      this.getOptionFormArray.removeAt(0);
      //console.log("Checking list value" ,this.getOptionFormArray.length);
    }
    if(status == 1) {
      this.clearValidatorsForFormControl(1);
    }
  }

  clearValidatorsForFormControl(status:number) {
    const optionsArray = this.form.get('options') as FormArray;
    const firstOptionGroup = optionsArray.at(0) as FormGroup;
    const ansControl = firstOptionGroup.get('ans');

    if(status == 1) {
      ansControl && ansControl.clearValidators();
    } else if(status == 2) {
      ansControl && ansControl.setValidators([Validators.required]);
    }

    if(ansControl) {
      ansControl.updateValueAndValidity();
      ansControl.setValue('');
    }
  }

  //start_date validate for only current and future date
  startDateChange(event:any) {
    const selectedDate = event.target.value;
    if(selectedDate < this.currentDate) {
      event.target.value = "";
      //console.log("date issue :", event.target);
      this.form.patchValue({
        start_date: ""
      });
      this.toastr.showError("start date only current or future date");
    }
  }

  batch_array:any = [];
  submit() {
    this.batch_array = this.form.value.batch;
    let batch_ids = this.batch_array.map((item:any) => item.id);
    let section_id = this.form.value.section;
    Object.assign(this.form.value, { 
      section_id: section_id,     
      batches:batch_ids,
      academic_year_id:this.acedemicYearId,
      user_id:this.userId,
      date:this.currentDate
    });
    //console.log('Form data 1:', this.form.value);
    var form_data = this.form.value;
    if(this.form.value.type == '1') {
      const { options, ...formDataWithoutOptions } = this.form.value;
      //console.log('Form data without options:', formDataWithoutOptions);
      form_data = formDataWithoutOptions;
    }
    //console.log('Form data new:', form_data);
    this.pollManagementService.savePollData(form_data,this.id).subscribe((res:any) => {         
      //console.log('Response:', res);
      if(res.status == true) {
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.POLL_LIST)]);
      } else {
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      console.log('Response error:', err);
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  sectionChange()
  { 
      this.pollManagementService.getBatchBySection(this.form.value.section).subscribe((res: any) => {
      this.batches = res;
      this.selectedBatches = [];
      this.onBatchSelect();
    });
  }

  onBatchSelect() {
  }

}
