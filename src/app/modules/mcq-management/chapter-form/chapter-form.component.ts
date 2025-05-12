import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { McqManagementService } from '../mcq-management.service';
import { TransportService } from '../../transport-management/transport.service';

@Component({
  selector: 'app-chapter-form',
  templateUrl: './chapter-form.component.html',
  styleUrls: ['./chapter-form.component.scss']
})
export class ChapterFormComponent {

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
  chapter: any = [];
  classes: any = [];
  subjects: any = [];
  selectedClass: any = null;
  selectedSubject: any = null;
  form :FormGroup = new FormGroup({});
  

  ngOnInit(): void {
    this.initForm()
    this.classList();
    // this.transportService.getClassesList().subscribe((res:any) => {  
    //   this.classes = res.data;
    // })
    this.id = this.activatedRouteService.snapshot.params['id'];
      if(this.id){
        this.saveBtn = 'Update';
        this.page = 'Edit';
        this.mcqService.getChapterDetail(this.id).subscribe((res) => {  
          this.chapter = res;
          this.changeClass(this.chapter.data.subject.class.id);
          this.form.patchValue({
              class: this.chapter.data.subject.class.id,
              subject: this.chapter.data.subject_id
          });  
        this.selectedClass = Number(this.chapter?.data?.subject?.class?.id??0);
        this.selectedSubject = Number(this.chapter.data.subject_id??0);
        this.chapterArray.setValue([{"txtChapterName" : this.chapter.data.chapter_name}]);
      //   this.form.controls.class?.disable();
      //   this.form.controls.subject?.disable();
      // });
    })
  }
}

  initForm() {
    this.form = this.fb.group({
      class: [null,[Validators.required]],
      subject: [null,[Validators.required]],
      chapter: this.fb.array([
        this.fb.group({
          txtChapterName : this.fb.control('',[Validators.required ])
        })
      ]),
    });
  }

  

  get chapterArray(): any {
      return this.form.get('chapter') as FormArray;
  }

  get_chapter(i:any): any {
      return this.chapterArray.controls?.[i]?.controls?.txtChapterName;
  }

  chapterfn(): any {
    return this.fb.group({
        txtChapterName: this.fb.control('',[Validators.required]),
    });
  }

  addChapter(): void {
    this.chapterArray.push(this.chapterfn());
  }

  remove(i: number): void {
    this.chapterArray.removeAt(i);
  }

  changeClass(class_id:any){
    this.selectedSubject = null;
    this.mcqService.getSubjectList(class_id).subscribe((res:any) => {  
      this.subjects = res.data.subject;
    });
  }

  classList(){
    this.mcqService.getClass({}).subscribe((res:any)=>{
      this.classes = res.data
    })
  }

  getSubjectList(){
    this.subjects=[]
    this.form.controls['subject'].patchValue(null)

    this.mcqService.getSubjectList(this.form.value.class ).subscribe((res:any)=>{
      if(res.status){
        this.subjects = res.data.subject;
      }
    })
  }

  submit(): void{
    if (this.form.invalid) {
      // this.chapterForm.markAllAsTouched();
      this.toastr.showError("Please fill all required fields.");
      return;
    }
    const form = document.getElementById('chapter-form') as HTMLFormElement;
    const formData:FormData = new FormData(form);
    
    formData.append('chapter_id',this.id??null);
    formData.append('txtChapterName',this.get_chapter(0).value);
    formData.append('subjectName[subject]',this.form.value.subject?.toString() ?? '');
    formData.append('class', this.form.value.class?.toString() ?? '');
    this.mcqService.saveChapter(formData,this.id).subscribe((res:any) => {  
      if(res.error){
        this.toastr.showError(res.error);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.CHAPTER_LIST)]);  
      }
    },
    (err: any) => {
      if (err.message) {
        this.toastr.showError(err?.error?.message);
      } 
     }
    ); 
  }
  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}


