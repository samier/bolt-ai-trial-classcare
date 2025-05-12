import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from './../../hra/hra.service';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-inventory-settings',
  templateUrl: './inventory-settings.component.html',
  styleUrls: ['./inventory-settings.component.scss']
})
export class InventorySettingsComponent {
  submitted:any=false;
  public branch_id = window.localStorage?.getItem("branch");
  public valid = true;
  public role_id:any;
  public roleList:any;
  public role:any;
  constructor(
    private inventoryService:InventoryService ,private router:Router,private route:ActivatedRoute,private fb:FormBuilder, private toastr: Toastr,public CommonService: CommonService
  ) {
    this.role_id = this.route.snapshot.paramMap.get('id');
    this.inventoryForm = new FormGroup({
      users: new FormControl('',[Validators.required]),
    });
  }
  inventoryForm: FormGroup;
  ngOnInit() { 
    this.fetchUser();  
    this.getRequisitionApprover();  
  }
  URLConstants = URLConstants;

  userList = [];
  selectedUser:any = '';
    
  RoleNames = [];
  selectedRole:any ='';

  public login_id=4;
  public selected_id='';
  public id=4;

    changeFn(val:any){
      this.selected_id =val;
      this.selectedUser='';
      this.fetchUser();
    }

    onSubmit() {
      this.submitted=true;
      this.valid=true;      
          
      //console.log(this.inventoryForm.value);
      const payload = {
        "user_id": this.inventoryForm.value.users,
      } 
      //console.log(payload);
    
      if(this.valid){        
        this.setRequisitionApprover(payload);
      }
      return 0;
    }

    getRoleList(){      
      // this.inventoryService.getRoleList().subscribe((res:any) => {
      //   //console.log(res);
      //   if(res.status==false){
      //     this.toastr.showError(res.message);
      //   }else{
      //     this.RoleNames = res.data;
      //     let name:any = this.RoleNames.filter((product:any) => { if(product.id == this.role_id) return product;});
      //     this.role=name[0].name;  
      //     this.selectedUser=name[0].leave_approver_id;
      //   }    
      // });         
    }

    setRequisitionApprover(payload:any)
    {
      this.inventoryService.setRequisitionApprover(payload).subscribe((res:any) => {
        //console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{
          this.toastr.showSuccess(res.message);
        }    
      });    
    }
    getRequisitionApprover()
    {
      this.inventoryService.getRequisitionApprover().subscribe((res:any) => {
        //console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }
        else{
          if(res.data != null && res.data.user_id != undefined){
            this.inventoryForm.controls['users'].setValue(res.data.user_id);
          }
        }    
      });    
    }
    

    getLeaveApprover(id:any)
    {
      // this.inventoryService.getLeaveApprover({role_id:id}).subscribe((res:any) => {
      //   //console.log(res);
      //   if(res.status==true){
      //     this.role = res.data.name;
      //     this.selectedUser=res.data.leave_approver_id;
      //     this.selectedRole=res.data.leave_approver_role;
      //     this.fetchUser(this.selectedRole);
      //   }else if(res.status==false){
      //     this.toastr.showError(res.message);
      //   }
      //   else{
      //     this.toastr.showSuccess(res.message);
      //   }  
      // });    
    }    

    fetchUser(){           
      //console.log(id);
      this.inventoryService.getUserList().subscribe((res:any) => {
        //console.log(res);
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.userList = res.data;
        }    
      });     
    }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
