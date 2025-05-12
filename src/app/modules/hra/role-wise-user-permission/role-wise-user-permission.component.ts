import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray , Validators } from '@angular/forms';
import { HraService } from '../hra.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { NavService } from 'src/app/shared/services/nav.service';


@Component({
  selector: 'app-role-wise-user-permission',
  templateUrl: './role-wise-user-permission.component.html',
  styleUrls: ['./role-wise-user-permission.component.scss'],
})
export class RoleWiseUserPermissionComponent implements OnInit{

 roleList:any;
 moduleWithPermission: any = [];
 myForm!: FormGroup;
//  moduleFormGroup: any = [];
permissionTypes: string[] = ['has_access', 'has_create', 'has_edit', 'has_update', 'has_delete', 'has_download', 'has_import'];

  constructor(private fb: FormBuilder, private HraSerivce:HraService,private toastr: Toastr, private NavService: NavService) { 
    // this.myForm = this.FormBuilder.group({});
  }
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  expandedIndex = 0;
  

  ngOnInit(): void {
    this.HraSerivce.getRoleList({type: 'access-list'}).subscribe((res:any) => {
      this.roleList=res.data;      
      this.initializeForm();
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });

    
  }

  initializeForm() {
    this.myForm = this.fb.group({
      role: [''],
      modules: this.fb.array([]),
    });
  
    this.roleList.forEach((role) => {
      const modulesFormArray = this.fb.array([]);
  
      this.moduleWithPermission.forEach((item) => {
        const moduleFormGroup = this.fb.group({
          id: [item.id],
          name: [item.name],
          permissions: this.fb.group({
            has_access: [false],
            has_create: [false],
            has_edit: [false],
            has_update: [false],
            has_delete: [false],
            has_download: [false],
            has_import: [false],
          } as Record<string, any>), // Explicitly cast to Record<string, any>
        });
  
        (modulesFormArray as FormArray).push(moduleFormGroup);
      });
  
      const roleGroup = this.fb.group({
        role: [role.id],
        modules: modulesFormArray,
      });
  
      (this.myForm.get('modules') as FormArray).push(roleGroup);
    });
  }


  URLConstants = URLConstants;

  updateForm(moduleId: number, moduleName: string, permissionType: string,event) {
    let key = event.target.getAttribute("key")
    const modulesFormArray = this.myForm.get('modules') as FormArray;
    if (permissionType === 'has_access' && !event.target.checked) {
        const permission_name = 'flexCheckChecked-'+moduleId;
        $('#'+permission_name+'-has_create').prop('checked', false);
        $('#'+permission_name+'-has_edit').prop('checked', false);
        $('#'+permission_name+'-has_update').prop('checked', false);
        $('#'+permission_name+'-has_delete').prop('checked', false);
        $('#'+permission_name+'-has_download').prop('checked', false);
        $('#'+permission_name+'-has_import').prop('checked', false);
        console.log(permission_name);
    }

    // if(key == 'leave_approve_leave' || key == 'leave_faculty_leave' || key == 'administrator_leave'){
    //   let leave_approve_leave_id =  document.querySelectorAll('input[key=leave_approve_leave]')[0].getAttribute('module_id');
    //   let leave_faculty_leave_id =  document.querySelectorAll('input[key=leave_faculty_leave]')[0].getAttribute('module_id');
    //   let administrator_leave_id =  document.querySelectorAll('input[key=administrator_leave]')[0].getAttribute('module_id');
    //   if(event.target.checked){
    //     $('#flexCheckChecked-'+leave_approve_leave_id+'-'+permissionType).prop('checked', true);
    //     $('#flexCheckChecked-'+leave_faculty_leave_id+'-'+permissionType).prop('checked', true);
    //     $('#flexCheckChecked-'+administrator_leave_id+'-'+permissionType).prop('checked', true);
    //   }else{
    //     $('#flexCheckChecked-'+leave_approve_leave_id+'-'+permissionType).prop('checked', false);
    //     $('#flexCheckChecked-'+leave_faculty_leave_id+'-'+permissionType).prop('checked', false);
    //     $('#flexCheckChecked-'+administrator_leave_id+'-'+permissionType).prop('checked', false);
    //   }
    // }

    // if(key == 'student_student_bulk_edit' || key == 'report_student_report'){
    //   let student_student_bulk_edit_id =  document.querySelectorAll('input[key=student_student_bulk_edit]')[0].getAttribute('module_id');
    //   let report_student_report_id =  document.querySelectorAll('input[key=report_student_report]')[0].getAttribute('module_id');
    //   if(event.target.checked){
    //     $('#flexCheckChecked-'+student_student_bulk_edit_id+'-'+permissionType).prop('checked', true);
    //     $('#flexCheckChecked-'+report_student_report_id+'-'+permissionType).prop('checked', true);
    //   }else{
    //     $('#flexCheckChecked-'+student_student_bulk_edit_id+'-'+permissionType).prop('checked', false);
    //     $('#flexCheckChecked-'+report_student_report_id+'-'+permissionType).prop('checked', false);
    //   }
    // }
  }


  onSubmit() {
    
    const form = document.getElementById('role-wise-form') as HTMLFormElement;
    console.log(form);
    const formData:FormData = new FormData(form);

    const formDataObject: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      formDataObject[key] = value;
    });

    console.log('Form Data:', formDataObject); // For debug the form submit

    this.HraSerivce.saveRolewisePermission(formData).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message);
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 

  }

  syncModule(){
    let data = this.NavService.getMenuItems();
    this.HraSerivce.syncModule(data).subscribe((resp:any) => {

    })
  }
  
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  onSelectChange(event: any) {
    
    const selectedValue = event.target.value;
    const branch = window.localStorage.getItem("branch");
    this.HraSerivce.getRolewiseModules({'role': selectedValue}).subscribe((res: any) => {      
        // console.log(res.data);
        this.moduleWithPermission = res.data;
      });
  }

}
