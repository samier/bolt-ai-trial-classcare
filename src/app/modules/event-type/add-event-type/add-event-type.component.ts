import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { EventTypeServiceService } from '../event-type-service.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-add-event-type',
  templateUrl: './add-event-type.component.html',
  styleUrls: ['./add-event-type.component.scss']
})
export class AddEventTypeComponent implements OnInit {

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
  }

  onSubmit() {
    this.submitted=true;
    this.valid=true;    
    
    if(this.valid){  
      this.eventTypeService.addEventType(this.leavecreateform.value).subscribe((res:any) => {
        
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
