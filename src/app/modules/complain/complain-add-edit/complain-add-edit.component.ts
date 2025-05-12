import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ComplainService } from '../complain.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute } from '@angular/router';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-complain-add-edit',
  templateUrl: './complain-add-edit.component.html',
  styleUrls: ['./complain-add-edit.component.scss']
})
export class ComplainAddEditComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  addComplainForm: FormGroup = new FormGroup({})
  @ViewChild('file') fileSelect!: ElementRef;

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  branchID : any = window.localStorage.getItem('branch');
  userID : any = window.localStorage.getItem('user_id');
  currentYearID :  any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  id : any = null

  sectionList : any = []
  classList   : any = []
  batchList   : any = []
  studentList : any = []

  priorityList : any = [
    { id : 1 , name:"Low" },
    { id : 2 , name:"Normal" },
    { id : 3 , name:"High" }
  ]

  pageSize : number = 50; 
  currentPage : number = 0;
  users : any = [];
  searchText : any;
  Faculty : any = []
  selectedFaculty = '';
  public selected_id=4;

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private ComplainService : ComplainService,
    private toaster : Toastr,
    private ActiveRoute : ActivatedRoute,
    private validationService: FormValidationService,
    private cdr: ChangeDetectorRef
  ) { 
    this.id = this.ActiveRoute.snapshot.paramMap.get('id');
   }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm()
    this.onSectionChange()
    this.classChange()
    this.batchChange()
    this.getAllStudent()
    if(this.id){
      this.getComplainDetails()
    }
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getComplainDetails(){
    this.ComplainService.getComplainDetails(this.id).subscribe((res:any)=>{
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message )
    })
  }

  handleAddComplain(){

    if(this.addComplainForm.invalid){
      this.validationService.getFormTouchedAndValidation(this.addComplainForm)
      this.toaster.showError("Please fill all the required field")
      return 
    }
    // console.log(">>",this.addComplainForm)

    const payload = {
      title        : this.addComplainForm.controls['tittle'].value,
      description  : this.addComplainForm.controls['description'].value,
      type         : 1 ,
      complain_for : this.addComplainForm.controls['studentF'].value ,
      priority     : this.addComplainForm.controls['priorityF'].value,
      file         : this.addComplainForm.controls['upload'].value
    }

    this.ComplainService.addComplain(payload,this.id).subscribe((res:any)=>{
      // console.log('res: >>', res);
      if(res.status){

      }
      else{
        this.toaster.showError(res.message)
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message )
    })
  }

  // STUDENT DROPDOWN RELATED 

  getAllStudent(){
    this.resetScroll();  
    this.searchText = '';
    this.ComplainService.getAllStudent().subscribe((res:any) => {
     this.Faculty=res.data; 
     this.loadItems();
     if(res.data != undefined){
      this.selectedFaculty = res.data[0]?.id;
      // this.selected_id== res.data[0]?.id;
     }
    }); 
  }

  changeFn(val:any){
    this.searchText = '';
    this.cdr.detectChanges();
    this.searchFilter();
    this.selected_id =val;
  }

  searchFilter(){
    this.resetScroll();
    this.loadItems();
  }
  onScroll(event:any) {
    var Faculty_length = 0;
    if(this.searchText){
      Faculty_length = this.Faculty.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) ).length; 
    }else{
      Faculty_length = this.Faculty?.length;
    }
    if(Faculty_length > 0 && this.users?.length > 0 && this.users?.length < Faculty_length && event.end == this.users?.length){
      this.loadItems();
    }
  }

  loadItems() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    var newItems;
    if(this.searchText){
      newItems = this.Faculty.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) );
      newItems = newItems?.slice(startIndex, endIndex);
    }else{
      newItems = this.Faculty.slice(startIndex, endIndex);
    }      
    this.users = [...this.users, ...newItems];
    this.currentPage++;
  }

  resetScroll(){
    this.pageSize = 50; 
    this.currentPage = 0;
    this.users = [];
  }

  onSectionChange(){

    this.classList   = []
    this.batchList   = []
    this.studentList = []

    this.addComplainForm.controls['classF'].patchValue(null)
    this.addComplainForm.controls['batchF'].patchValue(null)
    this.addComplainForm.controls['studentF'].patchValue(null)

    this.ComplainService.fetchSection().subscribe((res:any)=>{
      if (res.status) {
        this.sectionList = [...this.sectionList, ...res.data];
      }
    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  classChange(){

    this.batchList   = []
    this.studentList = []

    this.addComplainForm.controls['batchF'].patchValue(null)
    this.addComplainForm.controls['studentF'].patchValue(null)

    const payload = {
      academic_year_id : this.currentYearID ,
      branch_id        : this.branchID ,
      userID           : this.userID,
      ...( this.addComplainForm?.value?.sectionF && { sectionID: this.addComplainForm?.value?.sectionF ?? "" } ) ,
    }
    this.ComplainService.fetchClass(payload).subscribe((res:any)=>{
      if(res.status){
        this.classList = res.data;
      }
      else{
        this.toaster.showError(res.message)
      }

    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  batchChange(){

    this.studentList = []

    this.addComplainForm.controls['studentF'].patchValue(null)

    const payload = {
      branchId : this.branchID,
      classes  : this.addComplainForm.controls['classF'].value ?  [ this.addComplainForm.controls['classF'].value ] : []  
      // classes  : this.getID( this.addComplainForm.controls['classF'].value ) || []  
    }
    this.ComplainService.fetchBatch(payload).subscribe((res:any)=>{
      if(res.status){
        this.batchList = res.data
      }
      else{
        this.toaster.showError(res.message)
      }

    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  studentChange(){

    const payload = {
      batches  : this.addComplainForm.controls['batchF'].value ? [ this.addComplainForm.controls['batchF'].value ] : []  
    }
    this.ComplainService.fetchStudent(payload).subscribe((res:any)=>{
      if(res.status){
        this.studentList = res.data
      }
      else{
        this.toaster.showError(res.message)
      }

    },(error:any)=>{
      this.toaster.showError(error?.error?.message || error?.message)
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input?.files as FileList;
    if (files && files?.length > 0) {
      let fileListArray: any = []
      Array.from(files).forEach(file => {
        fileListArray.push(file)
      });
      
      if(fileListArray?.length > 0 && this.addComplainForm.value?.upload?.length > 0){
        const combinedArray = fileListArray?.concat(this.addComplainForm?.value?.upload);

        const uniqueFiles = Array.from(new Set(combinedArray?.map(file => file.name))).map(name => {
          return combinedArray.find(file => file.name === name);
        });
    
        this.addComplainForm.controls['upload'].patchValue(uniqueFiles);
      } else {
        this.addComplainForm.controls['upload'].patchValue(fileListArray);
      }
      this.fileSelect.nativeElement.value = "";

      const fileSize: number = this.getTotalSize()
      if (fileSize > 8) {
        return this.toaster.showError('Total file size cannot exceed more than 8 MB.')
      }
    }
  }

  removeSelectedFile(index) {
    this.addComplainForm?.value?.upload?.splice(index,1)
    this.addComplainForm?.controls['upload'].patchValue(this.addComplainForm.value.upload)
    const fileSize:number  = this.getTotalSize()
    if (fileSize > 8) {
      return  this.toaster.showError('Total file size cannot exceed more than 8 MB.')
    }
  }
  getTotalSize() {
    if (this.addComplainForm.value.upload?.length > 0) {
      const size = this.addComplainForm.value.upload?.map((item: any) => item?.size)?.reduce((acc: number, item: any) => acc + item);
      return size / 1000 / 1000 
    } else {
      return 0
    }
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.addComplainForm = this._fb.group({
      tittle    : ['' ,[Validators.required] ],
      sectionF  : [null],
      classF    : [null],
      batchF    : [null],
      studentF  : [null ,[Validators.required] ],
      priorityF : [1],
      description : ['' ,[Validators.required] ],
      upload      : [ null] ,
    })
  }

  getID(data: any){
    if (data == null || data?.length == 0) {
      return []
    }
    return data.map(item => item.id)
  }
  
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
