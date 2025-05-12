import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-today-collection',
  templateUrl: './today-collection.component.html',
  styleUrls: ['./today-collection.component.scss']
})
export class TodayCollectionComponent implements OnInit {
  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  earningExpanseForm: FormGroup = new FormGroup({})

  collection: any = []
  branch_id: any = window.localStorage.getItem('branch');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );
  dropdownDate: string | undefined;

  constructor(
    private dashBoardService: DashboardService,
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.initForm();
    // const todayDate = this.dashBoardService.getStartAndEndDate(0)
    // this.getCollection(todayDate?.startDate, todayDate?.endDate)
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  initForm() {
    this.dropdownDate = this.dashBoardService.getDate()

    this.earningExpanseForm = this._fb.group({
      date: [ null ]
    })

    this.earningExpanseForm?.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=>{
      if (res) {
        const date = this.earningExpanseForm?.value?.date
        this.getCollection(date?.startDate?.format('YYYY-MM-DD') , date?.endDate?.format('YYYY-MM-DD'))
      }
    })
  }

  getCollection(startDate, endDate) {

    // const formData = new FormData();

    const payload = {
      // branch_id : this.branch_id,
      // academic_year_id : this.currentYear_id,
      start_date : startDate,
      end_date : endDate
    }

    // formData.append("branch_id", this.branch_id);
    // formData.append("academic_year_id", this.currentYear_id);
    // formData.append("start_date", startDate);
    // formData.append("end_date", endDate);

    this.dashBoardService.getCollection(payload).subscribe((res: any) => {
      if (res?.status) {
        this.collection = res?.data
      }
    })
  }
}
