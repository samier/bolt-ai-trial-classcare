import { Component} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { enviroment } from '../../../../environments/environment.staging';


@Component({
  selector: 'app-fees-tabs-layout',
  templateUrl: './fees-tabs-layout.component.html',
  styleUrls: ['./fees-tabs-layout.component.scss']
})
export class FeesTabsLayoutComponent {
  tab_type:any;
  URLConstants = URLConstants;
  fee_discount=0;
  fees_refund=0;  
  student_discount=0;  
  refund_type=0;
  symfonyHost = enviroment.symfonyHost;
  constructor( private route: ActivatedRoute,){
    this.tab_type = this.route.snapshot.paramMap.get('type');
    if(this.tab_type == "discount"){
      this.fees_refund  = 0;
      this.fee_discount = 1;
      this.student_discount=0;
      this.refund_type=0;
    }
    
    if(this.tab_type == "refund"){
      this.fee_discount = 0;
      this.fees_refund  = 1;
      this.student_discount=0;
      this.refund_type=0;
    }
    
    if(this.tab_type == "student-discount"){
      this.fee_discount = 0;
      this.fees_refund  = 0;
      this.refund_type=0;
      this.student_discount=1;
    }

    if(this.tab_type == "refund-type"){
      this.fee_discount = 0;
      this.fees_refund  = 0;
      this.student_discount=0;
      this.refund_type=1;
    }

  }

  ngOnInit() {
    
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  setsymfonyUrl(url:string) {
    return this.symfonyHost+window.localStorage.getItem("branch")+'/'+url;
  }

  setType(type:any){
    if(type == 1){
      this.fees_refund  = 0;
      this.fee_discount = 1;
      this.student_discount=0;
      this.refund_type=0;
    }
    if(type == 2){
      this.fee_discount = 0;
      this.fees_refund  = 1;
      this.student_discount=0;
      this.refund_type=0;
    }
    if(type == 3){
      this.student_discount=1;
      this.fee_discount = 0;
      this.fees_refund  = 0;
      this.refund_type=0;
    }
    if(type == 4){
      this.student_discount=0;
      this.fee_discount = 0;
      this.fees_refund  = 0;
      this.refund_type=1;
    }    
  }

  updatePage(event:any){
    this.setType(event.id);
  }
}