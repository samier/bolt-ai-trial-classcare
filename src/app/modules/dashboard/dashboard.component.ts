import { Component, OnInit,   ChangeDetectionStrategy,
  ViewEncapsulation, 
  ChangeDetectorRef} from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  CompactType,
  DisplayGrid,
  Draggable,
  GridsterComponent,
  GridsterComponentInterface,
  GridsterConfig,
  GridsterItem,
  GridsterItemComponent,
  GridsterItemComponentInterface,
  GridsterPush,
  GridType,
  PushDirections,
  Resizable
} from 'angular-gridster2';
import { DashboardService } from './dashboard.service';
import { CommonService } from 'src/app/core/services/common.service';
import { enviroment } from 'src/environments/environment.staging';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit{
  @BlockUI() blockUI: any;
  public options: GridsterConfig | any;
  dashboard: Array<GridsterItem> | any;
  itemToPush: GridsterItemComponent| any;

  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  public is_faculty = window.localStorage?.getItem("role")?.includes('ROLE_FACULTY');
  public is_staff   = window.localStorage?.getItem("role")?.includes('ROLE_STAFF');
  public is_branch_admin   = window.localStorage?.getItem("role")?.includes('ROLE_BRANCH_ADMIN');
  public is_back_office   = window.localStorage?.getItem("role")?.includes('ROLE_BACK_OFFICE');
  public is_student = window.localStorage?.getItem("role")?.includes('STUDENT');

  countData : any = []

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  classes : any = [{ id:"" , name: "ALL Class"}]
  batches : any = []

  static eventStart(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface,
    event: MouseEvent
  ): void {
    // console.info('eventStart', item, itemComponent, event);
  }

  static eventStop(
    item: GridsterItem,
    itemComponent: GridsterItemComponentInterface,
    event: MouseEvent
  ): void {
    // console.info('eventStop', item, itemComponent, event);
  }

  static overlapEvent(
    source: GridsterItem,
    target: GridsterItem,
    grid: GridsterComponent
  ): void {
    // console.log('source', source);
    // console.log('target', target)
    // console.log('grid', grid)
  }

  static gridInit(grid: GridsterComponentInterface): void {
    
  }

  constructor(
    public CommonService: CommonService ,
    private dashboardService : DashboardService , 
    private chd: ChangeDetectorRef,
    private httpRequest : HttpClient
  ) { }

  async ngOnInit() {

    const role_wise_permission :any = await this.httpRequest.post(enviroment.apiUrl+'api/modules/role-wise-modules-permission-list',[]).toPromise();
    window.localStorage.setItem("permissions",JSON.stringify(role_wise_permission?.data));

    if(role_wise_permission?.data?.length > 0 || this.is_admin) {
      const permissions = {
        'homework' : this.is_admin ||  this.CommonService.hasPermission('administrator_homework', 'has_access'), //done
        'faculty-cnt' : this.is_admin || this.CommonService.hasPermission('faculty_faculty', 'has_access'),
        // 'faculty-cnt' : this.is_admin || this.CommonService.hasPermission('student_attendance', 'has_access'),
        'temp-cnt' : this.is_admin || this.CommonService.hasPermission('student_attendance', 'has_access') , //done
        'present-cnt' : this.is_admin || this.CommonService.hasPermission('faculty_staff_attendance', 'has_access') , // done
        'exam-mark' : this.is_admin || this.CommonService.hasPermission('student_exam', 'has_access') , //done
        'upcoming-exam' : this.is_admin || this.CommonService.hasPermission('student_exam', 'has_access') , //done
        'today-collection' : this.is_admin || this.CommonService.hasPermission('fees_report_dashboard_fees', 'has_access') ,
        'today-birthday' : this.is_admin || this.CommonService.hasPermission('report_birthday_report', 'has_access') , //done
        'assignment' : this.is_admin || this.CommonService.hasPermission('administrator_assignment', 'has_access') ,
        'attendance' : this.is_admin || this.CommonService.hasPermission('student_attendance', 'has_access') , //done
        'student-birthday' : this.is_admin || this.CommonService.hasPermission('report_birthday_report', 'has_access') , //done
        'video-link' : this.is_admin || this.CommonService.hasPermission('administrator_videolink', 'has_access') , //done
        'student-absent' : this.is_admin || this.CommonService.hasPermission('student_attendance', 'has_access') , //done
        'staff-leave' : this.is_admin || this.CommonService.hasPermission('administrator_leave', 'has_access') ,
        'unpaid-fees' : this.is_admin || this.CommonService.hasPermission('fees_report_dashboard_fees', 'has_access') ,
        'inquiry' : this.is_admin || this.CommonService.hasPermission('inquiry_inquiry', 'has_access') , //done
        'present-staff' : this.is_admin || this.CommonService.hasPermission('administrator_homework', 'has_access') ,
        'proxy-timetable' : this.is_admin || this.CommonService.hasPermission('administrator_proxy_lecture', 'has_access') ,
        'calendar' : this.is_admin || this.CommonService.hasPermission('administrator_calender', 'has_access') ,
      };
  
      this.getClassList()
      this.getBatchList()
      
      this.getCount()
  
      this.options = {
        gridType: GridType.VerticalFixed,
        compactType: CompactType.None,
        margin: 20,
        outerMargin: true,
        outerMarginTop: null,
        outerMarginRight: null,
        outerMarginBottom: null,
        outerMarginLeft: null,
        useTransformPositioning: true,
        mobileBreakpoint: 992,
        useBodyForBreakpoint: false,
        minCols: 12,
        maxCols: 12,
        minRows: 8,
        maxRows: 100,
        maxItemCols: 100,
        minItemCols: 1,
        maxItemRows: 100,
        minItemRows: 1,
        maxItemArea: 2500,
        minItemArea: 1,
        defaultItemCols: 100,
        defaultItemRows: 100,
        fixedColWidth: 105,
        fixedRowHeight: 105,
        keepFixedHeightInMobile: false,
        keepFixedWidthInMobile: false,
        scrollSensitivity: 10,
        scrollSpeed: 20,
        displayGrid: DisplayGrid.None,
        
        initCallback: (grid: any) => {
          // console.info('gridInit', grid);
          // this.addItem();
        },
        // enableEmptyCellClick: false,
        // enableEmptyCellContextMenu: false,
        // enableEmptyCellDrop: false,
        // enableEmptyCellDrag: false,
        // enableOccupiedCellDrop: false,
        // emptyCellDragMaxCols: 50,
        // emptyCellDragMaxRows: 50,
        // ignoreMarginInRow: false,
        draggable: {
          enabled: false,
          stop: DashboardComponent.eventStop,
          start: DashboardComponent.eventStart,
          dropOverItems: false,
        },
        resizable: {
          enabled: false
        },
        pushItems: false,
        swap: true,
        swapWhileDragging: false,
        itemChangeCallback: (item, itemComponent)=> {
          // console.info('itemChanged', item, itemComponent);
        }
        // disableAutoPositionOnConflict: true
        // swap: true,
        // swapWhileDragging: false,
        // pushItems: true,
        // disablePushOnDrag: false,
        // disablePushOnResize: false,
        // pushDirections: { north: true, east: true, south: true, west: true },
        // pushResizeItems: false,
        // displayGrid: DisplayGrid.Always,
        // disableWindowResize: false,
        // disableWarnings: false,
        // scrollToNewItems: false
      };
      this.dashboard = [
        { id: 'std-cnt', cols: 3, rows: 1, y: 0, x: 0, initCallback: this.initItem.bind(this), bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'temp-cnt', cols: 3, rows: 1, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id: 'faculty-cnt', cols: 3, rows: 1, y: 0, x: 0 , bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0") },
        { id: 'present-cnt', cols: 3, rows: 1, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id: 'student-birthday', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id:'today-birthday', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id:'exam-mark', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id: 'attendance', cols:6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id:'upcoming-exam', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id: 'student-absent', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'video-link', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'unpaid-fees', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'inquiry', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'dashboard-timetable', cols: 12, rows: 5, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'calendar', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        // { id: 'fees-cnt', cols: 8, rows: 5, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        // { cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        // { id: 'scool-perfomance', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'homework', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'assignment', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id:'top-student-list', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id: 'staff-leave', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        // { id: 'timetable', cols: 8, rows: 6, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        // { id: 'timetable', cols: 8, rows: 6, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id: 'present-staff', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"),  },
        { id:'today-collection', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
        { id: 'proxy-timetable', cols: 12, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0") },
        // { id:'calender-cnt', cols: 6, rows: 4, y: 0, x: 0, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  },
      ];
  
      this.dashboard = this.dashboard.filter(item => {
        return permissions[item.id] !== false;
      });

      this.chd.detectChanges()
    }

  }

  static itemChange(item, itemComponent) {
    console.info('itemChanged', item, itemComponent);
  }

  ngAfterViewInit() {
   
  }

  initItem(item: GridsterItem, itemComponent: any): void {
    // console.log(">> itemComponent", itemComponent)
    // console.log(">> item", item)
    this.itemToPush = itemComponent;
  }

  getCount(){
    this.dashboardService.getCount().subscribe( (res:any) => {
      if(res?.status){
        this.countData = res?.data
      }
      this.chd.detectChanges()
    })
  }

  getClassList() {
    const payload = {
      academic_year_id: this.currentYear_id,
      branch_id    : this.branch_id,
      user_id      : this.user_id,
    }
    this.dashboardService.getClasslist(payload).subscribe((res: any) => {
      if (res?.status) {
        this.classes = [...this.classes, ...res?.data]
      }
    })
  }

  getBatchList() {
    const payload = {
      classes: []
    }
    this.dashboardService.getBatcheList(payload).subscribe((res: any) => {
      this.batches = res?.data
    })
  }

  // changedOptions(): void {
  //   if (this.options.api && this.options.api.optionsChanged) {
  //     this.options.api.optionsChanged();
  //   }
  // }

  // removeItem($event: MouseEvent | TouchEvent, item): void {
  //   $event.preventDefault();
  //   $event.stopPropagation();
  //   this.dashboard.splice(this.dashboard.indexOf(item), 1);
  // }

  // addItem(): void {
  //   this.dashboard.push({ x: 0, y: 0, cols: 2, rows: 1, bg: "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")  });
  // }

  // pushItem(): void {
  //   const push = new GridsterPush(this.itemToPush); // init the service
  //   this.itemToPush.$item.rows += 2; // move/resize your item
  //   if (push.pushItems(push.fromNorth)) {
  //     // push items from a direction
  //     push.checkPushBack(); // check for items can restore to original position
  //     push.setPushedItems(); // save the items pushed
  //     this.itemToPush.setSize();
  //     this.itemToPush.checkItemChanges(
  //       this.itemToPush.$item,
  //       this.itemToPush.item
  //     );
  //   } else {
  //     this.itemToPush.$item.rows -= 4;
  //     push.restoreItems(); // restore to initial state the pushed items
  //   }
  //   push.destroy(); // destroy push instance
  //   // similar for GridsterPushResize and GridsterSwap
  // }


}
