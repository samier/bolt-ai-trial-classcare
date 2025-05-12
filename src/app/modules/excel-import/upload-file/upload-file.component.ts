import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { FileimportService } from '../fileimport.service';
import { enviroment } from 'src/environments/environment.staging';
@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})


export class UploadFileComponent {
  submitted:any=false;
  saveDisable:any=false;
  public valid = true;
  selectedClass:any;
  classList:any;
  selectedBatch:any;
  batchList:any;
  private symfonyDomain = enviroment.symfonyDomain;
  urld:any = window.location.origin+'/public/download/sample.xlsx';
  return_result:any = false;
  failed_rows:any = [];
  filedata:any;
  public symfonyHost = enviroment.symfonyHost;

  constructor(
    private fileImportService: FileimportService,private router:Router,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.importform = new FormGroup({
      batch_id: new FormControl(''),
      class_id: new FormControl(''),
      file:new FormControl(''),
    });
  }

  importform: FormGroup;
  ngOnInit() {  
    this.getClassList();    
  }

  onFileChange(event:any) {
    this.filedata = event.target.files[0];;
  }


  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;                        
      const formData = new FormData();
        
      formData.append('file',  this.filedata);
      formData.append('class_id',  this.selectedClass);
      formData.append('batch_id',  this.selectedBatch);
      
      if(this.valid){ //add role
        this.addRecord(formData);
      }      
      return 0;           
  }    

  addRecord(payload:any)
  {
    this.saveDisable = true;
    this.fileImportService.submitFile(payload).subscribe((res:any) => {
      this.saveDisable = false;
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        //this.importform.set('')
        this.importform.reset();
        this.failed_rows = res.data
        console.log(this.failed_rows);
        this.return_result = true;
        this.toastr.showSuccess(res.message);      
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  getClassList(){
    this.fileImportService.getClassList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.classList = res.data;        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  getBatchList(class_id:any){
    this.fileImportService.getBatchList(class_id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.batchList = res.data?.batch;        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  downloadSampleFile(){
    this.fileImportService.getStudentImportSample().subscribe((res:any) => {
        this.downloadFile(res,'Application-report', 'excel');
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf'){
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    }else{
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
  }

  fun(){
    //console.log(this.selectedClass);
    this.getBatchList(this.selectedClass);
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }
}
