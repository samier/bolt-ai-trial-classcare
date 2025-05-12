import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultService } from '../../result.service';
import { Location } from '@angular/common';
import { Toastr } from 'src/app/core/services/toastr';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-subject-setup',
  templateUrl: './subject-setup.component.html',
  styleUrls: ['./subject-setup.component.scss']
})
export class SubjectSetupComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  id:any;
  data: any = [];
  marks_type:number = 0; // default none
  loading:boolean = false;
  saving:boolean = false;
  timeoutId :any = null
  @Output() next:any = new EventEmitter<any>();
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public commonService: CommonService,
    private resultService: ResultService,  
    private activatedRoute : ActivatedRoute,
    private toastr : Toastr,
    private router : Router,
    private location: Location,  
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id') || null
    this.getSubjectSetupDetail();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getSubjectSetupDetail(){
    this.loading = true;
    this.data = null;
    this.resultService.getSubjectSetupDetail({mark_sheet_classes_id:this.id}).subscribe((response:any)=>{
      if(response.status){
        this.orderData(response.data).then(orderedData => {
          this.data = orderedData;
        })
        .catch(error => {
          console.error('Error ordering data:', error);
        });
      }else{
        this.toastr.showError('Invalid Request');
        // this.location.back();
      }
      this.loading = false;
    },(error:any)=>{
      this.loading = false;
      this.toastr.showError('Invalid Request');
      // this.location.back();
    })
  }

  // UPDATE THE DATA OBJECT 
  handleRowChange(section: any, subjectID: any, examId: number, event: any) {

    const subject : any = section?.subjects?.find((subject: any) => subject?.id === subjectID);
    
    if (subject) {

      const exam : any = subject?.exams?.find((exam: any) => exam?.id === examId);

      let is_Hundred : number = 0
      
      subject?.exams?.forEach((exam:any) => {
        if(exam?.has_exam){
          is_Hundred  += Number(exam?.conversionRatio)
        }
      });
      is_Hundred =  is_Hundred - Number(exam?.conversionRatio) + Number(event.target.value)
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        if (exam) {
          exam.conversionRatio = event.target.value;
          exam.convertedMarks = event.target.value;
        }
        if(is_Hundred != subject.totalMarks){
          this.toastr.showError(`Subject ${subject?.name} Conversion Ratio sum should be equal to section marks`);
          return 
        }

        this.timeoutId  = null
      }, 1000);
    }
  }
  
  
  handleConversionRate(section:any,examId:number,event:any){
    section?.subjects?.forEach((subject:any)=>{
      subject?.exams?.forEach((exam:any)=>{
        if(examId == exam.id){
          exam.convertedMarks = event.target.value;
          exam.conversionRatio = event.target.value;
        }
      })
    })

    var sum = 0;
    section?.subjects?.[0]?.exams?.forEach((exam:any)=>{
      sum += Number(exam?.convertedMarks);  
    });
    const sememster_marks = Number(section?.subjects?.[0]?.totalMarks);
    if(sememster_marks < sum){
      this.toastr.showError('Conversion Ratio sum should be equal to section marks');
    }
  }

  save(){
    try{
      this.data?.section_details?.forEach((section:any)=>{
        var sum = 0;
        section?.subjects?.[0]?.exams?.forEach((exam:any)=>{
          if(exam.name == '' || exam.name == undefined || exam.name == null){
            throw new Error('Exam name is required');
          }
          sum += Number(exam?.convertedMarks);  
        })
        const sememster_marks = Number(section?.subjects?.[0]?.totalMarks);
        if(sememster_marks != sum){
            throw new Error('Conversion Ratio sum should be equal to section marks');
        }
        section?.subjects?.forEach((subject:any)=>{
          if(subject.selected && (+subject.totalMarks < +subject.passingMarks || +subject.passingMarks < 0)){
            throw new Error('Invalid Passing Marks for '+subject.name+' in '+section.section_name);
          }
        });

        const isSectionSelectionCheck =  section?.subjects?.map(ele => ele.selected);
        const iscoScolastickSelectionCheck = this.data?.CoScholastic?.subjects?.map(ele => ele.selected);
        
        if (!isSectionSelectionCheck.includes(true) || (iscoScolastickSelectionCheck ? !iscoScolastickSelectionCheck.includes(true): false)) {
          throw new Error('Please select atleast one subject in both section');
        } 

        const passingMarkCheck =  section?.subjects?.map(ele => ele.passingMarks);

        if (passingMarkCheck.includes(null)) {
          throw new Error('Please enter passing mark for all subjects.');
        }

      })

      // CHECK IF RATIO IS 100 OR NOT , IF NOT THEN DO NOT CALL API ( INVALID ) 
      this.data?.section_details?.forEach(section => {
        section?.subjects?.forEach(subject => {

          if(subject?.selected){
            let is_Hundred : any = 0
            subject?.exams?.forEach(exam => {
              if(exam?.has_exam){
                is_Hundred +=  Number(exam?.conversionRatio)
              }
            });
            if(is_Hundred != subject.totalMarks){
              throw new Error(`Subject ${subject?.name} Conversion Ratio sum should be equal to section marks.`);
            }
          }
        });
      });

      this.saving = true;

      var params = {
        mark_sheet_classes_id : this.id,
        section_details : this.data?.section_details?.slice()
      };

      if(this.data?.CoScholastic.id) {
        params.section_details.push(this.data?.CoScholastic);
      }

      if(this.data?.skill_subjects.id) {
        params.section_details.push(this.data?.skill_subjects);
      }

      this.resultService.saveSubjectSetupDetail(params).subscribe((response:any)=>{
        if(response.status){
          this.toastr.showSuccess(response?.message);
          this.next.emit();
        }else{
          this.toastr.showError(response?.message);
        }
        this.saving = false;
      },(error:any)=>{
        this.saving = false;
        this.toastr.showError(error?.message??error?.error?.message);
      })
    }catch(error:any){
      this.toastr.showError(error.message);
    }
  }

  dropRow(section:any,event: CdkDragDrop<any>) {
    moveItemInArray(section, event.previousIndex, event.currentIndex);
  }

  dropColumn(section:any, event: CdkDragDrop<any[]>, columnIndex: number) {
    if(event?.distance?.x < -200 && columnIndex > 0){
      section.subjects.forEach(subject => {
        moveItemInArray(subject.exams, columnIndex, columnIndex-1);
      });
    }else if(event?.distance?.x > 200 && columnIndex < (section?.subjects[0]?.exams?.length - 1)){
      section.subjects.forEach(subject => {
        moveItemInArray(subject.exams, columnIndex, columnIndex+1);
      });
    }
  }

  async orderData(data:any){
    if (data?.section_details) {
      for (const section of data.section_details) {
        await this.orderSubject(section);
      }
    }

    if (data?.CoScholastic.id) {
      await this.orderSubject(data.CoScholastic);
    }
    return data;

  }
  
  orderSubject(section:any){
    const subjects = section.subjects;
    const rearrangedSubjects = new Array(subjects.length).fill(undefined);
    subjects.forEach(subject => {
      if (subject.row_order !== null) {
        this.orderExam(subject);
        rearrangedSubjects[subject.row_order] = subject;
      }
    });
    let nullIndex = 0;
    subjects.forEach(subject => {
      if (subject.row_order === null) {
        while (rearrangedSubjects[nullIndex] !== undefined) {
          nullIndex++;
        }
        this.orderExam(subject);
        rearrangedSubjects[nullIndex] = subject;
      }
    });
    section.subjects = rearrangedSubjects;
    return;
  }

  orderExam(subject:any){
    const exams = subject.exams;
    const rearrangedExams = new Array(exams.length).fill(undefined);
    exams.forEach(exam => {
      if (exam.column_order !== null) {
        rearrangedExams[exam.column_order] = exam;
      }
    });
    let nullIndex = 0;
    exams.forEach(exam => {
      if (exam.column_order == null) {
        while (rearrangedExams[nullIndex] !== undefined) {
          nullIndex++;
        }
        rearrangedExams[nullIndex] = exam;
      }
    });
    subject.exams = rearrangedExams;
  }

  handleExamNameChange(section,examId,event,property){
    section?.subjects?.forEach((subject:any)=>{
      subject?.exams?.forEach((exam:any)=>{
        if(examId == exam.id){
          exam[property] = event?.target?.value;
        }
      })
    })
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
	
  //#endregion Private methods
}