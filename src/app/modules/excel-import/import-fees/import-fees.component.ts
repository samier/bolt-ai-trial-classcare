import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { FileimportService } from '../../excel-import/fileimport.service';
import { enviroment } from 'src/environments/environment.staging';

@Component({
  selector: 'app-import-fees',
  templateUrl: './import-fees.component.html',
  styleUrls: ['./import-fees.component.scss']
})
export class ImportFeesComponent {

  public branch_id = window.localStorage?.getItem("branch");
  submitted:any=false;
  public valid = true;
  selectedYear:any;
  acadmicYearList:any;
  selectedBatch:any;
  batchList:any;
  private symfonyDomain = enviroment.symfonyDomain;
  urld:any = "http://"+this.symfonyDomain+'/public/download/sample.xlsx';
  return_result:any = false;
  failed_rows:any = [];
  filedata:any;
  public symfonyHost = enviroment.symfonyHost;

  constructor(
    private fileImportService: FileimportService,private router:Router,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.importform = new FormGroup({
      class_id: new FormControl(''),
      file:new FormControl(''),
      batch_id: new FormControl(''),
    });
  }

  importform: FormGroup;
  ngOnInit() {  
    this.getAcademicYearList();    
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
      formData.append('academic_id',  this.selectedYear);
      formData.append('batch_id',  this.selectedBatch);
      
      if(this.valid){ //add role
        this.addRecord(formData);
      }      
      return 0;           
  }    

  addRecord(payload:any)
  {
    this.fileImportService.importFeeFile(payload).subscribe((res:any) => {
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
 
  getAcademicYearList(){
    this.fileImportService.getAcademicYearList().subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.acadmicYearList = res.data;        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  selectedAcademicYear(){
    let data = {
      batch_id: this.branch_id,
      academic_year_id : this.selectedYear
    }
    
    this.fileImportService.getBatchListByAcademicYearId(data).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.batchList = res.data;        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }


  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  downloadSampleFile(){
    this.fileImportService.getExport({}).subscribe((res: any) => {
      this.downloadFile(res,'feesSampleFile');
  });
  }

  downloadFile(res: any,file: any) {    
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)    
    let a = document.createElement('a');
    a.download = fileName;
    a.href =  pdfSrc
    a.click();    
  }  
}
