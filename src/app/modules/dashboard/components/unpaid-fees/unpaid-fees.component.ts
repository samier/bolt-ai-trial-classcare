import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-unpaid-fees',
  templateUrl: './unpaid-fees.component.html',
  styleUrls: ['./unpaid-fees.component.scss']
})
export class UnpaidFeesComponent implements OnInit {

  unpaidFee : any = []

  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  currentPage : number = 1
  is_loading  : boolean = false

  start : number = 0
  length : number = 10 
  URLConstants = URLConstants;

  constructor(
    public commonService: CommonService,
    private dashboardService : DashboardService,
    private cdr : ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.unpaidFee = []
    this.currentPage = 1
    this.getUnpaidFee()
  }

  getUnpaidFee(){
    this.is_loading = true

    const payload = {
      // start : (this.currentPage - 1) * 10,
      start : this.start ,
      length : this.length
     }

    this.dashboardService.getUnpaidFee( payload ).subscribe((res:any)=>{
      
      if(res?.status){
        this.unpaidFee = [...this.unpaidFee,...res?.data?.original?.data]
        this.is_loading = false
        this.cdr.detectChanges();
      }else{
        this.is_loading = false
        this.cdr.detectChanges();
      }
      
    },(error)=>{
      this.is_loading = false
      this.cdr.detectChanges();
    } )
  }

  onScrollChange() {
    // this.currentPage++;
    this.start = this.start + this.length
    this.getUnpaidFee();
  }

}
