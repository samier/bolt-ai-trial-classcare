import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { EventTypeServiceService } from '../event-type-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-edit-event-type',
  templateUrl: './edit-event-type.component.html',
  styleUrls: ['./edit-event-type.component.scss']
})
export class EditEventTypeComponent implements OnInit {

  submitted:any=false;
  public valid = true;
  public id:any;

  constructor(private eventTypeService: EventTypeServiceService,private router:Router,private toastr: Toastr,private route: ActivatedRoute) { 
    this.id = this.route.snapshot.paramMap.get('id');
    this.leavecreateform = new FormGroup({            
      name: new FormControl('',[Validators.required]),
      color: new FormControl('',[Validators.required]),      
    });
  }

  URLConstants = URLConstants;
  leavecreateform: FormGroup;

  ngOnInit(): void {
    this.eventTypeService.getData(this.id).subscribe((res:any) => {       
      this.leavecreateform.get('name')?.setValue(res.data.name);
      this.leavecreateform.get('color')?.setValue(res.data.color);
    });
  }

  onSubmit() {
    this.submitted=true;
    this.valid=true;    
    
    if(this.valid){  
      this.eventTypeService.updateEventType(this.leavecreateform.value,this.id).subscribe((res:any) => {
        
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.router.navigate([this.setUrl(URLConstants.LIST_EVENT)]);
        } 
      });
    }
    
    return 0;
}

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
