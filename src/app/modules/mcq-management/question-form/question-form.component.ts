import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { TransportService } from '../../transport-management/transport.service';
import { enviroment } from '../../../../environments/environment.staging';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent {

  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private mcqService: McqManagementService,
      private transportService: TransportService
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  question: any = [];
  chapters: any = [];
  classes: any = [];
  subjects: any = [];
  selectedClass: any = null;
  selectedSubject: any = null;
  selectedChapter: any = null;
  selectedAnswer: any = null;
  image: any = null;

  ngOnInit(): void {
    this.transportService.getClassesList().subscribe((res:any) => {  
      this.classes = res.data;
    });
    this.id = this.activatedRouteService.snapshot.params['id'];
      if(this.id){
        this.saveBtn = 'Update';
        this.page = 'Edit';
        this.mcqService.getQuestionDetail(this.id).subscribe((res) => {  
          this.question = res;
          this.changeClass(this.question.data.subject.class.id);
          this.changeSubject(this.question.data.subject.id);
          this.form.patchValue({
              class: this.question.data.subject.class.id,
              subject: this.question.data.subject_id,
              chapter: this.question.data.chapter_d,
              question: this.question.data.question,
              solution: this.question.data.solution,
              marks: this.question.data.marks
          });  
        this.image = this.question.data.image;
        this.selectedClass = Number(this.question?.data?.subject?.class?.id??0);
        this.selectedSubject = Number(this.question.data.subject_id??0);
        this.selectedChapter = Number(this.question.data.chapter_d??0);
        this.selectedAnswer = this.question.data.answer;
        this.form.controls.class?.disable();
        this.form.controls.subject?.disable();
        this.form.controls.chapter?.disable();
        const array:any = [];
        if(this.question.data.option_one){
          array.push({'option':this.question.data.option_one});
          // this.addOption();
        }
        if(this.question.data.option_two){
          array.push({'option':this.question.data.option_two});
          this.addOption();
        }
        if(this.question.data.option_three){
          array.push({'option':this.question.data.option_three});
          this.addOption();
        }
        if(this.question.data.option_four){
          array.push({'option':this.question.data.option_four});
          this.addOption();
        }
        if(this.question.data.option_five){
          array.push({'option':this.question.data.option_five});
          this.addOption();
        }
        this.optionArray.setValue(array);
      });
    }
  }

  form = this.fb.group({
    class: ['',[Validators.required]],
    subject: ['',[Validators.required]],
    chapter: ['',[Validators.required]],
    question: ['',[Validators.required]],
    image: [''],
    solution: [''],
    marks: ['',[Validators.required]],
    options: this.fb.array([
      this.fb.group({
        option : this.fb.control('',[Validators.required])
      })
    ]),
  });

  getImage(){
    // return enviroment.symfonyHost.replace(/\/app_dev.php\//gi, "")+'/'+this.image; 
    return this.image; 
  }

  answer(i:number){
    this.selectedAnswer = i;
  }

  get optionArray(): any {
      return this.form.get('options') as FormArray;
  }

  get_option(i:any): any {
      return this.optionArray.controls?.[i]?.controls?.option;
  }

  optionfn(): any {
    return this.fb.group({
        option : this.fb.control('',[Validators.required])
    });
  }

  addOption(): void {
    this.optionArray.push(this.optionfn());
  }

  remove(i: number): void {
    this.optionArray.removeAt(i);
  }

  changeClass(class_id:any){
    this.selectedSubject = null;
    this.selectedChapter = null;
    this.mcqService.getSubjectList(class_id).subscribe((res:any) => {  
      this.subjects = res.data.subject;
    });
  }

  changeSubject(subject_id:any){
    this.selectedChapter = null;
    this.mcqService.getChapters(subject_id).subscribe((res:any) => {  
      this.chapters = res.data;
    });
  }
  
  submit(): void{
    const form = document.getElementById('question-form') as HTMLFormElement;
    const selected = document.querySelector('input[name="id"]:checked');
    if (selected) {
      const formData:FormData = new FormData(form);
      this.mcqService.saveQuestion(formData,this.id).subscribe((res:any) => {  
        if(res.errorList){
          this.toastr.showError(res.errorList[0]);
        }else if(res.error){
          this.toastr.showError(res.error);
        }else{
          this.toastr.showSuccess(res.success);
          this.router.navigate([this.setUrl(URLConstants.QUESTION_LIST)]);  
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
      }); 
    } else {
      this.toastr.showError('please select answer');
    }
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
