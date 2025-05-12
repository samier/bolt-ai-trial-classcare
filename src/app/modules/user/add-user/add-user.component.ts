import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { LoaderService } from 'src/app/core/services/loader-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {

  dropdownListBatches:any  = [];
  selectedItemsBatch:any = [];
  dropdownSettingsBatch:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  dropdownListBatch:any  = [];
  submitted:any=false;
  public valid = true;
  public roleList:any;
  selectedRoutePickup:any = '';
  selectedRouteDrop:any='';
  public routes:any;
  public stopListPickup:any;
  public stopListDrop:any;
  public current_address:any=0;
  public status:any;
  public gender:any;
  public permanent_address_display="block";
  public whatsapp_display="block";
  public transport_type:any;
  public whatsapp_no_same_as_phone_no:any=0;
  document_types: any = [];
  public total_size:number=0;
  public file_size_array:string[]=[];
  public joining_date:any;
  public leaving_date:any;
  errors:any;
  private API_URL = enviroment.apiUrl;
  public institute_modules:any = [];
  is_super_admin:boolean = false
  signature:any = null;
  signature_file:any = null

  selectedItems:any = [];
  branchList:any = [];
  BranchDropdownSettings: IDropdownSettings = {};
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  academicDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'year',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  academic_years:any = [];

  constructor(
    private UserService: UserService,private router:Router,private fb:FormBuilder, private toastr: Toastr, private httpRequest: HttpClient,
      private modalService: NgbModal,
      private loaderService: LoaderService, 
  ) {
    this.branch_id = this.router.parseUrl(this.router.url).root.children['primary'].segments[0]['path'];
    let oneyear = this.formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    this.leaving_date=oneyear;
    this.adduserform = new FormGroup({
      first_name: new FormControl('',[Validators.required,Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      last_name: new FormControl('',[Validators.required,Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      gender:new FormControl('',[Validators.required]),
      birth_date:new FormControl('',[Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      email:new FormControl('',[Validators.required,Validators.email]),
      password:new FormControl('',[Validators.required]),
      phone_number:new FormControl('',[Validators.required,Validators.pattern(/^\d{10}$/)]),
      whatsup_number:new FormControl('',[Validators.pattern(/^\d{10}$/)]),
      // role:new FormControl('',[Validators.required]),
      is_active:new FormControl('1',[Validators.required]),
      leaving_date:new FormControl(oneyear),
      joining_date:new FormControl(''),
      alternate_number:new FormControl('',[Validators.pattern(/^\d{10}$/)]),
      employee_number:new FormControl(''),
      designation:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      qualification:new FormControl(''),
      transport_type:new FormControl(''),
      pickup_route:new FormControl(''),
      drop_route:new FormControl(''),
      transport_pick_up_point:new FormControl(''),
      transport_drop_point:new FormControl(''),
      current_address_same_permanent:new FormControl(''),
      no_children:new FormControl(''),
      father_name:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)||""]),
      mother_name:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      blood_group:new FormControl(''),
      current_address:new FormControl(''),
      permanent_address:new FormControl(''),
      marital_status:new FormControl(''),
      spouse_name:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      faculty_goverment_number:new FormControl('',[Validators.pattern(/^[0-9a-zA-Z]*$/)]),
      faculty_type:new FormControl(''),
      aadhaar_card_no:  new FormControl( null , [ ClassCareValidatores.pattern(/^\d{12}$/,"Please enter valid Number") , ClassCareValidatores.min(100000000000, "Please enter minimum 12 digits number") ,ClassCareValidatores.max(999999999999, "Please enter maximum 12 digits number") ] ),
      pan_card_no: new FormControl(null, [
        ClassCareValidatores.pattern(
          /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
          "Please enter a valid 10-character PAN Number (e.g., ABCDE1234F)"
        )
      ]),
      voter_id_no: new FormControl(null, [
        ClassCareValidatores.pattern(
          /^[A-Z]{3}[0-9]{7}$/,
          "Please enter a valid 10-character Voter ID (e.g., ABC1234567)"
        )
      ]),

      whatsapp_no_same_as_phone_no:new FormControl('0'),
      // section:new FormControl(''),
      quantities: this.fb.array([]),
      documents: this.fb.array([]),
      // branches: new FormControl([]),
      // user_type: new FormControl('',[Validators.required]),
      // user_batch: new FormControl(''),
      user_roles: this.fb.array([]),
      is_super_admin: new FormControl(false),
      transport_facility_status : new FormControl(false),
      area_id : new FormControl(null),
      emp_no: new FormControl(''),
    });
  }


  quantities() : FormArray {
    return this.adduserform.get("quantities") as FormArray
  }

  newQuantity(): FormGroup {
    return this.fb.group({
      employer_name: new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      start_date: '',
      end_date:'',
      designation:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      description:'',
    })
  }

  addQuantity() {
    this.quantities().push(this.newQuantity());
  }

  removeQuantity(i:number) {
    this.quantities().removeAt(i);
  }

  get pastEmployeeFieldAsFormArray(): any {
    return this.adduserform.get('quantities') as FormArray;
}

  adduserform: FormGroup;
  ngOnInit()
  {
    this.getAreaList();
    if(!isNaN(this.branch_id)){
      let super_admin_checkbox:any = document.querySelector('input[name=is_super_admin]')
      super_admin_checkbox.disabled = true;
    }
    this.loaderService.setLoading(false)
    this.getBranchList();
    this.BranchDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'branchName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.httpRequest.get(this.API_URL+'api/get-institute-modules').subscribe((res:any) => {
      this.institute_modules = res.data;
      if(this.getInstituteModule('Transport')){
        this.UserService.getRouteList().subscribe((res:any) => {
          this.routes=res.data;
        },(err:any)=>{
          this.toastr.showError(err.error.message);
        });
      }
    });

    this.UserService.getBatchList().subscribe((res:any) => {
      //console.info(res.data);
      this.dropdownListBatches=res.data;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
    this.selectedItemsBatch = [];
    this.userRoleFieldAsFormArray.push(this.user_role());
    if(this.branch_id != 'user'){
      this.getSectionList(this.branch_id, 0);
      this.getAcademicYear(0, this.branch_id);
      this.getRoleList(this.branch_id, 0)
    }
  }


  getRoleList(branch_id:any, i:any){
    this.UserService.getRoleList(branch_id).subscribe((res:any) => {
      let roles:any
      if(!isNaN(this.branch_id)){
        roles = res.data.filter((x:any) => {
          return x.role != 'ROLE_ADMIN'
        })
      }else{
        roles = res.data
      }
      this.userRoleFieldAsFormArray.controls[i].controls.roles = roles;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  onItemSelect(item: any) {
    // this.getBatchList(this.selectedItems);
  }
  // onSelectAll(items: any) {
  //   // this.getBatchList(items);
  // }
  onItemDeSelect(item:any){
    // this.getBatchList(this.selectedItems);
  }

  onItemDeSelectAll(item:any){

  }

  getBatchList(branch_id:any){
    this.UserService.getBatchList().subscribe((res:any) => {
      this.dropdownListBatch = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
    // this.getSectionList();
  }

  routeChangePickup(){
    this.getStopList(this.selectedRoutePickup,'pickup');
  }

  routeChangeDrop(){
    this.getStopList(this.selectedRouteDrop,'drop');
  }

  getStopList(id:any,type:any){
    this.UserService.getStopList({route_id:id}).subscribe((res:any) => {
      if(type=='pickup'){
        this.stopListPickup = res.data;
      }
      else{
        this.stopListDrop = res.data;
      }
    });
  }
  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;
      const payload = this.adduserform.value;
      if(this.valid){ //add role

        const form = document.getElementById('user-form') as HTMLFormElement;
        const formData:FormData = new FormData(form);
        formData.append("leaving_date",this.leaving_date);
        formData.append("whatsapp_no_same_as_phone_no",this.whatsapp_no_same_as_phone_no);
        formData.append("current_address_same_permanent",this.current_address);
        formData.append("user_type",this.adduserform.get('user_type')?.value);
        formData.append("user_batch",JSON.stringify(this.selectedItemsBatch));
        formData.append("section",JSON.stringify(this.selectedItems));
        formData.append("branches",JSON.stringify(this.adduserform.value.branches));
        formData.append("user_roles",JSON.stringify(this.adduserform.value.user_roles));
        formData.append("is_super_admin",JSON.stringify(this.is_super_admin));
        formData.append("signature",(this.signature_file == null ? '' : this.signature_file));
        formData.append("transport_facility",this.transport_facility);      
        formData.append("area_id",this.adduserform.value.area_id);    
        formData.append("joining_date",this.adduserform.value.joining_date);
        formData.append("leaving_date",this.adduserform.value.leaving_date);
        formData.append("birth_date",this.adduserform.value.birth_date);
        formData.append("transport_facility",this.transport_facility);      
        formData.append("area_id",this.adduserform.value.area_id);   
        formData.append("aadhaar_card_no",this.adduserform.value.aadhaar_card_no ?? "");  
        formData.append("pan_card_no",this.adduserform.value.pan_card_no ?? "");  
        formData.append("voter_id_no",this.adduserform.value.voter_id_no ?? "");   
       this.addUser(formData);
      }
      return 0;
  }

  addUser(payload:any)
  {
    this.UserService.addUser(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        if(isNaN(this.branch_id)){
          this.router.navigate([this.setUrl(URLConstants.ADMIN_USER_LIST)]);
        }else{
          this.router.navigate([this.setUrl(URLConstants.USER_LIST)]);
        }
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  setUrl(url:string) {
    if(isNaN(this.branch_id)){
      return '/'+url;
    }else{
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
  }
  formatDate(date:any) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
  }

  sameAddress(){
    if(this.current_address==1){
      this.permanent_address_display="none";
    }else
    this.permanent_address_display="block";
  }

  sameWhatsappNo(){
    if(this.whatsapp_no_same_as_phone_no==1){
      this.whatsapp_display="none";
    }else
    this.whatsapp_display="block";
  }


  get_transport_mode(event:any){
    this.transport_type=event;
    this.adduserform.controls['pickup_route'].clearValidators();
    this.adduserform.controls['transport_pick_up_point'].clearValidators();
    this.adduserform.controls['drop_route'].clearValidators();
    this.adduserform.controls['transport_drop_point'].clearValidators();
    if(event == 'one way pickup'){
      this.adduserform.controls['pickup_route'].setValidators([Validators.required]);
      this.adduserform.controls['transport_pick_up_point'].setValidators([Validators.required]);
    }
    if(event == 'one way drop'){
      this.adduserform.controls['drop_route'].setValidators([Validators.required]);
      this.adduserform.controls['transport_drop_point'].setValidators([Validators.required]);
    }
    if(event == 'two way transport'){
        this.adduserform.controls['pickup_route'].setValidators([Validators.required]);
        this.adduserform.controls['transport_pick_up_point'].setValidators([Validators.required]);
        this.adduserform.controls['drop_route'].setValidators([Validators.required]);
        this.adduserform.controls['transport_drop_point'].setValidators([Validators.required]);
      }

    this.adduserform.controls['pickup_route'].updateValueAndValidity();
    this.adduserform.controls['transport_pick_up_point'].updateValueAndValidity();
    this.adduserform.controls['drop_route'].updateValueAndValidity();
    this.adduserform.controls['transport_drop_point'].updateValueAndValidity();
  }

get documentFieldAsFormArray(): any {
    return this.adduserform.get('documents') as FormArray;
}

get_designation(i:any): any {
  return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.designation;
}
get_employer_name(i:any): any {
  return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.employer_name;
}

get_start_date(i:any): any {
  return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.start_date;
}

get_end_date(i:any): any {
  return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.end_date;
}

get_document_type(i:any): any {
    return this.documentFieldAsFormArray.controls?.[i]?.controls?.document_name;
}

get_document(i:any): any {
    return this.documentFieldAsFormArray.controls?.[i]?.controls?.document;
}

get_same_address(): any {
    return this.adduserform.value.same_address === 'No';
}

document(): any {
  return this.fb.group({
      document: this.fb.control('',[Validators.required]),
      document_name: this.fb.control(''),
  });
}

addDocument(): void {
  this.documentFieldAsFormArray.push(this.document());
}

document_type_id: any;
remove(i: number): void {
  this.document_type_id = this.documentFieldAsFormArray.controls?.[i]?.controls?.id?.value;
  this.total_size = this.total_size - parseInt(this.file_size_array[i]);
  this.documentFieldAsFormArray.removeAt(i);
}

onImageChangeFromFile($event:any,i:any){
  if ($event.target.files && $event.target.files[0]) {
    let file = $event.target.files[0];
    let file_size = file.size;
    this.errors="";
      if(file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png" || file.type == "application/pdf") {
      }
      else {
        this.get_document(i).reset();
        this.errors="Can not upload "+file.type+" file type. Please upload jpg,png,jpeg or pdf files only.";
        file_size=0;
      }
      if(file.size > 2048000){
        this.get_document(i).reset();
        this.errors="File size more than 2 mb. Please upload file with size 2mb or less";
        file_size=0;
      }
      this.file_size_array[i]=file.size;
      this.total_size = this.total_size + parseInt(file_size);
      if(this.total_size > 6144000){
        this.get_document(i).reset();
        this.errors="You exceding upload limit. Please upload it in second edit round.";
      }
  }
}

  joining_date_change(event:any){
    if(this.leaving_date != undefined){
      let ld = new Date(this.leaving_date);
      let jd = new Date(this.joining_date);
      if(jd > ld){
        alert("joining date can't be greater than leaving date.");
        this.joining_date="";
      }
    }
  }
  leaving_date_change(event:any){
    if(this.leaving_date != undefined){
      let ld = new Date(this.leaving_date);
      let jd = new Date(this.joining_date);
      if(jd > ld){
        alert("leaving date can't be less than joining date.");
        this.leaving_date="";
      }
    }
  }

  valueStartDate(event:any,i:any){
    if(this.get_end_date(i).value != '' && this.get_end_date(i).value != null){
      let sd = new Date(event.target.value);
      let ed = new Date(this.get_end_date(i).value);
      if(sd>ed){
        alert("start date can't be greater than end date");
        event.target.value='';
      }
    }
  }

  valueEndDate(event:any,i:any){
    if(this.get_end_date(i).value != '' && this.get_end_date(i).value != null){
      let ed = new Date(event.target.value);
      let sd = new Date(this.get_start_date(i).value);
      if(sd>ed){
        alert("start date can't be greater than end date");
        event.target.value='';
      }
    }
  }

  getInstituteModule(module_name:string){
    return this.institute_modules.includes(module_name);
  }

  onSelectAll(items: any) {
    //this.getStudentList(items);
    // this.selectedItems=items;
  }



  getSectionList(branch_id:any, i:any){
    this.UserService.getSectionListDropdown(branch_id).subscribe((res:any) => {
      this.userRoleFieldAsFormArray.controls[i].controls.sections = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  getBranchList(){
    this.UserService.getBranchList().subscribe((resp:any) => {
      if(resp.status){
        this.branchList = resp.data
      }
    })
  }

  getRole(){
    if(this.adduserform.value.role){
      let role = this.roleList.find((x:any) => x.id == this.adduserform.value.role);
      return role.role
    }
  }

  branch_id:any = null;
  selectedBranch:any;
  sections:any  = [];


  get userRoleFieldAsFormArray(): any {
    return this.adduserform.get('user_roles') as FormArray;
  }

  user_role(): any {
    return this.fb.group({
        academic_year: this.fb.control([]),
        branch: this.fb.control(this.branch_id != 'user' ? this.branch_id : '' ,[Validators.required]),
        role: this.fb.control('',[Validators.required]),
        user_type: this.fb.control('',[Validators.required]),
        section: this.fb.control([]),
        class: this.fb.control([]),
        batch: this.fb.control([]),
        academic_years: [],
        sections: [],
        classes: [],
        batches: [],
        roles: [],
    });
  }

  onCheckboxChange(event:any){
    if(this.is_super_admin == true){
      this.userRoleFieldAsFormArray.clear();
    }else{
      this.addBranchRole();
    }
  }

  get_branch(i:any):any {
    return this.userRoleFieldAsFormArray.controls?.[i]?.controls?.branch;
  }

  get_role(i:any):any {
    return this.userRoleFieldAsFormArray.controls?.[i]?.controls?.role;
  }

  get_user_type(i:any):any {
    return this.userRoleFieldAsFormArray.controls?.[i]?.controls?.user_type;
  }

  get_section(i:any):any {
    return this.userRoleFieldAsFormArray.controls?.[i]?.controls?.section;
  }

  get_class(i:any):any {
    return this.userRoleFieldAsFormArray.controls?.[i]?.controls?.class;
  }

  get_batch(i:any):any {
    return this.userRoleFieldAsFormArray.controls?.[i]?.controls?.batch;
  }

  get_sections(i:any){
    return this.userRoleFieldAsFormArray.controls[i].controls.sections.length > 0 ? this.userRoleFieldAsFormArray.controls[i].controls.sections : [];
  }

  get_academic(i:any){
    return this.userRoleFieldAsFormArray.controls[i].controls.academic_year ?? [];
  }

  get_classes(i:any){
    return this.userRoleFieldAsFormArray.controls[i].controls.classes.length > 0 ? this.userRoleFieldAsFormArray.controls[i].controls.classes : [];
  }

  get_batches(i:any){
    return this.userRoleFieldAsFormArray.controls[i].controls.batches.length > 0 ? this.userRoleFieldAsFormArray.controls[i].controls.batches : [];
  }

  get_academic_years(i:any){
    return this.userRoleFieldAsFormArray.controls[i].controls.academic_years.length > 0 ? this.userRoleFieldAsFormArray.controls[i].controls.academic_years : [];
  }

  get_roles(i:any){
    return this.userRoleFieldAsFormArray.controls[i].controls.roles.length > 0 ? this.userRoleFieldAsFormArray.controls[i].controls.roles : [];
  }

  addBranchRole(): void {
    this.userRoleFieldAsFormArray.push(this.user_role());
  }

  removeBranchRole(i: number): void {
    this.userRoleFieldAsFormArray.removeAt(i);
  }

  handleBranchChange(e:any, i:any){
    this.userRoleFieldAsFormArray.controls[i].get('academic_year').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.academic_years = [];
    this.userRoleFieldAsFormArray.controls[i].get('section').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.sections = [];
    this.userRoleFieldAsFormArray.controls[i].get('class').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.classes = [];
    this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
    let branches = this.userRoleFieldAsFormArray.controls.map((element:any) => {
        return element.value.branch
    });
    if(branches.filter((el:any) => el == e.target.value).length > 1){
      setTimeout(() => {
        this.userRoleFieldAsFormArray.controls[i].get('branch').reset();
      }, 100);
      return this.toastr.showInfo('branch already selected', 'INFO')
    }

    this.getAcademicYear(i, e.target.value)
    this.getSectionList(e.target.value, i);
    this.getRoleList(e.target.value, i);
  }

  handleYearChange(event:any, i:any){
    this.userRoleFieldAsFormArray.controls[i].get('section').reset();
    this.userRoleFieldAsFormArray.controls[i].get('class').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.classes = [];
    this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
  }

  handleSectionChange(event:any, i:any, type:any){
    this.userRoleFieldAsFormArray.controls[i].get('class').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.classes = [];
    this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
    let sections = type == 'all'? event : this.get_section(i).value;
    let academic = this.get_academic(i).value;

    this.UserService.getClassesList(sections, academic).subscribe((res:any) => {
      this.userRoleFieldAsFormArray.controls[i].controls.classes = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  handleClassChange(event:any, i:any, type:any){
    this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
    this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
    let classes = type == 'all'? event : this.get_class(i).value;
    let branch = [this.get_branch(i).value];
    this.UserService.getBatchesByClass(classes, branch).subscribe((res:any) => {
      this.userRoleFieldAsFormArray.controls[i].controls.batches = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  getAcademicYear(i:any, branch_id){
    let data = {
      branches : [branch_id]
    }
    this.UserService.getAcademicYar(data).subscribe((resp:any) => {
      this.userRoleFieldAsFormArray.controls[i].controls.academic_years = resp.data;
    })
  }

  taken(id:any){
    let test = this.userRoleFieldAsFormArray.controls.find((el:any) => {
      el.value.branch_id == id
    });
    if(test){
      return true;
    }
    return false;

  }

  onFileSelected(event: Event, controlName: string): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      const file: File = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const image64 = e.target?.result as string;

        if(controlName == 'image'){
          this.signature = image64 
        }

        this.signature_file = file
      };

      reader.readAsDataURL(file);
    }
  }

  deleteSignature(){
    this.signature = null;
    this.signature_file = null; 
  }

  openModal(content:any) {
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result
  }

  areaList:any = [];
areaId:any = null;
transport_facility:any = false;

selectionAreaChange(event) {
  this.adduserform?.controls['area_id']?.patchValue(event?.id)
}

createAndUpdateArea(event) {
  if(!event?.id && !event?.name ){
    alert("Please add Area name in search")
    return
  }
 this.UserService.createUpdateArea( event?.id , event?.name ).subscribe((res:any)=>{
   if(res.status == true){
    event?.id ?  this.toastr.showSuccess("Updated Successfully") : this.toastr.showSuccess("Created Successfully")
     this.getAreaList( event?.name ,event?.id)
   }else{
    alert(res.message);
   }
 },(err:any)=>{
  this.toastr.showError(err.error.message);
})
}

getAreaList(name:any="" , id : any = null){
  this.UserService.getAreaList().subscribe((resp: any) => {
    this.areaList = resp.data.transportAreaList
    
    if(name){
      this.areaId = this.areaList?.find(ele=>ele?.name == name )?.id
      this.adduserform?.controls['area_id']?.patchValue(this.areaId)
    }
  });
}

deleteArea(event) {
  this.UserService.deleteArea( event ).subscribe((res:any)=>{
    if(res?.status){
      this.toastr.showSuccess(res?.message)
      this.getAreaList()
    }
 },(err:any)=>{
  this.toastr.showError(err.error.message);
})
}
}
