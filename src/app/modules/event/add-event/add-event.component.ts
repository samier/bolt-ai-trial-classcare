import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { EventService } from '../event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit {

  public branch_id = window.localStorage?.getItem("branch");  
  submitted:any=false;
  public valid = true;
  public id:any;
  batches = [];
  selectedBatch:any ='';
  eventType = [];
  selectedEventType:any ='';
  color = [];
  assignTo:any;
  classDropdownSettings: IDropdownSettings = {};
  constructor(private eventService: EventService,private router:Router,private toastr: Toastr,private route: ActivatedRoute) { 
    this.id = this.route.snapshot.paramMap.get('id');
    this.leavecreateform = new FormGroup({            
      assignTo: new FormControl('',[Validators.required]), 
      batch: new FormControl(''),      
      event_name: new FormControl('',[Validators.required]),
      start_date: new FormControl('',[Validators.required]),
      end_date: new FormControl('',[Validators.required]),
      event_type_id: new FormControl('',[Validators.required]),
      color: new FormControl('',[Validators.required]),
      description: new FormControl('',[Validators.required]),       
    });
  }

  URLConstants = URLConstants;
  leavecreateform: FormGroup;

  ngOnInit(): void {
    this.eventService.getEventTypeList().subscribe((res: any) => {
      this.eventType =res.data;
  });

  this.classDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  }

  fun2(id:any){
    console.log('id',id);
    
    if(id == 1){      
      //batch
      // this.assignTo = 1;
        this.eventService.getBatchList(this.branch_id).subscribe((res: any) => {                         
          this.batches = res.data;
      });
    }else{
     this.batches = [];
     this.leavecreateform.value.batch = '';
    }
  }
  batch_array:any = [];
  onSubmit() {
    this.submitted=true;
    this.valid=true;
   
    if(this.leavecreateform.value.assignTo == 1)   
    {
      this.batch_array = this.selectedBatch;
      let ids = this.batch_array.map((item:any) => item.id); 
      
      Object.assign(this.leavecreateform.value, { 
        batches:ids,
    });
    } 
    if(this.valid){  
      this.eventService.addEvent(this.leavecreateform.value).subscribe((res:any) => {
        
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.router.navigate([this.setUrl(URLConstants.EVENT_LIST)]);
        } 
      });
    }
}

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  eventTypeChange()
  { 
    this.color = [];
    
    this.eventService.getColorList(this.leavecreateform.value.event_type_id).subscribe((res: any) => {      
      this.leavecreateform.get('color')?.setValue(res.data.color);        
  });
  }

  
  onBatchSelect()
  {
    // this.batch_array = this.selectedBatch;
    // let ids = this.batch_array.map((item:any) => item.id); 
    // this.selectedBatch = ids;
    // console.log('batch',this.selectedBatch);
    
  }
}
