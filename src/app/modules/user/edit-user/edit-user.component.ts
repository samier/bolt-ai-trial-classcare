import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
import { LoaderService } from 'src/app/core/services/loader-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {

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
  public id;
  public male=false;
  public female=false;
  public active=false;
  public inactive=false;
  public gender:any;
  public status:any;
 public routes:any;
 public is_active_radio:any;
 selectedRoute:any;
 m="m";
 f="f";
 stopList:any;
 pdf_thumnail=window.location.protocol + '//' +window.location.hostname+'/public/download/PDF_file_icon.svg';
 selectedRoutePickup:any = '';
 selectedRouteDrop:any='';
 selectedDropPoint:any='';
 selectedPickupPoint:any='';
 public stopListPickup:any;
 public stopListDrop:any;
 public transport_type:any;

 public current_address:any=0;
 permanent_address_display="block";
 errors:any='';
 public whatsapp_display="block";
 public whatsapp_no_same_as_phone_no:any;
 public employee_documents:any;
 public total_size:number=0;
 public file_size_array:string[]=[];
 public joining_date:any;
 public leaving_date:any;
 private API_URL = enviroment.apiUrl;
public institute_modules:any = [];
public branch_id:any = null;
userRoles:any = [];
is_super_admin:boolean = false
signature:any = null;
signature_file:any = null

dropdownList:any  = [];
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

assignTransport:any = [];

  constructor(
    private UserService: UserService,private router:Router,private fb:FormBuilder, private toastr: Toastr,private route:ActivatedRoute, private httpRequest: HttpClient, public CommonService : CommonService,
    private loaderService: LoaderService, private modalService: NgbModal,
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.edituserform = new FormGroup({
      first_name: new FormControl('',[Validators.required,Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      last_name: new FormControl('',[Validators.required,Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      // gender:new FormControl(''),
      birth_date:new FormControl('',[Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]),
      email:new FormControl('',[Validators.required,Validators.email]),
      password:new FormControl(''),
      phone_number:new FormControl('',[Validators.required,Validators.pattern(/^\d{10}$/)]),
      whatsup_number:new FormControl('',[Validators.pattern(/^\d{10}$/)]),
      // role:new FormControl('',[Validators.required]),
      is_active:new FormControl('',[Validators.required]),
      leaving_date:new FormControl(''),
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
      father_name:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      mother_name:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      blood_group:new FormControl(''),
      current_address:new FormControl(''),
      permanent_address:new FormControl(''),
      marital_status:new FormControl(''),
      spouse_name:new FormControl('',[Validators.pattern(/^[\p{L}\p{M} ]*$/u)]),
      faculty_goverment_number:new FormControl('',[Validators.pattern(/^[0-9a-zA-Z]*$/)]),
      faculty_type:new FormControl(''),
      
      whatsapp_no_same_as_phone_no:new FormControl(''),
      // section:new FormControl(''),
      quantities: this.fb.array([]),
      documents: this.fb.array([]),
      // branches: new FormControl([]),
      // user_type:new FormControl('',[Validators.required]),
      // user_batch: new FormControl(''),
      user_roles: this.fb.array([]),
      is_super_admin: new FormControl(false),
      transport_facility_status : new FormControl(false),
      area_id : new FormControl(null),
      emp_no : new FormControl(null),
      aadhaar_card_no:  new FormControl( null , [ ClassCareValidatores.pattern(/^\d{12}$/,"Please enter valid Number") , ClassCareValidatores.min(100000000000, "Please enter minimum 12 digits number") ,ClassCareValidatores.max(999999999999, "Please enter maximum 12 digits number") ] ),
      pan_card_no: new FormControl(null, [
      ClassCareValidatores.pattern(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Please enter a valid 10-character PAN Number (e.g., ABCDE1234F)"
      )]),
      voter_id_no: new FormControl(null, [
      ClassCareValidatores.pattern(
      /^[A-Z]{3}[0-9]{7}$/,
      "Please enter a valid 10-character Voter ID (e.g., ABC1234567)"
      )]),
    });
  }

  quantities() : FormArray {
    return this.edituserform.get("quantities") as FormArray
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
    return this.edituserform.get('quantities') as FormArray;
  }
  edituserform: FormGroup;
  ngOnInit() {
    this.loaderService.setLoading(false);
    this.getAreaList();
    this.branch_id = this.router.parseUrl(this.router.url).root.children['primary'].segments[0]['path'];
    if(!isNaN(this.branch_id)){
      let super_admin_checkbox:any = document.querySelector('input[name=is_super_admin]')
      super_admin_checkbox.disabled = true;
    }
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
        this.getRouteList();
        //if(this.transport_type != 'one way drop'){
          this.getStopListFoEdit(res.data.pickup_route,res.data.drop_route,res.data.transport_pick_up_point,res.data.transport_drop_point);
        //}
      }
    });


      // this.userRoleFieldAsFormArray.push(this.user_role());
      // if(this.branch_id){
      //   this.getSectionList(this.branch_id, 0);
      //   this.getAcademicYear(0, this.branch_id);
      //   this.getRoleList(this.branch_id, 0);
      // }
      this.UserService.getUserDetail(this.id, this.branch_id).subscribe((res:any) => {
        //this.roleList=res.data;
        this.userRoles = res.data.roles?.map((x:any) => x.role);
        this.edituserform.get('first_name')?.setValue(res.data.first_name);
        this.edituserform.get('last_name')?.setValue(res.data.last_name);
        this.edituserform.get('birth_date')?.setValue(res.data.birth_date);
        this.edituserform.get('leaving_date')?.setValue(res.data.expire_date);
        this.edituserform.get('phone_number')?.setValue(res.data.phone_number);
        this.edituserform.get('whatsup_number')?.setValue(res.data.whatsup_number);
        this.edituserform.get('email')?.setValue(res.data.email);
        // this.edituserform.get('role')?.setValue(res.data.roles.find((el:any) => el.branch_id == window.localStorage.getItem("branch")).id);

        this.edituserform.get('joining_date')?.setValue(res.data.joining_date);
        this.edituserform.get('alternate_number')?.setValue(res.data.alternate_number);
        this.edituserform.get('employee_number')?.setValue(res.data.employee_number);
        this.edituserform.get('designation')?.setValue(res.data.designation);
        this.edituserform.get('qualification')?.setValue(res.data.qualification);
        this.edituserform.get('spouse_name')?.setValue(res.data.spouse_name);
        this.edituserform.get('faculty_goverment_number')?.setValue(res.data.faculty_goverment_number);
        this.edituserform.get('faculty_type')?.setValue(res.data.faculty_type);
        this.edituserform.get('transport_type')?.setValue(res.data.transport_type);
        this.edituserform.get('pickup_route')?.setValue(res.data.pickup_route);
        this.edituserform.get('drop_route')?.setValue(res.data.drop_route);
        this.transport_type=res.data.transport_type;
        this.edituserform.get('current_address_same_permanent')?.setValue(res.data.current_address_same_permanent);
        this.edituserform.get('whatsapp_no_same_as_phone_no')?.setValue(res.data.whatsapp_no_same_as_phone_no);
        this.edituserform.get('is_active')?.setValue(res.data.enabled.toString());
        this.edituserform.get('user_type')?.setValue(res.data.user_type);
        this.edituserform.get('is_super_admin')?.setValue(res.data.is_super_admin);
        this.edituserform.get('emp_no')?.setValue(res.data.emp_no);
        this.edituserform.get('aadhaar_card_no')?.setValue(res.data.aadhaar_card_no ?? "");
        this.edituserform.get('pan_card_no')?.setValue(res.data.pan_card_no ?? "");
        this.edituserform.get('voter_id_no')?.setValue(res.data.voter_id_no ?? "");
        this.is_super_admin = res.data.is_super_admin;
        

        res.data.user_roles.forEach((element:any, i:any) => {
          element.user_type = element.user_type ?? 0 
            this.addBranchRole()
        });
        this.edituserform.get('user_roles')?.setValue(res.data.user_roles);
        res.data.user_roles.forEach((el:any, i:any) => {
          var ac_lable:any = {};
          el.academic_years.forEach((item:any)=>{
            ac_lable[item.id] = item.year;
          })
          this.userRoleFieldAsFormArray.controls[i].controls.roles = el.roles;
          this.userRoleFieldAsFormArray.controls[i].controls.academic_years = el.academic_years;
          this.userRoleFieldAsFormArray.controls[i].controls.sections = el.sections;
          this.userRoleFieldAsFormArray.controls[i].controls.classes = el.classes;
          this.userRoleFieldAsFormArray.controls[i].controls.batches = el.batches?.map((batch:any)=>{
            batch.name = batch.name+' ('+ac_lable[batch.academic_year_id]+')';
            return batch;
          });
      });

        if(res.data.current_address_same_permanent == 1)
        this.permanent_address_display="none";

        if(res.data.whatsapp_no_same_as_phone_no == 1)
        this.whatsapp_display="none";
        if(res.data.gender == 'f'){
          this.female=true;
        }else{
          this.male=true;
        }
        this.edituserform.get('no_children')?.setValue(res.data.no_children);
        this.edituserform.get('father_name')?.setValue(res.data.father_name);
        this.edituserform.get('mother_name')?.setValue(res.data.mother_name);
        this.edituserform.get('blood_group')?.setValue(res.data.blood_group);
        this.edituserform.get('current_address')?.setValue(res.data.current_address);
        this.edituserform.get('permanent_address')?.setValue(res.data.permanent_address);
        this.edituserform.get('marital_status')?.setValue(res.data.marital_status);

        this.transport_facility = res.data.transport_facility == 1 ? true : false;
        this.areaId = res.data.area_id;
        // this.edituserform.get('branches')?.setValue(res.data.branches);

        if(res.data.gender=='m')
          this.male=true;
        else if(res.data.gender=='f')
        this.female=true;

        this.gender=res.data.gender;

        if(res.data.enabled==1)
          this.active=true;
        else
         this.inactive=true;

         this.status=res.data.enabled;

         let s = res.data.past_employers.length;
         let option_subject;



         for(let i=0;i<s;i++){
           let hidden_id=res.data.past_employers[i].id;
           let employer_name=res.data.past_employers[i].employer_name;
           let start_date=res.data.past_employers[i].start_date;
           let end_date=res.data.past_employers[i].end_date;
           let designation=res.data.past_employers[i].designation;
           let description=res.data.past_employers[i].description;
           //option_subject = 'optional_subject'+i;
           let h = this.fb.group({
            id:hidden_id,
            employer_name: employer_name,
            start_date: start_date,
            end_date: end_date,
            designation: designation,
            description: description,
           });
           this.quantities().push(h);
         }

         this.employee_documents = res.data.employee_documents;
         this.signature = res.data.signature_url;
         this.signature_file = res.data.signature;
        //  console.log('doc',this.employee_documents);

        //  this.selectedItemsBatch = res.data.user_batch;
        //  this.selectedItems=res.data.sections;

      },(err:any)=>{
        this.toastr.showError(err.error.message);
      });

      // this.UserService.getBatchList().subscribe((res:any) => {
      //   //console.info(res.data);
      //   this.dropdownListBatches=res.data;
      // },(err:any)=>{
      //   this.toastr.showError(err.error.message);
      // });
  }
  URLConstants = URLConstants;


getRouteList(){
  this.UserService.getRouteList().subscribe((res:any) => {
    this.routes=res.data;
  },(err:any)=>{
    this.toastr.showError(err.error.message);
  });
}
  onSubmit() {
      this.submitted=true;
      this.valid=true;
      //console.log(this.edituserform.value,this.selectedDropPoint,this.selectedPickupPoint);
      // const payload = this.edituserform.value;
      const form = document.getElementById('user-form') as HTMLFormElement;
      const formData:FormData = new FormData(form);
      formData.append("enabled",this.is_active_radio);
      formData.append("gender",this.gender);
      formData.append("whatsapp_no_same_as_phone_no",this.whatsapp_no_same_as_phone_no);
      formData.append("current_address_same_permanent",this.current_address);
      formData.append("user_batch",JSON.stringify(this.selectedItemsBatch));
      // console.log(formData);
      // formData.append("section",JSON.stringify(this.selectedItems));
      // formData.append("branches",JSON.stringify(this.edituserform.value.branches));
      formData.append("user_roles",JSON.stringify(this.edituserform.value.user_roles));
      formData.append("update_for",this.branch_id);
      formData.append("is_super_admin",JSON.stringify(this.is_super_admin));      
      formData.append("signature",(this.signature_file == null ? '' : this.signature_file));
      formData.append("transport_facility",this.transport_facility);      
      formData.append("area_id",this.edituserform.value.area_id);            
      formData.append("joining_date",this.edituserform.value.joining_date);
      formData.append("leaving_date",this.edituserform.value.leaving_date);
      formData.append("birth_date",this.edituserform.value.birth_date);
      formData.append("transport_facility",this.transport_facility);      
      formData.append("area_id",this.edituserform.value.area_id);      
      formData.append("aadhaar_card_no", this.edituserform.value.aadhaar_card_no ?? ""); 
      formData.append("pan_card_no", this.edituserform.value.pan_card_no ?? "");           
      formData.append("voter_id_no", this.edituserform.value.voter_id_no ?? "");           
      //console.log(payload);
      if(this.valid){ //add role
        this.updateUser(formData);
      }
      return 0;
  }


  // onItemSelect(item: any) {
  // }
  // onSelectAll(items: any) {
  // }
  // onItemDeSelect(item:any){
  // }
  onItemDeSelectAll(item:any){
    this.selectedItems=[];
  }

  onBatchDeSelectAll(item:any){
    this.selectedItemsBatch=[];
  }

  getBatchList(branch_id:any){   
    this.UserService.getBatchList().subscribe((res:any) => {
      this.dropdownListBatches = res.data;
      if(res.status==false){
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
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

  updateUser(payload:any)
  {
    this.UserService.updateUser(this.id,payload).subscribe((res:any) => {
      //console.log(res);
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

  fun(val:any){
    this.gender=val;
  }

  fun2(val:any){
    this.status=val;
  }

  setUrl(url:string) {
    if(isNaN(this.branch_id)){
      return '/'+url;
    }else{
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
  }

  getStopListFoEdit(pickup_route_id:any,drop_route_id:any,pick_up_id:any,drop_id:any){
    // console.log(pickup_route_id,drop_route_id,pick_up_id,drop_id);
    this.UserService.getStopList({route_id:pickup_route_id}).subscribe((res:any) => {
      this.stopListPickup = res.data;
      //set pickupPoint
      this.edituserform.get('transport_pick_up_point')?.setValue(pick_up_id);
    });
    this.UserService.getStopList({route_id:drop_route_id}).subscribe((res:any) => {
      this.stopListDrop = res.data;
      //set dropPoint
      this.edituserform.get('transport_drop_point')?.setValue(drop_id);
    });
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
        this.selectedPickupPoint="";
      }
      else{
        this.stopListDrop = res.data;
        this.selectedDropPoint="";
      }
    });
  }

  get_transport_mode(event:any){
    this.transport_type=event;
    // console.log(event);
    this.edituserform.controls['pickup_route'].clearValidators();
    this.edituserform.controls['transport_pick_up_point'].clearValidators();
    this.edituserform.controls['drop_route'].clearValidators();
    this.edituserform.controls['transport_drop_point'].clearValidators();
    if(event == 'one way pickup'){
      this.edituserform.controls['pickup_route'].setValidators([Validators.required]);
      this.edituserform.controls['transport_pick_up_point'].setValidators([Validators.required]);
    }
    if(event == 'one way drop'){
      this.edituserform.controls['drop_route'].setValidators([Validators.required]);
      this.edituserform.controls['transport_drop_point'].setValidators([Validators.required]);
    }
    if(event == 'two way transport'){
        this.edituserform.controls['pickup_route'].setValidators([Validators.required]);
        this.edituserform.controls['transport_pick_up_point'].setValidators([Validators.required]);
        this.edituserform.controls['drop_route'].setValidators([Validators.required]);
        this.edituserform.controls['transport_drop_point'].setValidators([Validators.required]);
      }

    this.edituserform.controls['pickup_route'].updateValueAndValidity();
    this.edituserform.controls['transport_pick_up_point'].updateValueAndValidity();
    this.edituserform.controls['drop_route'].updateValueAndValidity();
    this.edituserform.controls['transport_drop_point'].updateValueAndValidity();
  }
  sameWhatsappNo(){
    if(this.whatsapp_no_same_as_phone_no==1){
      this.whatsapp_display="none";
    }else
    this.whatsapp_display="block";
  }

  sameAddress(){
    if(this.current_address==1){
      this.permanent_address_display="none";
    }else
    this.permanent_address_display="block";
  }

  get documentFieldAsFormArray(): any {
    return this.edituserform.get('documents') as FormArray;
  }

  get_start_date(i:any): any {
    return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.start_date;
  }

  get_end_date(i:any): any {
    return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.end_date;
  }

  get_designation(i:any): any {
    return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.designation;
  }
  get_employer_name(i:any): any {
    return this.pastEmployeeFieldAsFormArray.controls?.[i]?.controls?.employer_name;
  }

  get_document_type(i:any): any {
    return this.documentFieldAsFormArray.controls?.[i]?.controls?.document_name;
  }

get_document(i:any): any {
    return this.documentFieldAsFormArray.controls?.[i]?.controls?.document;
}

get_same_address(): any {
    return this.edituserform.value.same_address === 'No';
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
  if(this.document_type_id){
    this.total_size = this.total_size - parseInt(this.file_size_array[i]);
  }
  this.documentFieldAsFormArray.removeAt(i);
}

deleteImage(id:any){
  let user_confirmation = confirm("Are you sure? You want delete it?");
  if(user_confirmation){
    this.UserService.deleteImage(id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        document?.getElementById("image_area_"+id)?.remove();
        document?.getElementById("delete_btn_"+id)?.remove();
        this.toastr.showSuccess(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }
}

onImageChangeFromFile($event:any,i:any){
  // console.log(this.edituserform.controls);
  if ($event.target.files && $event.target.files[0]) {
    let file = $event.target.files[0];
    let file_size = file.size;
    this.errors="";
      if(file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png" || file.type == "application/pdf") {
        // console.log("correct");
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
      // console.log(this.total_size);
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
  // console.log(event.target.value);
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

onItemSelect(item: any) {
  //console.log(this.selectedItems);
  //this.getStudentList(this.selectedItems);
}
onSelectAll(items: any) {
  //this.getStudentList(items);
  this.selectedItems=items;
}
onSelectAllBatch(item:any)
{
  this.selectedItemsBatch=item;
}

onItemDeSelect(item:any){
  // this.getStudentList(this.selectedItems);
  // this.getStudentNumbers(this.selectedStudents);
}


getSectionList(branch_id:any, i:any){
  this.UserService.getSectionListDropdown(branch_id).subscribe((res:any) => {
    // console.log(res);
    this.userRoleFieldAsFormArray.controls[i].controls.sections = res.data;
    if(res.status==false){
      this.toastr.showError(res.message);
    }
  },(err:any)=>{
    this.toastr.showError(err.error.message);
  });
}

getRole(){
  if(this.edituserform.value.role){
    let role = this.roleList.find((x:any) => x.id == this.edituserform.value.role);
    return role.role
  }
}

getBranchList(){
  this.UserService.getBranchList().subscribe((resp:any) => {
    if(resp.status){
      this.branchList = resp.data
    }
  })
}

get userRoleFieldAsFormArray(): any {
  return this.edituserform.get('user_roles') as FormArray;
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
      academic_years: this.fb.control([]),
      sections: this.fb.control([]),
      classes: this.fb.control([]),
      batches: this.fb.control([]),
      roles: this.fb.control([]),
  });
}

onCheckboxChange(){
  // this.userRoleFieldAsFormArray.clear();
  // if(this.is_super_admin == false){
  //   this.addBranchRole();
  // }
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
  let branches = this.userRoleFieldAsFormArray.controls?.map((element:any) => {
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
  setTimeout(()=>{
    const academic_year_ids = this.userRoleFieldAsFormArray.controls[i].get('academic_year').value;
    if(academic_year_ids?.length == 0)
    {
      this.userRoleFieldAsFormArray.controls[i].get('section').reset();
      this.userRoleFieldAsFormArray.controls[i].get('class').reset();
      this.userRoleFieldAsFormArray.controls[i].controls.classes = [];
      this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
      this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
    }else{
      this.getClassesList(this.get_section(i).value, this.get_academic(i).value, i);
    }
  },50);
}

handleSectionChange(event:any, i:any, type:any){
  setTimeout(()=>{
    const section = this.userRoleFieldAsFormArray.controls[i].get('section').value;
    if(section?.length == 0)
    {
      this.userRoleFieldAsFormArray.controls[i].get('class').reset();
      this.userRoleFieldAsFormArray.controls[i].controls.classes = [];
      this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
      this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
    }
    let sections = type == 'all'? event : this.get_section(i).value;
    let academic = this.get_academic(i).value;
    this.getClassesList(sections, academic, i);
  },50);
}

getClassesList(sections:any, academic:any, i:any){
  this.UserService.getClassesList(sections, academic).subscribe((res:any) => {
    this.userRoleFieldAsFormArray.controls[i].controls.classes = res.data;
    var classes = this.userRoleFieldAsFormArray.controls[i].get('class').value;

    classes = classes?.filter((item:any)=>{
      return res.data?.find((cls:any)=>cls.id == item.id);
    })
    this.userRoleFieldAsFormArray.controls[i].get('class').setValue(classes);
    if(res.status==false){
      this.toastr.showError(res.message);
    }else{
      this.getBatchesByClass([], i, null);
    }
  },(err:any)=>{
    this.toastr.showError(err.error.message);
  });
}

handleClassChange(event:any, i:any, type:any){
  setTimeout(()=>{
    const cls = this.userRoleFieldAsFormArray.controls[i].get('class').value;
    if(cls?.length == 0)
    {
      this.userRoleFieldAsFormArray.controls[i].get('batch').reset();
      this.userRoleFieldAsFormArray.controls[i].controls.batches = [];
    }
    this.getBatchesByClass(event, i, type);
  },50);
}

getBatchesByClass(event:any, i:any, type:any){
  let classes = type == 'all'? event : this.get_class(i).value;
  let branch = [this.get_branch(i).value];
  var ac_lable:any = {};
  this.userRoleFieldAsFormArray?.controls?.[i]?.get('academic_year')?.value?.forEach((item:any)=>{
    ac_lable[item.id] = item.year;
  })
  this.UserService.getBatchesByClass(classes, branch).subscribe((res:any) => {
    this.userRoleFieldAsFormArray.controls[i].controls.batches = res.data?.map((item:any)=>{
      item.name = item.name+' ('+ac_lable[item.academic_year_id]+')';
      return item;
    });
    var batches = this.userRoleFieldAsFormArray.controls[i].get('batch').value;

    batches = batches?.filter((item:any)=>{
      return res.data?.find((batch:any)=>batch.id == item.id);
    })
    this.userRoleFieldAsFormArray.controls[i].get('batch').setValue(batches);
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
  this.edituserform?.controls['area_id']?.patchValue(event?.id)
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
  let data = {
    user_id : this.id
  }
  this.UserService.getAreaList(data).subscribe((resp: any) => {
    this.assignTransport = resp.data.transport
    this.areaList = resp.data.transportAreaList
    
    if(name){
      this.areaId = this.areaList?.find(ele=>ele?.name == name )?.id
      this.edituserform?.controls['area_id']?.patchValue(this.areaId)
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
