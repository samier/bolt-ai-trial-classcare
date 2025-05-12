import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { PollManagementService } from '../poll-management.service';

@Component({
  selector: 'app-poll-vote',
  templateUrl: './poll-vote.component.html',
  styleUrls: ['./poll-vote.component.scss']
})
export class PollVoteComponent {

  public userDetails:any = ('; '+document.cookie)?.split(`; user=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  userId:any = null;
  id:any = null;
  currentDate:any = null;
  pollQueData: any = [];
  title: any = null;
  description: any = null;
  optionsData: any = [];
  isOptionType: boolean = false;
  isCustomType: boolean = false;
  isCustomTextbox: boolean = false;
  answerData: any = [];
  alreadyAnswered: boolean = false;
  optionsIdArray: any = [];
  alreadyAnsweredIsCustomAnswer: boolean = false;
  alreadyAnsweredCustomAnsText: string = "";
  notAnsweredAndPollExpired: boolean = false;

  constructor(
    private router: Router,
    private activatedRouteService: ActivatedRoute,
    private fb: FormBuilder,    
    private toastr: Toastr,
    private pollManagementService: PollManagementService,
    private datePipe: DatePipe
  ) {
    const userDetailsDecodedData = decodeURIComponent(this.userDetails);
    const userDetailsJsonData = JSON.parse(userDetailsDecodedData);
    this.userId = (userDetailsJsonData) ? userDetailsJsonData?.userid : "";

    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];

    const dataPayload = {
      date:this.currentDate,
      user_id:this.userId
    }

    if(this.id) {
      this.pollManagementService.getPollOptionsList(dataPayload, this.id).subscribe((res:any) => { 
        //console.log('Response poll : ', res);
        this.pollQueData = res?.data;
        this.description = this.pollQueData?.Description;
        this.title = this.pollQueData?.Title; 
        
        const customAnsTextboxControl = this.form.get('customAnsTextbox');
        const optionQueControl = this.form.get('optionQue');
        if(this.pollQueData.Type == 1) {  //only custom answer
          this.isCustomType = true;
          this.updateValidatorsForFormControl(1, optionQueControl, customAnsTextboxControl);
        } else if(this.pollQueData.Type == 2) {  //both
          this.isCustomType = true;
          this.isOptionType = true;
          this.optionsData = this.pollQueData.Options;
          this.updateValidatorsForFormControl(2, optionQueControl, customAnsTextboxControl);
        } else if(this.pollQueData.Type == 0) {  //only option
          this.isOptionType = true;
          this.optionsData = this.pollQueData.Options;
          this.updateValidatorsForFormControl(0, optionQueControl, customAnsTextboxControl);
        }
        //console.log("Test 1 : ", this.pollQueData[0]);
        if(this.pollQueData[0]) {
          this.answerData = this.pollQueData[0];
          this.alreadyAnswered = true;
          if(this.answerData.Type == 1 && this.pollQueData?.Type == 2) {
            this.alreadyAnsweredIsCustomAnswer = true
            this.alreadyAnsweredCustomAnsText = this.answerData?.Answer;
            this.isCustomTextbox = true;
            //console.log("Answer now : ", this.alreadyAnsweredIsCustomAnswer,this.alreadyAnsweredCustomAnsText, this.isCustomTextbox);
          }
        } else {
          if(this.currentDate > this.pollQueData.poll_end_date) {
            this.notAnsweredAndPollExpired = true;
            //console.log("testing now : ", this.notAnsweredAndPollExpired, this.alreadyAnswered);
            const optionFormCntl = this.form.get('optionQue');
            const customAnsTextboxFormCntl = this.form.get('customAnsTextbox');
            optionFormCntl && optionFormCntl.disable();
            customAnsTextboxFormCntl && customAnsTextboxFormCntl.disable();
          }
        }      
      });
    }
  }

  form = this.fb.group({
    optionQue: ['', [Validators.required]],
    customAnsTextbox: ['', [Validators.required]],
  });

  radioButtonOnClickTextboxHideShow(value:string) {
    this.isCustomTextbox = false;
    const customAnsTextboxControl = this.form.get('customAnsTextbox');
    customAnsTextboxControl && customAnsTextboxControl.clearValidators();    
    if(value == 'custom') {
      this.isCustomTextbox = true;
      customAnsTextboxControl && customAnsTextboxControl.setValidators([Validators.required]);
    }
    if(customAnsTextboxControl) {
      customAnsTextboxControl.updateValueAndValidity();
      customAnsTextboxControl.setValue('');
    }
  }


  updateValidatorsForFormControl(status:number, optinControl:any, customTextboxControl:any) {
    if(status == 1) {
      this.isCustomType = true;
      optinControl.clearValidators();
      customTextboxControl.setValidators([Validators.required]);
    } else if(status == 2) {
      this.isCustomType = true;
      this.isOptionType = true;
      this.optionsData = this.pollQueData.Options;
      optinControl.setValidators([Validators.required]);
      customTextboxControl.setValidators([Validators.required]);
    } else if(status == 0) {
      this.isOptionType = true;
      this.optionsData = this.pollQueData.Options;
      optinControl.setValidators([Validators.required]);
      customTextboxControl.clearValidators();
    }
    optinControl.updateValueAndValidity();
    customTextboxControl.updateValueAndValidity();
  }

  onSubmit() { 
    //console.log("Submit data first : ", this.form.value);
    var payload = {
      ans: '',
      type: '1'
    };   
    if(this.pollQueData?.Type == 1) {  //only custom answer
      payload.ans = this.form.value.customAnsTextbox ?? '';
      Object.assign(this.form.value, {
        answer: payload,
      });
    } else if(this.pollQueData?.Type == 2) { //both
      if(this.form.value.optionQue == "custom_ans") {
        payload.ans = this.form.value.customAnsTextbox ?? '';
        Object.assign(this.form.value, {
          answer: payload,
        });
      } else {
        Object.assign(this.form.value, {
          poll_details_id: this.form.value.optionQue,
        });
      }      
    } else if(this.pollQueData.Type == 0) { //only option
      this.isOptionType = true;
      Object.assign(this.form.value, {
        poll_details_id: this.form.value.optionQue,
      });
    }
    Object.assign(this.form.value, {
      date: this.currentDate,
      user_id: this.userId
    });
    //console.log("Submit last data : ", this.form.value);
    var form_data = this.form.value;
    this.pollManagementService.giveVoteForPoll(form_data,this.id).subscribe((res:any) => {         
      //console.log('Response:', res);
      this.toastr.showSuccess(res?.data?.msg);
      this.router.navigate([this.setUrl(URLConstants.POLL_LIST)]);
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      console.log('Response error:', err);
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
